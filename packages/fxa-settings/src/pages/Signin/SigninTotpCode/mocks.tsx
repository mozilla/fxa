/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OAuthNativeServices } from '@fxa/accounts/oauth';
import {
  AppContext,
  IntegrationData,
  IntegrationType,
  RelierCmsInfo,
} from '../../../models';
import { mockAppContext } from '../../../models/mocks';
import { SigninTotpCode, SigninTotpCodeProps } from '.';
import {
  MOCK_EMAIL,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
  mockFinishOAuthFlowHandler,
  mockGetWebChannelServices,
} from '../../mocks';
import { MozServices } from '../../../lib/types';
import VerificationMethods from '../../../constants/verification-methods';
import { mockUseFxAStatus } from '../../../lib/hooks/useFxAStatus/mocks';
import { SigninIntegration } from '../interfaces';
import { GenericData } from '../../../lib/model-data';

export const mockWebSigninIntegration = {
  type: IntegrationType.Web,
  getService: () => MozServices.Default,
  isSync: () => false,
  requiresKeys: () => false,
  wantsKeysIfPasswordEntered: () => false,
  wantsKeys: () => false,
  requiresPasswordForLogin(browserSupportsKeysOptional = false) {
    return (
      this.requiresKeys() ||
      (!browserSupportsKeysOptional && this.wantsKeysIfPasswordEntered())
    );
  },
  isFirefoxClientServiceRelay: () => false,
  isFirefoxClientServiceSmartWindow: () => false,
  isFirefoxClientServiceVpn: () => false,
  isFirefoxNonSync: () => false,
  getWebChannelServices: mockGetWebChannelServices(),
  getCmsInfo: () => undefined,
  isFirefoxClient: () => false,
  isFirefoxMobileClient: () => false,
  isFirefoxDesktopClient: () => false,
} as SigninIntegration;

export const mockOAuthNativeSigninIntegration = (
  isSync = true,
  cmsInfo?: RelierCmsInfo
) => {
  const service = isSync ? OAuthNativeServices.Sync : OAuthNativeServices.Relay;
  const isRelay = service === OAuthNativeServices.Relay;
  return {
    type: IntegrationType.OAuthNative,
    getService: () => (isSync ? MozServices.FirefoxSync : MozServices.Relay),
    isSync: () => isSync,
    requiresKeys: () => false,
    wantsKeysIfPasswordEntered: () => false,
    wantsKeys: () => false,
    requiresPasswordForLogin(browserSupportsKeysOptional = false) {
      return (
        this.requiresKeys() ||
        (!browserSupportsKeysOptional && this.wantsKeysIfPasswordEntered())
      );
    },
    isFirefoxClientServiceRelay: () => isRelay,
    isFirefoxClientServiceSmartWindow: () => false,
    isFirefoxClientServiceVpn: () => false,
    isFirefoxNonSync: () => isRelay,
    getWebChannelServices: mockGetWebChannelServices({ isSync, isRelay }),
    data: new IntegrationData(
      new GenericData({
        redirectTo: 'http://localhost/',
      })
    ),
    getCmsInfo: () => cmsInfo,
    isFirefoxClient: () => true,
    isFirefoxMobileClient: () => false,
    isFirefoxDesktopClient: () => true,
  } as SigninIntegration;
};

export const MOCK_TOTP_LOCATION_STATE = {
  email: MOCK_EMAIL,
  uid: MOCK_UID,
  sessionToken: MOCK_SESSION_TOKEN,
  emailVerified: true,
  sessionVerified: false,
  verificationMethod: VerificationMethods.TOTP_2FA,
};

export const MOCK_NON_TOTP_LOCATION_STATE = {
  email: MOCK_EMAIL,
  uid: MOCK_UID,
  sessionToken: MOCK_SESSION_TOKEN,
  emailVerified: true,
  sessionVerified: false,
  verificationMethod: VerificationMethods.EMAIL_OTP,
};

export const mockOauthSigninLocationState = {};

const mockSubmitTotpCode = async () => ({});

export const Subject = ({
  finishOAuthFlowHandler = mockFinishOAuthFlowHandler,
  integration = mockWebSigninIntegration,
  serviceName = MozServices.Default,
  signinState = MOCK_TOTP_LOCATION_STATE,
  submitTotpCode = mockSubmitTotpCode,
  browserSupportsKeysOptional = false,
}: Partial<SigninTotpCodeProps> & {
  browserSupportsKeysOptional?: boolean;
}) => {
  return (
    <AppContext.Provider value={mockAppContext()}>
      <SigninTotpCode
        {...{
          finishOAuthFlowHandler,
          integration,
          serviceName,
          signinState,
          submitTotpCode,
          useFxAStatusResult: mockUseFxAStatus({ browserSupportsKeysOptional }),
        }}
      />
    </AppContext.Provider>
  );
};
