/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import { SigninTotpCode, SigninTotpCodeProps } from '.';
import VerificationMethods from '../../../constants/verification-methods';
import { GenericData } from '../../../lib/model-data';
import { MozServices } from '../../../lib/types';
import {
  IntegrationData,
  IntegrationType,
  OAuthNativeServices,
  RelierCmsInfo,
} from '../../../models';
import {
  MOCK_EMAIL,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
  mockFinishOAuthFlowHandler,
  mockGetWebChannelServices,
} from '../../mocks';
import { SigninIntegration } from '../interfaces';

export const mockWebSigninIntegration = {
  type: IntegrationType.Web,
  getService: () => MozServices.Default,
  isSync: () => false,
  wantsKeys: () => false,
  isFirefoxClientServiceRelay: () => false,
  isFirefoxClientServiceAiMode: () => false,
  getWebChannelServices: mockGetWebChannelServices(),
  getCmsInfo: () => undefined,
  isFirefoxMobileClient: () => false,
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
    wantsKeys: () => false,
    isFirefoxClientServiceRelay: () => isRelay,
    isFirefoxClientServiceAiMode: () => false,
    getWebChannelServices: mockGetWebChannelServices({ isSync, isRelay }),
    data: new IntegrationData(
      new GenericData({
        redirectTo: 'http://localhost/',
      })
    ),
    getCmsInfo: () => cmsInfo,
    isFirefoxMobileClient: () => false,
  } as SigninIntegration;
};

export const MOCK_TOTP_LOCATION_STATE = {
  email: MOCK_EMAIL,
  uid: MOCK_UID,
  sessionToken: MOCK_SESSION_TOKEN,
  verified: false,
  verificationMethod: VerificationMethods.TOTP_2FA,
};

export const MOCK_NON_TOTP_LOCATION_STATE = {
  email: MOCK_EMAIL,
  uid: MOCK_UID,
  sessionToken: MOCK_SESSION_TOKEN,
  verified: false,
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
}: Partial<SigninTotpCodeProps>) => {
  return (
    <LocationProvider>
      <SigninTotpCode
        {...{
          finishOAuthFlowHandler,
          integration,
          serviceName,
          signinState,
          submitTotpCode,
        }}
      />
    </LocationProvider>
  );
};
