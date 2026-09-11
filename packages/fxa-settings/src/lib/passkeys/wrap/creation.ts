/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';
import { ERRNO } from '@fxa/accounts/errors';
import type AuthClient from 'fxa-auth-client/browser';
import type {
  AuthServerError,
  PasskeyWrapEnvelope,
} from 'fxa-auth-client/browser';
import { base64urlToBytes } from '../../base64url';
import { isInvalidJwtError } from '../../mfa-guard-utils';
import { createWrapEnvelope, openWrapEnvelope } from '../../passkey-crypto';
import { KB_BYTES, PRF_OUT_BYTES } from '../../passkey-crypto/constants';

/**
 * Why a wrap could not be stored. The server answers 401, 403 and 404 for more
 * than one condition each, so callers branch on these rather than on status.
 * TODO: FXA-13151 maps them to user-facing strings at the surface that shows them.
 */
export type PasskeyWrapFailure =
  /** No PRF output, or the wrong width: this passkey cannot hold a wrap. */
  | 'prf_unsupported'
  /** The envelope this platform sealed could not be opened again. */
  | 'platform_crypto'
  /** The proof names no account, or was spent or expired (errno 223, 110). */
  | 'proof_invalid'
  /** No such passkey on the account (errno 224). */
  | 'passkey_not_found'
  /**
   * A different wrap is already stored for this passkey (errno 235): an
   * earlier attempt's response was lost, or the wrap predates a key rotation
   * and the passkey must be re-enrolled. The client cannot tell which.
   */
  | 'wrap_conflict'
  /** Customs refused the request (errno 114, 125). */
  | 'throttled'
  /** Passwordless Sync is switched off server-side (errno 202). */
  | 'feature_disabled'
  | 'unexpected';

export type CreatePasskeyWrapArgs = {
  /** WebAuthn credential id, base64url, as stored in `passkeys`. */
  credentialId: string;
  /** MFA JWT scoped `mfa:passkey` and bound to `credentialId`. */
  mfaToken: string;
  /** PRF output from the ceremony that produced `mfaToken`, if any. */
  prfOut?: Uint8Array;
  /** The 32 bytes the wrap seals. */
  kB: Uint8Array;
};

/** The auth-client error fields callers may safely inspect or report. */
export type PasskeyWrapCause = Pick<
  AuthServerError,
  'errno' | 'code' | 'retryAfter'
>;

export type CreatePasskeyWrapResult =
  /** `created` is false when an identical envelope was already stored. */
  | { ok: true; created: boolean }
  | { ok: false; failure: PasskeyWrapFailure; cause?: PasskeyWrapCause };

/** Pick<> so tests can pass minimal mocks without `as any`. */
export type PasskeyWrapAuthClient = Pick<AuthClient, 'createPasskeyWrap'>;

/**
 * Seals `kB` to the passkey's PRF output and stores the envelope under the
 * proof. `kB` and `prfOut` are zeroed in place once sealing has been tried,
 * whatever the outcome; the two pre-flight rejections (`prf_unsupported`,
 * `proof_invalid`) leave them intact. A caller holding `kB` as a hex string
 * still owns that copy.
 *
 * The store is create-only and nothing is held for retry: a second call after
 * a lost response answers `wrap_conflict`.
 *
 * @throws on a wrong-width `kB` — a caller bug, not an outcome.
 */
export async function createPasskeyWrap(
  authClient: PasskeyWrapAuthClient,
  { credentialId, mfaToken, prfOut, kB }: CreatePasskeyWrapArgs
): Promise<CreatePasskeyWrapResult> {
  if (kB.length !== KB_BYTES) {
    throw new Error(`kB must be ${KB_BYTES} bytes`);
  }
  if (prfOut?.length !== PRF_OUT_BYTES) {
    return { ok: false, failure: 'prf_unsupported' };
  }

  // The server files the wrap under the proof's `sub`. Sealing against any
  // other account id stores an envelope that never opens, and the round trip
  // below cannot tell. The signature is the server's to verify.
  const uid = uidFromMfaToken(mfaToken);
  if (!uid) {
    return { ok: false, failure: 'proof_invalid' };
  }

  let envelope: PasskeyWrapEnvelope;
  try {
    envelope = await createWrapEnvelope({ kB, prfOut, uid, credentialId });
    // Sealing never runs the open half. A platform whose EC export diverges
    // (see `key-wrap.ts`) seals well-formed envelopes that never open.
    const recovered = await openWrapEnvelope({
      envelope,
      prfOut,
      uid,
      credentialId,
    });
    const matches = bytesEqual(recovered, kB);
    recovered.fill(0);
    if (!matches) {
      throw new Error('recovered kB did not match');
    }
  } catch {
    Sentry.captureException(new Error('passkey-wrap-seal error'));
    return { ok: false, failure: 'platform_crypto' };
  } finally {
    // Nothing is kept for a retry; a caller that wants one runs a fresh
    // ceremony.
    kB.fill(0);
    prfOut.fill(0);
  }

  try {
    const { created } = await authClient.createPasskeyWrap(
      mfaToken,
      credentialId,
      envelope
    );
    return { ok: true, created };
  } catch (err) {
    const failure = toFailure(err);
    const cause = causeOf(err);
    if (failure === 'unexpected') {
      Sentry.captureException(new Error('passkey-wrap-store error'), {
        tags: { errno: String(cause?.errno ?? 'none') },
      });
    }
    return { ok: false, failure, ...(cause ? { cause } : {}) };
  }
}

function toFailure(err: unknown): PasskeyWrapFailure {
  // Shared with the MfaGuard hosts so the two cannot drift.
  if (isInvalidJwtError(err)) {
    return 'proof_invalid';
  }
  switch (causeOf(err)?.errno) {
    case ERRNO.PASSKEY_NOT_FOUND:
      return 'passkey_not_found';
    case ERRNO.PASSKEY_WRAP_CONFLICT:
      return 'wrap_conflict';
    case ERRNO.THROTTLED:
    case ERRNO.REQUEST_BLOCKED:
      return 'throttled';
    case ERRNO.FEATURE_NOT_ENABLED:
      return 'feature_disabled';
    default:
      return 'unexpected';
  }
}

function causeOf(err: unknown): PasskeyWrapCause | undefined {
  if (err == null || typeof err !== 'object') {
    return undefined;
  }
  const { errno, code, retryAfter } = err as AuthServerError;
  if (errno === undefined && code === undefined && retryAfter === undefined) {
    return undefined;
  }
  return { errno, code, retryAfter };
}

/** The `sub` claim as the lowercase hex uid the envelope context expects. */
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

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((byte, i) => byte === b[i]);
}
