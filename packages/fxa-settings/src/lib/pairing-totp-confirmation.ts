/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Firefox opens the approval page as a new navigation, so a TOTP confirmation
 * from `/pair` travels in localStorage. It is one-shot and short-lived.
 */

import Storage from './storage';

export const PAIRING_TOTP_CONFIRMATION_STORAGE_KEY =
  'pairing_totp_confirmation';

/** Covers scanning the QR code and approving, not a later pairing. */
export const PAIRING_TOTP_CONFIRMATION_TTL_MS = 10 * 60 * 1000;

type StoredConfirmation = { uid: string; createdAt: number };

function storage(): Storage {
  return Storage.factory('localStorage');
}

export function markPairingTotpConfirmed(
  uid: string,
  now: number = Date.now()
): void {
  const stored: StoredConfirmation = { uid, createdAt: now };
  try {
    storage().set(PAIRING_TOTP_CONFIRMATION_STORAGE_KEY, stored);
  } catch {
    // localStorage may be unavailable; the approval page then asks again.
  }
}

/**
 * True when `uid` confirmed TOTP on `/pair` within the TTL. Always clears the
 * confirmation, so it can skip at most one prompt.
 */
export function consumePairingTotpConfirmation(
  uid: string | undefined,
  now: number = Date.now()
): boolean {
  let stored: StoredConfirmation | undefined;
  try {
    stored = storage().get(PAIRING_TOTP_CONFIRMATION_STORAGE_KEY);
    storage().remove(PAIRING_TOTP_CONFIRMATION_STORAGE_KEY);
  } catch {
    return false;
  }

  return (
    !!uid &&
    stored?.uid === uid &&
    typeof stored.createdAt === 'number' &&
    now >= stored.createdAt &&
    now - stored.createdAt < PAIRING_TOTP_CONFIRMATION_TTL_MS
  );
}
