/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';
import { ERRNO } from '@fxa/accounts/errors';
import type AuthClient from 'fxa-auth-client/browser';
import type { PasskeyWrapEnvelope } from 'fxa-auth-client/browser';
import { getCredential } from '../webauthn';
import {
  categorizeWebAuthnError,
  WebAuthnErrorCategory,
} from '../webauthn-errors';
import {
  AuthUiErrors,
  isAuthUiError,
  type AuthUiError,
} from '../../auth-errors/auth-errors';
import { uidFromMfaToken } from '../../mfa-guard-utils';
import { createWrapEnvelope, openWrapEnvelope } from '../../passkey-crypto';
import { PRF_OUT_BYTES } from '../../passkey-crypto/constants';

export type PasskeyWrapClientFailure =
  | 'prf_unsupported'
  | 'proof_malformed'
  | 'key_unusable'
  | 'platform_crypto';

/**
 * `mfaToken` and `prfOut` must come from the same ceremony. `sessionToken`
 * lets an expired `mfaToken` be replaced by a fresh step-up; without it the
 * expiry is reported as-is.
 *
 * `kB` and `prfOut` are zeroed here and read across awaits, so they must be
 * buffers nothing else can mutate meanwhile: zeroes arriving mid-seal are
 * sealed as the key, and the round-trip check cannot tell them apart.
 */
export type CreatePasskeyWrapArgs = {
  credentialId: string;
  mfaToken: string;
  sessionToken?: hexstring | null;
  prfOut?: Uint8Array;
  kB: Uint8Array;
};

type WrapAuthClient = Pick<
  AuthClient,
  | 'createPasskeyWrap'
  | 'beginPasskeyVerification'
  | 'completePasskeyVerification'
>;

export type CreatePasskeyWrapResult =
  | { ok: true; created: boolean }
  | { ok: false; failure: PasskeyWrapClientFailure }
  | { ok: false; error: AuthUiError }
  /**
   * The envelope was sealed but not stored, for a reason another attempt can
   * clear: a prompt the user dismissed, or a rate limit that will lapse. It
   * carries no key material, so `retryPasskeyWrapStore` can submit it again
   * without resealing. `error` is set when a server refusal, rather than the
   * prompt, is what stopped it.
   */
  | {
      ok: false;
      retryable: true;
      envelope: PasskeyWrapEnvelope;
      error?: AuthUiError;
    };

export async function createPasskeyWrap(
  authClient: WrapAuthClient,
  { credentialId, mfaToken, sessionToken, prfOut, kB }: CreatePasskeyWrapArgs
): Promise<CreatePasskeyWrapResult> {
  if (prfOut?.length !== PRF_OUT_BYTES) {
    return { ok: false, failure: 'prf_unsupported' };
  }
  // Both buffers are zeroed after a sealing attempt; a retry with the same
  // arguments would otherwise seal an all-zero kB the server cannot flag.
  if (isZeroed(kB) || isZeroed(prfOut)) {
    return { ok: false, failure: 'key_unusable' };
  }

  const uid = uidFromMfaToken(mfaToken);
  if (!uid) {
    return { ok: false, failure: 'proof_malformed' };
  }

  let envelope: PasskeyWrapEnvelope;
  let recovered: Uint8Array | undefined;
  try {
    envelope = await createWrapEnvelope({ kB, prfOut, uid, credentialId });
    // A divergent EC export (see `key-wrap.ts`) seals envelopes that never open.
    recovered = await openWrapEnvelope({ envelope, prfOut, uid, credentialId });
    if (!bytesEqual(recovered, kB)) {
      throw new Error('recovered kB did not match');
    }
  } catch {
    Sentry.captureException(new Error('passkey-wrap-seal error'));
    return { ok: false, failure: 'platform_crypto' };
  } finally {
    // Sealed or not, the key material does not outlive the attempt.
    kB.fill(0);
    prfOut.fill(0);
    recovered?.fill(0);
  }

  return storeSealedEnvelope(
    authClient,
    { credentialId, mfaToken, sessionToken },
    envelope
  );
}

/**
 * Submits the sealed envelope, minting a fresh MFA token once if the one from
 * sign-in has expired. That token lives ten minutes, which the password step
 * and the user's pause on the offer can outlast.
 */
async function storeSealedEnvelope(
  authClient: WrapAuthClient,
  {
    credentialId,
    mfaToken,
    sessionToken,
  }: Pick<CreatePasskeyWrapArgs, 'credentialId' | 'mfaToken' | 'sessionToken'>,
  envelope: PasskeyWrapEnvelope
): Promise<CreatePasskeyWrapResult> {
  try {
    return await store(authClient, mfaToken, credentialId, envelope);
  } catch (initialStoreError) {
    const error = toAuthUiError(initialStoreError);
    // A rate limit lapses, so the offer stays up with the envelope to
    // resubmit once it has.
    if (error.errno === ERRNO.THROTTLED) {
      return { ok: false, retryable: true, envelope, error };
    }
    if (error.errno !== ERRNO.INVALID_MFA_TOKEN || !sessionToken) {
      return { ok: false, error };
    }
    return retryPasskeyWrapStore(
      authClient,
      { credentialId, sessionToken },
      envelope
    );
  }
}

/**
 * Mints a replacement MFA token and submits an already-sealed envelope with
 * it. The user sees an authenticator prompt, since the step-up runs another
 * passkey assertion.
 *
 * Exported so the opt-in page can call this again after a dismissed or
 * timed-out prompt: the envelope holds only ciphertext, so a retry needs
 * neither `kB` nor `prfOut`.
 */
export async function retryPasskeyWrapStore(
  authClient: WrapAuthClient,
  {
    credentialId,
    sessionToken,
  }: { credentialId: string; sessionToken: hexstring },
  envelope: PasskeyWrapEnvelope
): Promise<CreatePasskeyWrapResult> {
  let freshToken: string;
  try {
    freshToken = await stepUp(authClient, sessionToken, credentialId);
  } catch (stepUpError) {
    // The step-up spans two server calls either side of the ceremony, so a
    // refusal here can carry an errno — a rate limit, most usefully. Pass it
    // on: `categorizeWebAuthnError` only reads DOMExceptions and TypeErrors,
    // and would flatten everything else to the generic failure.
    if (isAuthUiError(stepUpError)) {
      return stepUpError.errno === ERRNO.THROTTLED
        ? { ok: false, retryable: true, envelope, error: stepUpError }
        : { ok: false, error: stepUpError };
    }
    const categorized = categorizeWebAuthnError(stepUpError, 'authentication');
    if (categorized.category === WebAuthnErrorCategory.UserAction) {
      return { ok: false, retryable: true, envelope };
    }
    if (categorized.logToSentry) {
      Sentry.captureException(stepUpError);
    }
    // A DOMException carries no errno for the caller to map.
    return { ok: false, error: AuthUiErrors.UNEXPECTED_ERROR };
  }
  // The replacement is spent here, with no user step in between, so expiry is
  // not a second concern.
  try {
    return await store(authClient, freshToken, credentialId, envelope);
  } catch (retryStoreError) {
    const error = toAuthUiError(retryStoreError);
    // The limit lapses and the envelope outlives it, so the offer can stay up
    // to resubmit rather than spending the prompt this step-up just cost.
    return error.errno === ERRNO.THROTTLED
      ? { ok: false, retryable: true, envelope, error }
      : { ok: false, error };
  }
}

async function store(
  authClient: WrapAuthClient,
  mfaToken: string,
  credentialId: string,
  envelope: PasskeyWrapEnvelope
): Promise<CreatePasskeyWrapResult> {
  const { created } = await authClient.createPasskeyWrap(
    mfaToken,
    credentialId,
    envelope
  );
  return { ok: true, created };
}

/** Mints an `mfa:passkey` token pinned to the passkey the wrap is for. */
async function stepUp(
  authClient: WrapAuthClient,
  sessionToken: hexstring,
  credentialId: string
): Promise<string> {
  const options = await authClient.beginPasskeyVerification(sessionToken, {
    scope: 'passkey',
    credentialId,
  });
  const response = await getCredential(options);
  const { mfaToken } = await authClient.completePasskeyVerification(
    sessionToken,
    response,
    options.challenge
  );
  return mfaToken;
}

/** A network TypeError or other non-auth throw has no errno to word. */
function toAuthUiError(err: unknown): AuthUiError {
  return isAuthUiError(err) ? err : AuthUiErrors.UNEXPECTED_ERROR;
}

export function isZeroed(bytes: Uint8Array): boolean {
  return bytes.every((byte) => byte === 0);
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((byte, i) => byte === b[i]);
}
