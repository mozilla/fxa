/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SignInOptions } from 'fxa-auth-client/browser';
import { FinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { BeginSigninResult, SigninIntegration } from '../interfaces';

export interface SigninUnblockLocationState {
  email: string;
  hasLinkedAccount: boolean;
  hasPassword: boolean;
  authPW: string;
}

export interface SigninUnblockProps {
  email: string;
  hasLinkedAccount: boolean;
  hasPassword: boolean;
  resendUnblockCodeHandler: ResendUnblockCodeHandler;
  signinWithUnblockCode: (code: string) => Promise<BeginSigninResult>;
  finishOAuthFlowHandler: FinishOAuthFlowHandler;
  integration: SigninIntegration;
}

export type BeginSigninWithUnblockCodeHandler = (
  code: string,
  authEmail?: string,
  signInOptions?: SignInOptions
) => Promise<BeginSigninResult>;

export type SigninWithUnblockCode = (code: string) => void;

export type ResendUnblockCodeHandler = () => Promise<ResendUnblockCodeResult>;

export interface ResendUnblockCodeResult {
  success: boolean;
  localizedErrorMessage?: string;
}
