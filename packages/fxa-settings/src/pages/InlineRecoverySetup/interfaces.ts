/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FinishOAuthFlowHandlerResult } from '../../lib/oauth/hooks';
import { MozServices } from '../../lib/types';
import { SigninLocationState, TotpToken } from './../Signin/interfaces';

export type SigninRecoveryLocationState = SigninLocationState & {
  totp: TotpToken;
};

export interface InlineRecoverySetupProps {
  oAuthError?: FinishOAuthFlowHandlerResult['error'];
  recoveryCodes: Array<string>;
  serviceName?: MozServices;
  cancelSetupHandler: () => void;
  verifyTotpHandler: () => Promise<boolean>;
  successfulSetupHandler: () => void;
  email: string;
}
