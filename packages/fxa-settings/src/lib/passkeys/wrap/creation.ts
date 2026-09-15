/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';
import type AuthClient from 'fxa-auth-client/browser';
import type { PasskeyWrapEnvelope } from 'fxa-auth-client/browser';
import { base64urlToBytes } from '../../base64url';
import type { AuthUiError } from '../../auth-errors/auth-errors';
import { createWrapEnvelope, openWrapEnvelope } from '../../passkey-crypto';
import { PRF_OUT_BYTES } from '../../passkey-crypto/constants';

// TODO: FXA-13151 maps these to user-facing strings.
export type PasskeyWrapClientFailure =
  | 'prf_unsupported'
  | 'proof_malformed'
  | 'key_unusable'
  | 'platform_crypto';

/** `mfaToken` and `prfOut` must come from the same ceremony. */
export type CreatePasskeyWrapArgs = {
  credentialId: string;
  mfaToken: string;
  prfOut?: Uint8Array;
  kB: Uint8Array;
};

export type CreatePasskeyWrapResult =
  | { ok: true; created: boolean }
  | { ok: false; failure: PasskeyWrapClientFailure }
  | { ok: false; error: AuthUiError };

/** Zeroes `kB` and `prfOut` once sealing is attempted. */
export async function createPasskeyWrap(
  authClient: Pick<AuthClient, 'createPasskeyWrap'>,
  { credentialId, mfaToken, prfOut, kB }: CreatePasskeyWrapArgs
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
    kB.fill(0);
    prfOut.fill(0);
    recovered?.fill(0);
  }

  try {
    const { created } = await authClient.createPasskeyWrap(
      mfaToken,
      credentialId,
      envelope
    );
    return { ok: true, created };
  } catch (err) {
    return { ok: false, error: err as AuthUiError };
  }
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
