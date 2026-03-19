/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { OAuthNativeClients, OAuthNativeServices } from '@fxa/accounts/oauth';
import {
  OAuthNativeIntegration,
  RelierCmsInfo,
  RelierClientInfo,
  WebIntegration,
} from '../../../models';
import { SigninPasswordlessCodeProps } from './interfaces';
import SigninPasswordlessCode from '.';
import {
  MOCK_CLIENT_ID,
  MOCK_EMAIL,
  MOCK_REDIRECT_URI,
  mockFinishOAuthFlowHandler,
} from '../../mocks';
import { MozServices } from '../../../lib/types';
import { GenericData } from '../../../lib/model-data';
import { Constants } from '../../../lib/constants';

export const MOCK_PASSWORDLESS_CODE = '12345678';

export function createMockWebIntegration(
  cmsInfo?: RelierCmsInfo
): WebIntegration {
  const integration = new WebIntegration(
    new GenericData({
      context: Constants.FX_DESKTOP_V3_CONTEXT,
      service: MozServices.Default,
    })
  );

  if (cmsInfo) {
    integration.getCmsInfo = () => cmsInfo;
  }

  return integration;
}

export function createOAuthNativeIntegration(
  isSync = true,
  cmsInfo?: RelierCmsInfo
): OAuthNativeIntegration {
  const resolvedService = isSync
    ? OAuthNativeServices.Sync
    : OAuthNativeServices.Relay;

  const integration = new OAuthNativeIntegration(
    new GenericData({
      scope: 'profile:email',
      service: resolvedService,
      redirect_uri: MOCK_REDIRECT_URI,
      client_id: MOCK_CLIENT_ID,
    }),
    new GenericData({}),
    {
      scopedKeysEnabled: false,
      scopedKeysValidation: {},
      isPromptNoneEnabled: false,
      isPromptNoneEnabledClientIds: [],
    }
  );

  integration.clientInfo = {
    redirectUri: MOCK_REDIRECT_URI,
    clientId: OAuthNativeClients.FirefoxDesktop,
  } as RelierClientInfo;

  if (cmsInfo) {
    integration.getCmsInfo = () => cmsInfo;
  }

  return integration;
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
          flowQueryParams: {},
          integration,
          isSignup,
        }}
      />
    </LocationProvider>
  );
};
