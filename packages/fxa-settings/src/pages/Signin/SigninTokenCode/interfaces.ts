/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AccountTotp } from '../../../lib/interfaces';
import { FinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { SigninIntegration, SigninLocationState } from '../interfaces';
import { SensitiveData } from './../../../lib/sensitive-data-client';

export type SigninTokenCodeProps = {
  finishOAuthFlowHandler: FinishOAuthFlowHandler;
  integration: SigninIntegration;
  signinState: SigninLocationState;
  onSessionVerified: (sessionId: string) => Promise<void>;
} & SensitiveData.AuthData;

export interface TotpStatusResponse {
  account: {
    totp: AccountTotp;
  };
}
