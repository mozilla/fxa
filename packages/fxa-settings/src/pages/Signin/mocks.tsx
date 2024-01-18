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
} from '../mocks';
import {
  BeginSigninHandler,
  CachedSigninHandler,
  SigninIntegration,
  SigninProps,
} from './interfaces';
import { LocationProvider } from '@reach/router';

export function createMockSigninWebIntegration(): SigninIntegration {
  return {
    type: IntegrationType.Web,
    isSync: () => false,
  };
}

export function createMockSigninSyncIntegration(): SigninIntegration {
  return {
    type: IntegrationType.SyncDesktopV3,
    isSync: () => true,
  };
}

const MOCK_VERIFICATION = {
  verificationMethod: VerificationMethods.EMAIL_OTP,
  verificationReason: VerificationReasons.SIGN_IN,
};

export const BEGIN_SIGNIN_HANDLER_RESPONSE = {
  data: {
    signIn: {
      uid: MOCK_UID,
      sessionToken: MOCK_SESSION_TOKEN,
      authAt: MOCK_AUTH_AT,
      metricsEnabled: true,
      verified: true,
      ...MOCK_VERIFICATION,
    },
  },
};

export const CACHED_SIGNIN_HANDLER_RESPONSE = {
  data: {
    verified: true,
    sessionVerified: true,
    emailVerified: true,
    ...MOCK_VERIFICATION,
  },
};

export const mockBeginSigninHandler: BeginSigninHandler = () =>
  Promise.resolve(BEGIN_SIGNIN_HANDLER_RESPONSE);

export const mockCachedSigninHandler: CachedSigninHandler = () =>
  Promise.resolve(CACHED_SIGNIN_HANDLER_RESPONSE);

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
  ...props // overrides
}: Partial<SigninProps> = {}) => (
  <LocationProvider>
    <Signin
      {...{
        integration,
        email,
        sessionToken,
        serviceName,
        hasLinkedAccount,
        beginSigninHandler,
        cachedSigninHandler,
        hasPassword,
        avatarData,
        avatarLoading,
        ...props,
      }}
    />
  </LocationProvider>
);
