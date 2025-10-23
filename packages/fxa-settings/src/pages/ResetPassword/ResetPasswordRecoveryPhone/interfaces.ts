/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AuthUiError } from '../../../lib/auth-errors/auth-errors';
import { HandledError } from '../../../lib/error-utils';
import { CompleteResetPasswordLocationState } from '../CompleteResetPassword/interfaces';

export type ResetPasswordRecoveryPhoneLocationState =
  CompleteResetPasswordLocationState & {
    lastFourPhoneDigits: string;
    /**
     * If a send attempt was made before navigating to the recovery phone page and
     * it failed, the originating route passes along the error so we can surface
     * the correct banner immediately. Optional because initial send may have
     * succeeded.
     */
    sendError?: AuthUiError;
    /**
     * Count of remaining backup codes. Used only for routing from error banner
     * links, but harmless to include here for parity with sign-in flow.
     */
    numBackupCodes?: number;
  };

export type ResetPasswordRecoveryPhoneProps = {
  lastFourPhoneDigits: string;
  verifyCode: (code: string) => Promise<HandledError | void>;
  resendCode: () => Promise<HandledError | void>;
  sendError?: AuthUiError;
  numBackupCodes?: number;
};
