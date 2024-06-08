/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BeginSigninError } from '../../../lib/error-utils';
import { FinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { MozServices } from '../../../lib/types';
import { SigninIntegration, SigninLocationState } from '../interfaces';

export type SigninRecoveryCodeProps = {
  finishOAuthFlowHandler: FinishOAuthFlowHandler;
  integration: SigninIntegration;
  serviceName?: MozServices;
  signinState: SigninLocationState;
  submitRecoveryCode: SubmitRecoveryCode;
};

export type SubmitRecoveryCode = (
  code: string
) => Promise<SubmitRecoveryCodeResult>;

export type SubmitRecoveryCodeResult = {
  data?: ConsumeRecoveryCodeResponse | null;
  error?: BeginSigninError;
};

export type ConsumeRecoveryCodeResponse = {
  consumeRecoveryCode: { remaining: number };
};
