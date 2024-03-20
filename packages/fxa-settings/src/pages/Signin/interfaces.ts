/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import { AuthUiError } from '../../lib/auth-errors/auth-errors';
import { AccountAvatar } from '../../lib/interfaces';
import { FinishOAuthFlowHandler } from '../../lib/oauth/hooks';
import { MozServices } from '../../lib/types';
import { Integration } from '../../models';

export interface AvatarResponse {
  account: {
    avatar: AccountAvatar;
  };
}

export type SigninIntegration =
  | Pick<Integration, 'type' | 'isSync' | 'getService' | 'wantsKeys'>
  | SigninOAuthIntegration;

export type SigninOAuthIntegration = Pick<
  Integration,
  | 'type'
  | 'isSync'
  | 'getService'
  | 'wantsTwoStepAuthentication'
  | 'wantsKeys'
  | 'wantsLogin'
>;

export interface LocationState {
  email?: string;
  hasLinkedAccount?: boolean;
  hasPassword?: boolean;
  localizedErrorMessage?: string;
}

export interface SigninProps {
  integration: SigninIntegration;
  email: string;
  beginSigninHandler: BeginSigninHandler;
  cachedSigninHandler: CachedSigninHandler;
  sendUnblockEmailHandler: SendUnblockEmailHandler;
  sessionToken?: hexstring;
  hasLinkedAccount: boolean;
  hasPassword: boolean;
  serviceName: MozServices;
  avatarData: AvatarResponse | undefined;
  avatarLoading: boolean;
  localizedErrorFromLocationState?: string;
  finishOAuthFlowHandler: FinishOAuthFlowHandler;
}

export type BeginSigninHandler = (
  email: string,
  password: string
) => Promise<BeginSigninResult>;

export interface BeginSigninResult {
  data?: BeginSigninResponse | null;
  error?: BeginSigninError;
}

export interface BeginSigninResponse {
  signIn: {
    uid: string;
    sessionToken: hexstring;
    authAt: number;
    metricsEnabled: boolean;
    verified: boolean;
    verificationMethod: VerificationMethods;
    verificationReason: VerificationReasons;
    keyFetchToken?: hexstring;
  };
  unwrapBKey?: hexstring;
}

export interface BeginSigninError {
  errno: number;
  message: string;
  verificationReason?: VerificationReasons;
  verificationMethod?: VerificationMethods;
  retryAfter?: number;
  retryAfterLocalized?: string;
}

export type CachedSigninHandler = (
  sessionToken: hexstring
) => Promise<CachedSigninHandlerResponse>;

export interface RecoveryEmailStatusResponse {
  verified: boolean;
  sessionVerified: boolean;
  emailVerified: boolean;
}

export interface CachedSigninHandlerResponse {
  data?: {
    verificationMethod: VerificationMethods;
    verificationReason: VerificationReasons;
    uid: hexstring;
  } & RecoveryEmailStatusResponse;
  error?: AuthUiError;
}

export interface SigninFormData {
  email: string;
  password: string;
}

export interface CredentialStatusResponse {
  credentialStatus: {
    upgradeNeeded: boolean;
    version?: string;
    clientSalt?: string;
  };
}

export interface PasswordChangeStartResponse {
  passwordChangeStart: {
    keyFetchToken: string;
    passwordChangeToken: string;
  };
}

export interface PasswordChangeFinishResponse {
  passwordChangeFinish: {
    uid: string;
    sessionToken: string;
    verified: boolean;
    authAt: number;
    keyFetchToken: string;
    keyFetchToken2?: string;
  };
}

export interface GetAccountKeysResponse {
  wrappedAccountKeys: {
    kA: string;
    wrapKB: string;
  };
}

export type SendUnblockEmailHandler = (
  email: string
) => Promise<SendUnblockEmailHandlerResponse>;

// TODO fill in expected response
export interface SendUnblockEmailHandlerResponse {
  localizedErrorMessage?: string;
}

export interface NavigationOptions {
  email: string;
  signinData: {
    uid: hexstring;
    sessionToken: hexstring;
    verified: boolean;
    verificationMethod?: VerificationMethods;
    verificationReason?: VerificationReasons;
    // keyFetchToken is included if options.keys=true
    // This (and unwrapBKey) will never exist for the cached signin (prompt=none)
    keyFetchToken?: hexstring;
  };
  // unwrapBKey is included if integration.wantsKeys()
  unwrapBKey?: hexstring;
  integration: SigninIntegration;
  finishOAuthFlowHandler: FinishOAuthFlowHandler;
  redirectTo?: string;
  queryParams: string;
}

export interface OAuthSigninResult {
  to: string;
  shouldHardNavigate: string;
}

export interface SigninLocationState {
  email: string;
  uid: hexstring;
  sessionToken: hexstring;
  verified: boolean;
  verificationMethod?: VerificationMethods;
  verificationReason?: VerificationReasons;
  keyFetchToken?: hexstring;
  unwrapBKey?: hexstring;
}
