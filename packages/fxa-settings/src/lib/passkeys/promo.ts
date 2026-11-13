/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Config } from '../config';
import { isWebAuthnSupported } from './webauthn';
import { passwordlessSyncEnabled } from './should-show-passkey-signin';

// ponytail: per-device dismissal; per-account needs a server-side flag.
const DISMISS_FOR_MS = 60 * 24 * 60 * 60 * 1000;

export const PASSKEY_PROMO_PATH = '/passkey_promo';
export const PASSKEY_SYNC_PROMO_PATH = '/inline_passkey_sync_setup';

export const PASSKEY_PROMO_DISMISS_KEYS = {
  signin: '__fxa_storage.disable_promo.passkey-signin',
  signup: '__fxa_storage.disable_promo.passkey-signup',
  sync: '__fxa_storage.disable_promo.passkey-sync',
  settings: '__fxa_storage.disable_promo.account-protection',
} as const;

/** True when an account could create a passkey here, so a promo may show. */
export function canPromptForPasskey(
  config: Pick<Config, 'featureFlags'>,
  passkeyCount: number
): boolean {
  return !!(
    config.featureFlags?.passkeysEnabled &&
    config.featureFlags?.passkeyRegistrationEnabled &&
    passkeyCount === 0 &&
    isWebAuthnSupported()
  );
}

export function isPasskeyPromoDismissed(key: string, now = Date.now()) {
  const dismissedAt = Number(localStorage.getItem(key));
  return dismissedAt > 0 && now - dismissedAt < DISMISS_FOR_MS;
}

export function dismissPasskeyPromo(key: string, now = Date.now()) {
  localStorage.setItem(key, String(now));
}

/**
 * Checks that need no server call, run at the end of a Sync sign-in.
 * Passkey count is checked on the promo page.
 */
export function canOfferSyncPasskey(config: Pick<Config, 'featureFlags'>) {
  return (
    !!config.featureFlags?.passkeyPromoSyncEnabled &&
    passwordlessSyncEnabled(config) &&
    canPromptForPasskey(config, 0) &&
    !isPasskeyPromoDismissed(PASSKEY_PROMO_DISMISS_KEYS.sync)
  );
}
