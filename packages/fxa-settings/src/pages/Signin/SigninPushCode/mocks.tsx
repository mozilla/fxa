/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { Integration, IntegrationType } from '../../../models';
import { SigninPushCode, SigninPushCodeProps } from '.';
import {
  MOCK_EMAIL,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
  mockFinishOAuthFlowHandler,
} from '../../mocks';
import { MozServices } from '../../../lib/types';
import VerificationMethods from '../../../constants/verification-methods';

const mockWebIntegration = {
  type: IntegrationType.Web,
  getService: () => MozServices.Default,
  isSync: () => false,
  wantsKeys: () => false,
} as Integration;

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

const mockSubmitTotpCode = async () => ({
  status: true,
});

export const Subject = ({
  finishOAuthFlowHandler = mockFinishOAuthFlowHandler,
  integration = mockWebIntegration,
  serviceName = MozServices.Default,
  signinState = MOCK_TOTP_LOCATION_STATE,
}: Partial<SigninPushCodeProps>) => {
  return (
    <LocationProvider>
      <SigninPushCode
        {...{
          finishOAuthFlowHandler,
          integration,
          serviceName,
          signinState,
        }}
      />
    </LocationProvider>
  );
};
