/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Signin from '.';
import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import { MozServices } from '../../lib/types';
import { IntegrationType } from '../../models';
import {
  MOCK_AUTH_AT,
  MOCK_EMAIL,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
  MOCK_AVATAR_NON_DEFAULT,
  MOCK_UNWRAP_BKEY,
  mockFinishOAuthFlowHandler,
  MOCK_CLIENT_ID,
} from '../mocks';
import {
  BeginSigninError,
  BeginSigninHandler,
  BeginSigninResponse,
  CachedSigninHandler,
  SendUnblockEmailHandler,
  SendUnblockEmailHandlerResponse,
  SigninIntegration,
  SigninOAuthIntegration,
  SigninProps,
} from './interfaces';
import { LocationProvider } from '@reach/router';
import {
  AuthUiError,
  AuthUiErrorNos,
  AuthUiErrors,
} from '../../lib/auth-errors/auth-errors';

// TODO: There's some sharing opportunity with other parts of the codebase
// probably move these or a version of these to pages/mocks and share
export const MOCK_TOTP_STATUS_VERIFIED = {
  account: {
    totp: {
      exists: true,
      verified: true,
    },
  },
};

export const MOCK_TOTP_STATUS = {
  account: {
    totp: {
      exists: true,
      verified: false,
    },
  },
};

export const MOCK_NO_TOTP = {
  account: {
    totp: {
      exists: false,
      verified: false,
    },
  },
};

export function createMockSigninWebIntegration(): SigninIntegration {
  return {
    type: IntegrationType.Web,
    isSync: () => false,
    getService: () => MozServices.Default,
  };
}

export function createMockSigninSyncIntegration(): SigninIntegration {
  return {
    type: IntegrationType.OAuth,
    isSync: () => true,
    wantsKeys: () => true,
    getService: () => MozServices.FirefoxSync,
  };
}

export function createMockSigninOAuthIntegration(
  clientId?: string,
  wantsKeys: boolean = true
): SigninOAuthIntegration {
  return {
    type: IntegrationType.OAuth,
    getService: () => clientId || MOCK_CLIENT_ID,
    isSync: () => false,
    wantsKeys: () => wantsKeys,
    wantsLogin: () => false,
    wantsTwoStepAuthentication: () => false,
  };
}

export const MOCK_VERIFICATION = {
  verificationMethod: VerificationMethods.EMAIL_OTP,
  verificationReason: VerificationReasons.SIGN_IN,
};

export function createBeginSigninResponse({
  uid = MOCK_UID,
  sessionToken = MOCK_SESSION_TOKEN,
  authAt = MOCK_AUTH_AT,
  metricsEnabled = true,
  verified = true,
  verificationMethod = MOCK_VERIFICATION.verificationMethod,
  verificationReason = MOCK_VERIFICATION.verificationReason,
  keyFetchToken = undefined,
}: Partial<BeginSigninResponse['signIn']> = {}): { data: BeginSigninResponse } {
  return {
    data: {
      signIn: {
        uid,
        sessionToken,
        authAt,
        metricsEnabled,
        verified,
        verificationMethod,
        verificationReason,
        keyFetchToken,
      },
      ...(keyFetchToken && { unwrapBKey: MOCK_UNWRAP_BKEY }),
    },
  };
}

export function createBeginSigninResponseError({
  errno = AuthUiErrors.INCORRECT_PASSWORD.errno!,
  verificationMethod,
  verificationReason,
}: Partial<BeginSigninError> = {}): {
  error: BeginSigninError;
} {
  const message = AuthUiErrorNos[errno].message;
  return {
    error: {
      errno,
      verificationMethod,
      verificationReason,
      message,
    },
  };
}

export function createCachedSigninResponseError({
  errno = AuthUiErrors.SESSION_EXPIRED.errno!,
} = {}): {
  error: AuthUiError;
} {
  const message = AuthUiErrorNos[errno].message;
  return {
    error: {
      name: '',
      errno,
      message,
    },
  };
}

export const CACHED_SIGNIN_HANDLER_RESPONSE = {
  data: {
    verified: true,
    sessionVerified: true,
    emailVerified: true,
    uid: MOCK_UID,
    ...MOCK_VERIFICATION,
  },
};

export const SEND_UNBLOCK_EMAIL_HANDLER_RESPONSE: SendUnblockEmailHandlerResponse =
  {};

export const mockBeginSigninHandler: BeginSigninHandler = () =>
  Promise.resolve(createBeginSigninResponse());

export const mockCachedSigninHandler: CachedSigninHandler = () =>
  Promise.resolve(CACHED_SIGNIN_HANDLER_RESPONSE);

export const mockSendUnblockEmailHandler: SendUnblockEmailHandler = () =>
  Promise.resolve(SEND_UNBLOCK_EMAIL_HANDLER_RESPONSE);

export const Subject = ({
  integration = createMockSigninWebIntegration(),
  sessionToken = undefined,
  serviceName = MozServices.Default,
  hasLinkedAccount = false,
  hasPassword = true,
  avatarData = { account: { avatar: { ...MOCK_AVATAR_NON_DEFAULT } } },
  avatarLoading = false,
  email = MOCK_EMAIL,
  beginSigninHandler = mockBeginSigninHandler,
  cachedSigninHandler = mockCachedSigninHandler,
  sendUnblockEmailHandler = mockSendUnblockEmailHandler,
  finishOAuthFlowHandler = mockFinishOAuthFlowHandler,
  ...props // overrides
}: Partial<SigninProps> = {}) => {
  return (
    <LocationProvider>
      <Signin
        {...{
          integration,
          email,
          sessionToken,
          serviceName,
          hasLinkedAccount,
          finishOAuthFlowHandler,
          beginSigninHandler,
          cachedSigninHandler,
          sendUnblockEmailHandler,
          hasPassword,
          avatarData,
          avatarLoading,
          ...props,
        }}
      />
    </LocationProvider>
  );
};
