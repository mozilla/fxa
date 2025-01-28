/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BeginSigninError, HandledError } from '../../../lib/error-utils';
import { FinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { SensitiveData } from '../../../lib/sensitive-data-client';
import { SigninIntegration, SigninLocationState } from '../interfaces';

export type SigninRecoveryCodeProps = {
  finishOAuthFlowHandler: FinishOAuthFlowHandler;
  integration: SigninIntegration;
  navigateToRecoveryPhone: () => Promise<HandledError | void>;
  signinState: SigninLocationState;
  submitRecoveryCode: SubmitRecoveryCode;
  lastFourPhoneDigits?: string;
} & SensitiveData.AuthData;

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
