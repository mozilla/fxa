/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { HandledError } from '../../lib/error-utils';
import useSyncEngines from '../../lib/hooks/useSyncEngines';
import { Integration, OAuthIntegration } from '../../models';
import { MetricsContext } from '@fxa/shared/glean';

export interface BeginSignupResponse {
  signUp: {
    uid: string;
    sessionToken: hexstring;
    authAt: number;
    // keyFetchToken and unwrapBKey are included if options.keys=true
    keyFetchToken?: hexstring;
  };
  unwrapBKey?: hexstring;
}

// full list @ fxa-auth-client/lib/client.ts, probably port over?
export interface BeginSignUpOptions {
  service?: string;
  verificationMethod?: string;
  keys?: boolean;
  metricsContext: MetricsContext;
}

export type BeginSignupHandler = (
  email: string,
  password: string
) => Promise<BeginSignupResult>;

export interface BeginSignupResult {
  data?: BeginSignupResponse;
  error?: HandledError;
}

export interface SignupProps {
  integration: SignupIntegration;
  email: string;
  beginSignupHandler: BeginSignupHandler;
  useSyncEnginesResult: ReturnType<typeof useSyncEngines>;
  deeplink?: string;
}

export type SignupIntegration = SignupOAuthIntegration | SignupBaseIntegration;

export type SignupOAuthIntegration = Pick<
  OAuthIntegration,
  | 'type'
  | 'isSync'
  | 'getRedirectUri'
  | 'saveOAuthState'
  | 'getService'
  | 'isDesktopRelay'
  | 'wantsKeys'
  | 'getClientId'
>;

export type SignupBaseIntegration = Pick<
  Integration,
  | 'type'
  | 'isSync'
  | 'getService'
  | 'isDesktopRelay'
  | 'wantsKeys'
  | 'getClientId'
>;

export interface SignupFormData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}
