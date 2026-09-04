/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Integration } from '../../models';

export type ResetPasswordIntegration = Pick<
  Integration,
  'getCmsInfo' | 'isSync'
>;

/**
 * Passkey-aware reset-messaging signals from the /password/forgot/verify_otp
 * response, threaded through the reset flow.
 *
 * `hasPasskeyWraps` means the account holds a key-wrap, so a passkey can recover
 * its encryption keys without the password.
 */
export type PasskeyResetSignals = {
  hasPasskey?: boolean;
  hasPasskeyWraps?: boolean;
};
