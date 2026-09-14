/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';
import { ERRNO } from '@fxa/accounts/errors';
import type AuthClient from 'fxa-auth-client/browser';
import type { StoredPasskeyWrap } from 'fxa-auth-client/browser';
import { isAuthUiError } from '../../auth-errors/auth-errors';
import { openWrapEnvelope } from '../../passkey-crypto';
import { isZeroed } from './creation';
import { KB_BYTES, PRF_OUT_BYTES } from '../../passkey-crypto/constants';

type UnwrapPasskeyKbArgs = {
  mfaToken: string;
  /** The account the envelope is bound to, derived from `mfaToken` by the caller. */
  uid: string;
  credentialId: string;
  prfOut?: Uint8Array;
};
export type UnwrapPasskeyKbResult =
  | { ok: true; kB: Uint8Array }
  /** `no_wrap` and `stale` are the cases a new store fixes. */
  | { ok: false; reason: 'no_wrap' | 'stale' | 'failed' };

// Refusals seen in normal operation, so not reported: the passkey deleted
// elsewhere, the proof refused, the server flag lagging the client's, or a
// rate limit or block from customs or the WAF.
const EXPECTED_FETCH_ERRNOS = new Set<number>([
  ERRNO.PASSKEY_NOT_FOUND,
  ERRNO.INVALID_MFA_TOKEN,
  ERRNO.FEATURE_NOT_ENABLED,
  ERRNO.THROTTLED,
  ERRNO.REQUEST_BLOCKED,
]);

/** Never throws. Leaves `prfOut` for the caller to zero. */
export async function unwrapPasskeyKb(
  authClient: Pick<AuthClient, 'getPasskeyWrap'>,
  { mfaToken, uid, credentialId, prfOut }: UnwrapPasskeyKbArgs
): Promise<UnwrapPasskeyKbResult> {
  // A missing or spent buffer can never open the wrap, and trying would
  // report a healthy wrap as broken; `creation.ts` refuses the same input.
  if (prfOut?.length !== PRF_OUT_BYTES || isZeroed(prfOut)) {
    return { ok: false, reason: 'failed' };
  }

  let envelope: StoredPasskeyWrap;
  try {
    envelope = await authClient.getPasskeyWrap(mfaToken, credentialId);
  } catch (err) {
    const errno = isAuthUiError(err) ? err.errno : undefined;
    if (errno === ERRNO.PASSKEY_WRAP_NOT_FOUND) {
      return { ok: false, reason: 'no_wrap' };
    }
    if (errno === ERRNO.PASSKEY_WRAP_STALE) {
      return { ok: false, reason: 'stale' };
    }
    // fetch rejects with a TypeError when offline and an AbortError on the
    // client's timeout; neither is actionable.
    const offlineOrTimedOut =
      err instanceof TypeError ||
      (err instanceof DOMException && err.name === 'AbortError');
    const expected =
      errno === undefined
        ? offlineOrTimedOut
        : EXPECTED_FETCH_ERRNOS.has(errno);
    if (!expected) {
      Sentry.captureException(new Error('passkey-wrap-fetch error'), {
        tags: { errno: String(errno ?? 'none') },
      });
    }
    return { ok: false, reason: 'failed' };
  }

  // A wrap that is present and current yet yields no usable kB is a dead end
  // the user cannot clear themselves, so the next sign-in repeats it forever.
  const deadEnd = (): UnwrapPasskeyKbResult => {
    Sentry.captureException(new Error('passkey-wrap-decrypt error'));
    return { ok: false, reason: 'failed' };
  };
  let kB: Uint8Array;
  try {
    kB = await openWrapEnvelope({ envelope, prfOut, uid, credentialId });
  } catch {
    return deadEnd();
  }
  // An envelope sealed over a buffer that was zeroed mid-seal still
  // verifies, so the AEAD tag alone cannot vouch for the bytes inside.
  if (kB.length !== KB_BYTES || isZeroed(kB)) {
    kB.fill(0);
    return deadEnd();
  }
  return { ok: true, kB };
}
