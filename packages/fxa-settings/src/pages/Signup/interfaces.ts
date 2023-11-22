/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  BaseIntegration,
  IntegrationType,
  OAuthIntegration,
} from '../../models';
import { SignupQueryParams } from '../../models/pages/signup';

export interface BeginSignupResponse {
  SignUp: {
    uid: string;
    sessionToken: hexstring;
    authAt: number;
    keyFetchToken: hexstring;
  };
}

// full list @ fxa-auth-client/lib/client.ts, probably port over?
export interface BeginSignUpOptions {
  service?: string;
  verificationMethod?: string;
  keys?: boolean;
}

export type BeginSignupHandler = (
  email: string,
  password: string
) => Promise<BeginSignupResult>;

export interface BeginSignupResult {
  data?: (BeginSignupResponse & { unwrapBKey: hexstring }) | null;
  error?: {
    errno: number;
    message: string;
    ftlId: string;
  };
}

export interface SignupProps {
  integration: SignupIntegration;
  queryParamModel: SignupQueryParams;
  beginSignupHandler: BeginSignupHandler;
  webChannelEngines: string[] | undefined;
  isSyncMobileWebChannel: boolean;
  isSync: boolean;
}

export type SignupIntegration = SignupOAuthIntegration | SignupBaseIntegration;

export interface SignupOAuthIntegration {
  type: IntegrationType.OAuth;
  getRedirectUri: () => ReturnType<OAuthIntegration['getRedirectUri']>;
  saveOAuthState: () => ReturnType<OAuthIntegration['saveOAuthState']>;
  getService: () => ReturnType<OAuthIntegration['getService']>;
}

export interface SignupBaseIntegration {
  type: IntegrationType;
  getService: () => ReturnType<BaseIntegration['getService']>;
}

export interface SignupFormData {
  email: string;
  newPassword: string;
  confirmPassword: string;
  age: string;
}
