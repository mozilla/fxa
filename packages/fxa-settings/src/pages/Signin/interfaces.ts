/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import { AccountAvatar, HandledError } from '../../lib/interfaces';
import { MozServices } from '../../lib/types';
import { Integration } from '../../models';

export interface AvatarResponse {
  account: {
    avatar: AccountAvatar;
  };
}

export type SigninIntegration = Pick<Integration, 'type' | 'isSync'>;

export type SigninContainerIntegration = Pick<
  Integration,
  'type' | 'isSync' | 'getService'
>;

export interface LocationState {
  email?: string;
  hasLinkedAccount?: boolean;
  hasPassword?: boolean;
}

export interface SigninProps {
  integration: SigninIntegration;
  email: string;
  beginSigninHandler: BeginSigninHandler;
  cachedSigninHandler: CachedSigninHandler;
  sessionToken?: hexstring;
  hasLinkedAccount: boolean;
  hasPassword: boolean;
  serviceName: MozServices;
  avatarData: AvatarResponse | undefined;
  avatarLoading: boolean;
}

export type BeginSigninHandler = (
  email: string,
  password: string
) => Promise<BeginSigninResult>;

export interface BeginSigninResponse {
  signIn: {
    uid: string;
    sessionToken: hexstring;
    authAt: number;
    metricsEnabled: boolean;
    verified: boolean;
    verificationMethod: VerificationMethods;
    verificationReason: VerificationReasons;
  };
}

export interface BeginSigninResultError {
  errno: number;
  verificationReason?: VerificationReasons;
  verificationMethod?: VerificationMethods;
}

export type BeginSigninResultHandlerError = BeginSigninResultError &
  HandledError;

export interface BeginSigninResult {
  data?: BeginSigninResponse | null;
  error?: BeginSigninResultHandlerError;
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
  data:
    | ({
        verificationMethod: VerificationMethods;
        verificationReason: VerificationReasons;
      } & RecoveryEmailStatusResponse)
    | null;
  error?: HandledError;
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
