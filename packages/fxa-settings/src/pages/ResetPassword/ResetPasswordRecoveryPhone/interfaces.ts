/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { HandledError } from '../../../lib/error-utils';
import { CompleteResetPasswordLocationState } from '../CompleteResetPassword/interfaces';

export type ResetPasswordRecoveryPhoneLocationState =
  CompleteResetPasswordLocationState & {
    lastFourPhoneDigits: string;
    numBackupCodes?: number;
  };

export type ResetPasswordRecoveryPhoneProps = {
  lastFourPhoneDigits: string;
  verifyCode: (code: string) => Promise<HandledError | void>;
  resendCode: () => Promise<HandledError | void>;
  numBackupCodes?: number;
};
