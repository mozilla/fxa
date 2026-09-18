/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';
import { ERRNO } from '@fxa/accounts/errors';
import type AuthClient from 'fxa-auth-client/browser';
import type { PasskeyWrapEnvelope } from 'fxa-auth-client/browser';
import { base64urlToBytes } from '../../base64url';
import { getCredential } from '../webauthn';
import type { AuthUiError } from '../../auth-errors/auth-errors';
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
  | { ok: false; error: AuthUiError };

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

  // The server files the wrap under the proof's `sub`;
  // any other uid would result in sealing an envelope that never opens.
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
    if (
      (initialStoreError as AuthUiError).errno !== ERRNO.INVALID_MFA_TOKEN ||
      !sessionToken
    ) {
      return { ok: false, error: initialStoreError as AuthUiError };
    }
    // `stepUp` runs another passkey assertion, so the user sees a second
    // authenticator prompt here. Only the token is remade: the envelope is
    // already sealed, so this needs neither `kB` nor `prfOut`, both of which
    // the caller zeroed.
    let freshToken: string;
    try {
      freshToken = await stepUp(authClient, sessionToken, credentialId);
    } catch {
      // The token expiry is the real failure; the step-up was only the recovery
      // attempt, and a cancelled prompt throws a DOMException carrying no errno.
      return { ok: false, error: initialStoreError as AuthUiError };
    }
    // The replacement is spent here, with no user step in between, so expiry is
    // not a second concern and this attempt is the last one.
    try {
      return await store(authClient, freshToken, credentialId, envelope);
    } catch (retryStoreError) {
      return { ok: false, error: retryStoreError as AuthUiError };
    }
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

function uidFromMfaToken(mfaToken: string): string | undefined {
  try {
    const payload = mfaToken.split('.')[1];
    const { sub } = JSON.parse(
      new TextDecoder().decode(base64urlToBytes(payload))
    );
    return typeof sub === 'string' && /^[0-9a-f]{32}$/.test(sub)
      ? sub
      : undefined;
  } catch {
    return undefined;
  }
}

function isZeroed(bytes: Uint8Array): boolean {
  return bytes.every((byte) => byte === 0);
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((byte, i) => byte === b[i]);
}
