/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Signin from '.';
import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import { MozServices } from '../../lib/types';
import {
  AppContext,
  IntegrationData,
  IntegrationType,
  RelierCmsInfo,
  OAuthNativeServices,
} from '../../models';
import {
  MOCK_AUTH_AT,
  MOCK_EMAIL,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
  MOCK_AVATAR_NON_DEFAULT,
  mockFinishOAuthFlowHandler,
  MOCK_CLIENT_ID,
  MOCK_KEY_FETCH_TOKEN,
  mockGetWebChannelServices,
} from '../mocks';
import { mockUseFxAStatus } from '../../lib/hooks/useFxAStatus/mocks';
import {
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
import { BeginSigninError } from '../../lib/error-utils';
import { mockAppContext } from '../../models/mocks';
import { GenericData } from '../../lib/model-data';

// Extend base mocks
export * from '../mocks';

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

export const mockSigninLocationState = {
  email: MOCK_EMAIL,
  sessionToken: MOCK_SESSION_TOKEN,
  uid: MOCK_UID,
  emailVerified: false,
  sessionVerified: false,
};

export function createMockSigninWebIntegration({
  cmsInfo,
}: {
  cmsInfo?: RelierCmsInfo;
} = {}): SigninIntegration {
  return {
    type: IntegrationType.Web,
    isSync: () => false,
    getService: () => MozServices.Default,
    getClientId: () => undefined,
    wantsKeys: () => false,
    data: new IntegrationData(new GenericData({})),
    isDesktopSync: () => false,
    isFirefoxClientServiceRelay: () => false,
    isFirefoxClientServiceSmartWindow: () => false,
    isFirefoxClientServiceVpn: () => false,
    isFirefoxNonSync: () => false,
    getWebChannelServices: mockGetWebChannelServices(),
    wantsLogin: () => false,
    wantsTwoStepAuthentication: () => false,
    getCmsInfo: () => cmsInfo,
    isFirefoxMobileClient: () => false,
    getLegalTerms: () => undefined,
  };
}

export function createMockSigninOAuthNativeSyncIntegration({
  type = IntegrationType.OAuthNative,
  isSync = true,
  isMobile = false,
}: {
  type?: IntegrationType;
  isSync?: boolean;
  isMobile?: boolean;
} = {}): SigninIntegration {
  return {
    type,
    isSync: () => isSync,
    wantsKeys: () => true,
    getService: () => MozServices.FirefoxSync,
    getClientId: () => MOCK_CLIENT_ID,
    data: new IntegrationData(new GenericData({})),
    isDesktopSync: () => isSync && !isMobile,
    isFirefoxClientServiceRelay: () => !isSync && !isMobile,
    isFirefoxClientServiceSmartWindow: () => false,
    isFirefoxClientServiceVpn: () => false,
    isFirefoxNonSync: () => !isSync && !isMobile,
    getWebChannelServices: mockGetWebChannelServices({ isSync }),
    wantsLogin: () => false,
    wantsTwoStepAuthentication: () => false,
    getCmsInfo: () => undefined,
    isFirefoxMobileClient: () => isSync && isMobile,
    getLegalTerms: () => undefined,
  };
}

export function createMockSigninOAuthIntegration({
  clientId,
  service,
  wantsKeys = true,
  isSync = false,
  cmsInfo = undefined,
}: {
  clientId?: string;
  service?: MozServices;
  wantsKeys?: boolean;
  isSync?: boolean;
  cmsInfo?: RelierCmsInfo;
} = {}): SigninOAuthIntegration {
  return {
    type: IntegrationType.OAuthWeb,
    getService: () => service || MozServices.Default,
    getClientId: () => clientId || MOCK_CLIENT_ID,
    isSync: () => isSync,
    wantsKeys: () => wantsKeys,
    wantsLogin: () => false,
    wantsTwoStepAuthentication: () => false,
    isDesktopSync: () => isSync,
    data: new IntegrationData(new GenericData({})),
    isFirefoxClientServiceRelay: () => false,
    isFirefoxClientServiceSmartWindow: () => false,
    isFirefoxClientServiceVpn: () => false,
    isFirefoxNonSync: () => false,
    getWebChannelServices: mockGetWebChannelServices({ isSync }),
    getCmsInfo: () => cmsInfo,
    isFirefoxMobileClient: () => false,
    getLegalTerms: () => undefined,
  };
}

export function createMockSigninOAuthNativeIntegration({
  service = 'sync',
  isSync = true,
  isMobile = false,
  cmsInfo = undefined,
}: {
  service?: string;
  isSync?: boolean;
  isMobile?: boolean;
  cmsInfo?: RelierCmsInfo;
} = {}): SigninOAuthIntegration {
  const isRelay = service === OAuthNativeServices.Relay;
  const isSmartWindow = service === OAuthNativeServices.SmartWindow;
  const isVpn = service === OAuthNativeServices.Vpn;
  return {
    type: IntegrationType.OAuthNative,
    getService: () => service,
    isSync: () => isSync,
    wantsKeys: () => true,
    wantsLogin: () => false,
    wantsTwoStepAuthentication: () => false,
    isDesktopSync: () => isSync && !isMobile,
    data: new IntegrationData(new GenericData({})),
    isFirefoxClientServiceRelay: () => isRelay,
    isFirefoxClientServiceSmartWindow: () => isSmartWindow,
    isFirefoxClientServiceVpn: () => isVpn,
    isFirefoxNonSync: () => isRelay || isSmartWindow || isVpn,
    getWebChannelServices: mockGetWebChannelServices({
      isSync,
      isRelay,
      isSmartWindow,
      isVpn,
    }),
    getClientId: () => MOCK_CLIENT_ID,
    getCmsInfo: () => cmsInfo,
    isFirefoxMobileClient: () => isSync && isMobile,
    getLegalTerms: () => undefined,
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
  emailVerified = true,
  sessionVerified = true,
  verificationMethod = MOCK_VERIFICATION.verificationMethod,
  verificationReason = MOCK_VERIFICATION.verificationReason,
  unwrapBKey = undefined,
  keyFetchToken = undefined,
  showInlineRecoveryKeySetup = undefined,
}: Partial<BeginSigninResponse['signIn']> & {
  unwrapBKey?: string;
  showInlineRecoveryKeySetup?: boolean;
} = {}): {
  data: BeginSigninResponse;
} {
  return {
    data: {
      signIn: {
        uid,
        sessionToken,
        authAt,
        metricsEnabled,
        emailVerified,
        sessionVerified,
        verificationMethod,
        verificationReason,
        keyFetchToken,
      },
      unwrapBKey,
      showInlineRecoveryKeySetup,
    },
  };
}

export function createBeginSigninResponseError({
  errno = AuthUiErrors.INCORRECT_PASSWORD.errno!,
  verificationMethod,
  verificationReason,
  email,
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
      email,
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

export const mockBeginSigninHandlerWithKeys: BeginSigninHandler = () =>
  Promise.resolve(
    createBeginSigninResponse({ keyFetchToken: MOCK_KEY_FETCH_TOKEN })
  );

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
  avatarData = { account: { avatar: MOCK_AVATAR_NON_DEFAULT } },
  avatarLoading = false,
  email = MOCK_EMAIL,
  beginSigninHandler = mockBeginSigninHandler,
  cachedSigninHandler = mockCachedSigninHandler,
  sendUnblockEmailHandler = mockSendUnblockEmailHandler,
  finishOAuthFlowHandler = mockFinishOAuthFlowHandler,
  isSignedIntoFirefoxDesktop = false,
  supportsKeysOptionalLogin = false,
  ...props // overrides
}: Partial<SigninProps> & {
  supportsKeysOptionalLogin?: boolean;
} = {}) => {
  const useFxAStatusResult = mockUseFxAStatus({ supportsKeysOptionalLogin });
  return (
    <LocationProvider>
      <AppContext.Provider value={mockAppContext()}>
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
            useFxAStatusResult,
            isSignedIntoFirefoxDesktop,
            ...props,
          }}
        />
      </AppContext.Provider>
    </LocationProvider>
  );
};
