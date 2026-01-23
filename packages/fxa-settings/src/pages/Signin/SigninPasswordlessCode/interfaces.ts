/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { SigninIntegration } from '../interfaces';

export interface PasswordlessLocationState {
  email: string;
  // Service/client_id for metrics
  service?: string;
  // True if user came from signup flow (new account)
  isSignup?: boolean;
}

export interface SigninPasswordlessCodeContainerProps {
  integration: SigninIntegration;
  serviceName: string;
  setCurrentSplitLayout?: (value: boolean) => void;
}

export interface SigninPasswordlessCodeProps {
  email: string;
  integration: SigninIntegration;
  finishOAuthFlowHandler: FinishOAuthFlowHandler;
  setCurrentSplitLayout?: (value: boolean) => void;
  // True if user is signing up (new account)
  isSignup?: boolean;
}

export interface PasswordlessConfirmCodeResponse {
  uid: string;
  sessionToken: string;
  verified: boolean;
  authAt: number;
  isNewAccount: boolean;
}
