/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import { AuthUiError } from '../../lib/auth-errors/auth-errors';
import { BeginSigninError } from '../../lib/error-utils';
import { AccountAvatar } from '../../lib/interfaces';
import { FinishOAuthFlowHandler } from '../../lib/oauth/hooks';
import { MozServices } from '../../lib/types';
import { Account, Integration } from '../../models';
import { QueryParams } from '../..';

export interface AvatarResponse {
  account: {
    avatar: AccountAvatar;
  };
}

export type SigninUnblockIntegration = Pick<
  Integration,
  | 'type'
  | 'isSync'
  | 'getService'
  | 'getClientId'
  | 'wantsTwoStepAuthentication'
  | 'clientInfo'
  | 'wantsKeys'
  | 'data'
  | 'isDesktopSync'
  | 'isFirefoxClientServiceRelay'
  | 'wantsLogin'
  | 'getCmsInfo'
  | 'isFirefoxMobileClient'
>;

export type SigninIntegration =
  | Pick<
      Integration,
      | 'type'
      | 'isSync'
      | 'getService'
      | 'getClientId'
      | 'wantsKeys'
      | 'data'
      | 'isDesktopSync'
      | 'isFirefoxClientServiceRelay'
      | 'getCmsInfo'
      | 'isFirefoxMobileClient'
    >
  | SigninOAuthIntegration;

export type SigninOAuthIntegration = Pick<
  Integration,
  | 'type'
  | 'isSync'
  | 'getService'
  | 'getClientId'
  | 'wantsTwoStepAuthentication'
  | 'wantsKeys'
  | 'wantsLogin'
  | 'data'
  | 'isDesktopSync'
  | 'isFirefoxClientServiceRelay'
  | 'getCmsInfo'
  | 'isFirefoxMobileClient'
>;

export interface LocationState {
  email?: string;
  hasLinkedAccount?: boolean;
  hasPassword?: boolean;
  localizedErrorMessage?: string;
  successBanner?: {
    localizedSuccessBannerHeading?: string;
    localizedSuccessBannerDescription?: string;
  };
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
  localizedSuccessBannerHeading?: string;
  localizedSuccessBannerDescription?: string;
  deeplink?: string;
  flowQueryParams?: QueryParams;
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
  authPW?: hexstring;
  showInlineRecoveryKeySetup?: boolean;
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
    verificationMethod?: VerificationMethods;
    verificationReason?: VerificationReasons;
    uid: hexstring;
  } & RecoveryEmailStatusResponse;
  error?: AuthUiError;
}

export interface SigninFormData {
  email: string;
  password: string;
}

export interface CredentialStatus {
  upgradeNeeded: boolean;
  currentVersion?: string;
  clientSalt?: string;
}

export interface CredentialStatusResponse {
  credentialStatus: CredentialStatus;
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
  replace?: boolean;
  queryParams: string;
  // include when there's a condition based on what page it originated from
  origin?: 'post-verify-set-password';
  showInlineRecoveryKeySetup?: boolean;
  isSignInWithThirdPartyAuth?: boolean;
  showSignupConfirmedSync?: boolean;
  syncHidePromoAfterLogin?: boolean;
  handleFxaLogin?: boolean;
  handleFxaOAuthLogin?: boolean;
  syncEngines?: {
    offeredEngines: string[];
    declinedEngines: string[];
  };
  // If false, skip actually navigating. Still sends web channel messages etc.
  performNavigation?: boolean;
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
  origin?: NavigationOptions['origin'];
  showInlineRecoveryKeySetup?: boolean;
}

export type TotpToken = Awaited<ReturnType<Account['createTotp']>>;
