/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { HandledError } from '../../../lib/error-utils';
import { Integration } from '../../../models';

export interface ResetPasswordRecoveryPhoneContainerProps {
  integration: Integration;
}

export type ResetPasswordRecoveryPhoneProps = {
  lastFourPhoneDigits: string;
  verifyCode: (code: string) => Promise<HandledError | void>;
  resendCode: () => Promise<HandledError | void>;
};
