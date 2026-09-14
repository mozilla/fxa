/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';
import { ERRNO } from '@fxa/accounts/errors';
import type AuthClient from 'fxa-auth-client/browser';
import { openWrapEnvelope } from '../../passkey-crypto';
import { PRF_OUT_BYTES } from '../../passkey-crypto/constants';

export type PasskeyFallbackReason =
  | 'no_wrap'
  | 'no_prf'
  | 'passkey_not_found'
  | 'proof_invalid'
  | 'stale'
  | 'decrypt_failed'
  | 'fetch_failed';

export type UnwrapPasskeyKbArgs = {
  mfaToken: string;
  credentialId: string;
  uid: string;
  prfOut?: Uint8Array;
};
export type UnwrapPasskeyKbResult =
  | { ok: true; kB: Uint8Array }
  | { ok: false; reason: PasskeyFallbackReason };

const FETCH_ERRNO_REASONS: Record<number, PasskeyFallbackReason> = {
  [ERRNO.PASSKEY_WRAP_NOT_FOUND]: 'no_wrap',
  [ERRNO.PASSKEY_NOT_FOUND]: 'passkey_not_found',
  [ERRNO.INVALID_MFA_TOKEN]: 'proof_invalid',
  [ERRNO.PASSKEY_WRAP_STALE]: 'stale',
};

/** Zeroes `prfOut` whatever the outcome. Never throws. */
export async function unwrapPasskeyKb(
  authClient: Pick<AuthClient, 'getPasskeyWrap'>,
  { mfaToken, credentialId, uid, prfOut }: UnwrapPasskeyKbArgs
): Promise<UnwrapPasskeyKbResult> {
  if (prfOut?.length !== PRF_OUT_BYTES) {
    prfOut?.fill(0);
    return { ok: false, reason: 'no_prf' };
  }
  try {
    const { createdAt: _createdAt, ...envelope } =
      await authClient.getPasskeyWrap(mfaToken, credentialId);
    try {
      return {
        ok: true,
        kB: await openWrapEnvelope({ envelope, prfOut, uid, credentialId }),
      };
    } catch {
      return { ok: false, reason: 'decrypt_failed' };
    }
  } catch (err) {
    const errno = (err as { errno?: number })?.errno;
    const reason = errno !== undefined ? FETCH_ERRNO_REASONS[errno] : undefined;
    if (!reason) {
      Sentry.captureException(new Error('passkey-wrap-fetch error'), {
        tags: { errno: String(errno ?? 'none') },
      });
    }
    return { ok: false, reason: reason ?? 'fetch_failed' };
  } finally {
    prfOut.fill(0);
  }
}
