/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';
import { ERRNO } from '@fxa/accounts/errors';
import type AuthClient from 'fxa-auth-client/browser';
import type { StoredPasskeyWrap } from 'fxa-auth-client/browser';
import { isAuthUiError } from '../../auth-errors/auth-errors';
import { openWrapEnvelope } from '../../passkey-crypto';
import { isZeroed } from '../../passkey-crypto/assert';
import { KB_BYTES, PRF_OUT_BYTES } from '../../passkey-crypto/constants';

type UnwrapPasskeyKbArgs = {
  mfaToken: string;
  /** The account the envelope is bound to, derived from `mfaToken` by the caller. */
  uid: string;
  credentialId: string;
  prfOut: Uint8Array;
};
export type UnwrapPasskeyKbResult =
  | { ok: true; kB: Uint8Array }
  /** `no_wrap` and `stale` are the cases a new store fixes. */
  | { ok: false; reason: 'no_wrap' | 'stale' | 'failed' };

// Refusals that need no engineering fix, so not reported: the passkey deleted
// elsewhere, or a rate limit or block from customs or the WAF. A refused proof
// or a disabled server flag means a bug or misconfiguration, so both report.
const EXPECTED_FETCH_ERRNOS = new Set<number>([
  ERRNO.PASSKEY_NOT_FOUND,
  ERRNO.THROTTLED,
  ERRNO.REQUEST_BLOCKED,
]);

// fetch rejects with a TypeError worded per engine when the network fails.
// Any other TypeError is a bug, and so is a wording missing from this list.
const FETCH_NETWORK_ERROR_MESSAGES = new Set([
  'Failed to fetch', // Chromium
  'NetworkError when attempting to fetch resource.', // Gecko
  'Load failed', // WebKit
]);

/** Never throws. Leaves `prfOut` for the caller to zero. */
export async function unwrapPasskeyKb(
  authClient: Pick<AuthClient, 'getPasskeyWrap'>,
  { mfaToken, uid, credentialId, prfOut }: UnwrapPasskeyKbArgs
): Promise<UnwrapPasskeyKbResult> {
  // A short or spent buffer can never open the wrap, and trying would
  // report a healthy wrap as broken; `creation.ts` refuses the same input.
  if (prfOut.length !== PRF_OUT_BYTES || isZeroed(prfOut)) {
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
    // Neither a network failure nor the client's timeout is actionable.
    const offlineOrTimedOut =
      (err instanceof TypeError &&
        FETCH_NETWORK_ERROR_MESSAGES.has(err.message)) ||
      (err instanceof DOMException && err.name === 'AbortError');
    const expected =
      errno === undefined
        ? offlineOrTimedOut
        : EXPECTED_FETCH_ERRNOS.has(errno);
    if (!expected) {
      Sentry.captureException(new Error('passkey-wrap-fetch error'), {
        tags: {
          errno: String(errno ?? 'none'),
          // The type, not the message, which can carry a backend error body.
          ...(errno === undefined &&
            err instanceof Error && { name: err.name }),
        },
      });
    }
    return { ok: false, reason: 'failed' };
  }

  // Every stored wrap opened once when it was sealed, so a current one that
  // no longer yields a usable kB is a bug. The password step supplies kB.
  const undecryptable = (): UnwrapPasskeyKbResult => {
    Sentry.captureException(new Error('passkey-wrap-decrypt error'));
    return { ok: false, reason: 'failed' };
  };
  let kB: Uint8Array;
  try {
    kB = await openWrapEnvelope({ envelope, prfOut, uid, credentialId });
  } catch {
    return undecryptable();
  }
  // An envelope sealed over a buffer that was zeroed mid-seal still
  // verifies, so the AEAD tag alone cannot vouch for the bytes inside.
  if (kB.length !== KB_BYTES || isZeroed(kB)) {
    kB.fill(0);
    return undecryptable();
  }
  return { ok: true, kB };
}
