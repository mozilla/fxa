/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import {
  IntegrationType,
  OAuthIntegrationData,
  OAuthNativeIntegration,
  WebIntegration,
  WebIntegrationData,
} from '../../../models';
import { SigninTokenCodeProps } from './interfaces';
import SigninTokenCode from '.';
import {
  MOCK_EMAIL,
  MOCK_KEY_FETCH_TOKEN,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
  MOCK_UNWRAP_BKEY,
  mockFinishOAuthFlowHandler,
} from '../../mocks';
import { MozServices } from '../../../lib/types';
import VerificationReasons from '../../../constants/verification-reasons';
import { GenericData } from '../../../lib/model-data';

export function createMockWebIntegration(): WebIntegration {
  return {
    type: IntegrationType.Web,
    getService: () => MozServices.Default,
    getClientId: () => undefined,
    isSync: () => false,
    wantsKeys: () => false,
    isDesktopSync: () => false,
    isDesktopRelay: () => false,
    data: new WebIntegrationData(new GenericData({})),
  } as WebIntegration;
}

export function createOAuthNativeIntegration(
  isSync = true
): OAuthNativeIntegration {
  return {
    type: IntegrationType.OAuthNative,
    getService: () => MozServices.Default,
    getClientId: () => 'sync',
    isSync: () => isSync,
    wantsKeys: () => false,
    isDesktopSync: () => false,
    isDesktopRelay: () => !isSync,
    data: new OAuthIntegrationData(new GenericData({})),
    wantsLogin: () => false,
    wantsTwoStepAuthentication: () => false,
  } as OAuthNativeIntegration;
}

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

export const Subject = ({
  finishOAuthFlowHandler = mockFinishOAuthFlowHandler,
  integration = createMockWebIntegration(),
  verificationReason = undefined,
  onSessionVerified = async () => {},
}: Partial<SigninTokenCodeProps> & {
  verificationReason?: VerificationReasons;
}) => {
  return (
    <LocationProvider>
      <SigninTokenCode
        {...{
          finishOAuthFlowHandler,
          integration,
          onSessionVerified,
        }}
        signinState={createMockSigninLocationState(
          integration.wantsKeys(),
          verificationReason
        )}
      />
    </LocationProvider>
  );
};
