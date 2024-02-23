/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BeginSigninResult } from '../interfaces';

export interface SigninUnblockLocationState {
  email: string;
  hasLinkedAccount: boolean;
  hasPassword: boolean;
  password: string;
}

export interface SigninUnblockProps {
  email: string;
  hasLinkedAccount: boolean;
  hasPassword: boolean;
  resendUnblockCodeHandler: ResendUnblockCodeHandler;
  signinWithUnblockCode: (code: string) => Promise<BeginSigninResult>;
  wantsTwoStepAuthentication?: boolean;
}

export type BeginSigninWithUnblockCodeHandler = (
  code: string
) => Promise<BeginSigninResult>;

export type SigninWithUnblockCode = (code: string) => void;

export type ResendUnblockCodeHandler = () => Promise<ResendUnblockCodeResult>;

export interface ResendUnblockCodeResult {
  success: boolean;
  localizedErrorMessage?: string;
}
