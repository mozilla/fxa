/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  PasskeySigninFlags,
  passkeySigninFeatureEnabled,
} from './should-show-passkey-signin';

/**
 * Whether the password-reset footer should read "Have a passkey or remember your
 * password? Sign in" versus the plain "Remember your password? Sign in".
 *
 * A passkey is only worth surfacing when it can substitute for resetting the
 * password:
 * - Pre-OTP pages (reset entry, OTP entry) don't know the account yet, so they
 *   pass `requireHasPasskey: false` and show the passkey wording whenever the
 *   feature is on and the keys guard allows it.
 * - Post-OTP pages pass `requireHasPasskey: true` and show it only for accounts
 *   that actually have a passkey (`hasPasskey === true`).
 *
 * Keys guard: `serviceRequiresKeys` describes the requested service (the flow) —
 * not the account — and is currently `integration.isSync()`. When the service
 * needs the account's encryption keys (Sync), a passkey authenticates but cannot
 * derive them, so the password is still required and the passkey wording is
 * suppressed. Fails closed.
 */
export function shouldShowPasskeyResetOption(
  config: PasskeySigninFlags,
  {
    hasPasskey,
    serviceRequiresKeys = false,
    requireHasPasskey = false,
  }: {
    hasPasskey?: boolean;
    serviceRequiresKeys?: boolean;
    requireHasPasskey?: boolean;
  }
): boolean {
  if (!passkeySigninFeatureEnabled(config)) {
    return false;
  }
  if (requireHasPasskey && hasPasskey !== true) {
    return false;
  }
  // TODO(FXA-14220): re-enable for Sync once passkey key-wraps can recover the
  // account's encryption keys without the password.
  if (serviceRequiresKeys) {
    return false;
  }
  return true;
}
