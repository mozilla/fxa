/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { HandledError } from '../../lib/error-utils';
import { UseFxAStatusResult } from '../../lib/hooks/useFxAStatus';
import { Integration, OAuthIntegration } from '../../models';
import { QueryParams } from '../..';

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
  useFxAStatusResult: UseFxAStatusResult;
  flowQueryParams?: QueryParams;
  isMobile: boolean;
  setCurrentSplitLayout?: (value: boolean) => void;
}

export type SignupIntegration = SignupOAuthIntegration | SignupBaseIntegration;

export type SignupOAuthIntegration = Pick<
  OAuthIntegration,
  | 'type'
  | 'isSync'
  | 'getRedirectUri'
  | 'saveOAuthState'
  | 'getService'
  | 'isFirefoxClientServiceRelay'
  | 'isFirefoxClientServiceSmartWindow'
  | 'isFirefoxNonSync'
  | 'getWebChannelServices'
  | 'wantsKeys'
  | 'getClientId'
  | 'getCmsInfo'
  | 'getLegalTerms'
>;

export type SignupBaseIntegration = Pick<
  Integration,
  | 'type'
  | 'isSync'
  | 'getService'
  | 'isFirefoxClientServiceRelay'
  | 'isFirefoxClientServiceSmartWindow'
  | 'isFirefoxNonSync'
  | 'getWebChannelServices'
  | 'wantsKeys'
  | 'getClientId'
  | 'getCmsInfo'
  | 'getLegalTerms'
>;

export interface SignupFormData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}
