/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  PasskeySigninFlags,
  passkeySigninFeatureEnabled,
  passwordlessSyncEnabled,
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
 * needs the account's encryption keys (Sync), a passkey is only an alternative
 * to the password if the account has a key-wrap the passkey can unwrap those
 * keys from (`hasPasskeyWraps`) AND sign-in can actually perform that unwrap
 * (`passkeyPasswordlessSyncEnabled`). Wrap storage and wrap consumption ship
 * under one flag but not necessarily in one release, so without the flag the
 * footer would send a user who has forgotten their password to a passkey
 * sign-in that asks for it again. Fails closed, so the pre-OTP pages — which
 * don't know the account and so can't know its wraps — never show the passkey
 * wording for Sync.
 */
export function shouldShowPasskeyResetOption(
  config: PasskeySigninFlags,
  {
    hasPasskey,
    hasPasskeyWraps,
    serviceRequiresKeys = false,
    requireHasPasskey = false,
  }: {
    hasPasskey?: boolean;
    hasPasskeyWraps?: boolean;
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
  if (
    serviceRequiresKeys &&
    !(hasPasskeyWraps === true && passwordlessSyncEnabled(config))
  ) {
    return false;
  }
  return true;
}
