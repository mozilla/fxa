/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import {
  IntegrationData,
  IntegrationType,
  RelierCmsInfo,
} from '../../../models';
import { SigninTotpCode, SigninTotpCodeProps } from '.';
import {
  MOCK_EMAIL,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
  mockFinishOAuthFlowHandler,
} from '../../mocks';
import { MozServices } from '../../../lib/types';
import VerificationMethods from '../../../constants/verification-methods';
import { SigninIntegration } from '../interfaces';
import { GenericData } from '../../../lib/model-data';

export const mockWebSigninIntegration = {
  type: IntegrationType.Web,
  getService: () => MozServices.Default,
  isSync: () => false,
  wantsKeys: () => false,
  isDesktopRelay: () => false,
  getCmsInfo: () => undefined,
  isFirefoxMobileClient: () => false,
} as SigninIntegration;

export const mockOAuthNativeSigninIntegration = (
  isSync = true,
  cmsInfo?: RelierCmsInfo
) =>
  ({
    type: IntegrationType.OAuthNative,
    getService: () => (isSync ? MozServices.FirefoxSync : MozServices.Relay),
    isSync: () => isSync,
    wantsKeys: () => false,
    isDesktopRelay: () => !isSync,
    data: new IntegrationData(
      new GenericData({
        redirectTo: 'http://localhost/',
      })
    ),
    getCmsInfo: () => cmsInfo,
    isFirefoxMobileClient: () => false,
  }) as SigninIntegration;

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
