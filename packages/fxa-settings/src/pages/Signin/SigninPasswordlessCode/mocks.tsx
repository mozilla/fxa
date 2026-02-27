/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import {
  IntegrationType,
  OAuthIntegrationData,
  OAuthNativeIntegration,
  RelierCmsInfo,
  WebIntegration,
  WebIntegrationData,
} from '../../../models';
import { SigninPasswordlessCodeProps } from './interfaces';
import SigninPasswordlessCode from '.';
import {
  MOCK_EMAIL,
  mockFinishOAuthFlowHandler,
} from '../../mocks';
import { MozServices } from '../../../lib/types';
import { GenericData } from '../../../lib/model-data';

export const MOCK_PASSWORDLESS_CODE = '12345678';

export function createMockWebIntegration(): WebIntegration {
  return {
    type: IntegrationType.Web,
    getService: () => MozServices.Default,
    getClientId: () => undefined,
    isSync: () => false,
    wantsKeys: () => false,
    isDesktopSync: () => false,
    isFirefoxClientServiceRelay: () => false,
    data: new WebIntegrationData(new GenericData({})),
    getCmsInfo: () => undefined,
  } as WebIntegration;
}

export function createOAuthNativeIntegration(
  isSync = true,
  cmsInfo?: RelierCmsInfo
): OAuthNativeIntegration {
  return {
    type: IntegrationType.OAuthNative,
    getService: () => MozServices.Default,
    getClientId: () => 'sync',
    isSync: () => isSync,
    wantsKeys: () => false,
    isDesktopSync: () => false,
    isFirefoxClientServiceRelay: () => !isSync,
    data: new OAuthIntegrationData(new GenericData({})),
    wantsLogin: () => false,
    wantsTwoStepAuthentication: () => false,
    getCmsInfo: () => cmsInfo,
  } as OAuthNativeIntegration;
}

export const createMockPasswordlessLocationState = (isSignup = false) => {
  return {
    email: MOCK_EMAIL,
    isSignup,
    service: 'sync',
  };
};

export const Subject = ({
  email = MOCK_EMAIL,
  expirationMinutes = 5,
  finishOAuthFlowHandler = mockFinishOAuthFlowHandler,
  integration = createMockWebIntegration(),
  isSignup = false,
}: Partial<SigninPasswordlessCodeProps>) => {
  return (
    <LocationProvider>
      <SigninPasswordlessCode
        {...{
          email,
          expirationMinutes,
          finishOAuthFlowHandler,
          integration,
          isSignup,
        }}
      />
    </LocationProvider>
  );
};
