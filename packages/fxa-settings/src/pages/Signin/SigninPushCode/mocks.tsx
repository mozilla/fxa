/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { IntegrationType } from '../../../models';
import { SigninPushCode } from '.';
import { SigninPushCodeProps } from './interfaces';
import {
  MOCK_EMAIL,
  MOCK_KEY_FETCH_TOKEN,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
  MOCK_UNWRAP_BKEY,
} from '../../mocks';
import { MozServices } from '../../../lib/types';
import VerificationMethods from '../../../constants/verification-methods';
import VerificationReasons from '../../../constants/verification-reasons';

export const MOCK_LOCATION_STATE = {
  email: MOCK_EMAIL,
  uid: MOCK_UID,
  sessionToken: MOCK_SESSION_TOKEN,
  verified: false,
  verificationMethod: VerificationMethods.EMAIL_OTP,
};

export const createMockSigninLocationState = (
  wantsKeys = false,
  verificationReason?: VerificationReasons
) => {
  return {
    email: MOCK_EMAIL,
    uid: MOCK_UID,
    sessionToken: MOCK_SESSION_TOKEN,
    verified: false,
    verificationReason,
    ...(wantsKeys && {
      keyFetchToken: MOCK_KEY_FETCH_TOKEN,
      unwrapBKey: MOCK_UNWRAP_BKEY,
    }),
  };
};

export function createMockSyncIntegration() {
  return {
    type: IntegrationType.SyncDesktopV3,
    getService: () => MozServices.FirefoxSync,
    isSync: () => true,
    wantsKeys: () => true,
    data: {},
  };
}

export const Subject = ({
  serviceName = MozServices.Default,
  signinState = MOCK_LOCATION_STATE,
}: Partial<SigninPushCodeProps>) => {
  return (
    <LocationProvider>
      <SigninPushCode
        {...{
          serviceName,
          signinState,
          sendLoginPushNotification: () => Promise.resolve(),
          pollSessionStatus: () => Promise.resolve(),
        }}
      />
    </LocationProvider>
  );
};
