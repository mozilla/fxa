/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { MozServices } from '../../lib/types';
import {
  IntegrationData,
  IntegrationType,
  OAuthIntegrationData,
} from '../../models';
import { IndexIntegration } from './interfaces';
import Index from '.';
import { MOCK_CLIENT_ID } from '../mocks';
import { Constants } from '../../lib/constants';
import { GenericData } from '../../lib/model-data';

export function createMockIndexOAuthIntegration({
  clientId = MOCK_CLIENT_ID,
}): IndexIntegration {
  return {
    type: IntegrationType.OAuthWeb,
    isSync: () => false,
    getClientId: () => clientId,
    isDesktopRelay: () => false,
    data: new OAuthIntegrationData(
      new GenericData({
        context: '',
      })
    ),
  };
}
export function createMockIndexOAuthNativeIntegration({
  isSync = true,
  isDesktopRelay = false,
}: {
  isSync?: boolean;
  isDesktopRelay?: boolean;
} = {}): IndexIntegration {
  return {
    type: IntegrationType.OAuthNative,
    isSync: () => isSync,
    getClientId: () => MOCK_CLIENT_ID,
    isDesktopRelay: () => isDesktopRelay,
    data: new OAuthIntegrationData(
      new GenericData({
        context: Constants.OAUTH_WEBCHANNEL_CONTEXT,
      })
    ),
  };
}

export function createMockIndexWebIntegration(): IndexIntegration {
  return {
    type: IntegrationType.Web,
    isSync: () => false,
    getClientId: () => undefined,
    isDesktopRelay: () => false,
    data: new IntegrationData(
      new GenericData({
        context: '',
      })
    ),
  };
}

export const Subject = ({
  integration = createMockIndexWebIntegration(),
  serviceName = MozServices.Default,
  prefillEmail,
  deleteAccountSuccess,
  hasBounced,
}: {
  integration?: IndexIntegration;
  serviceName?: MozServices;
  prefillEmail?: string;
  deleteAccountSuccess?: boolean;
  hasBounced?: boolean;
}) => {
  return (
    <LocationProvider>
      <Index
        signUpOrSignInHandler={async () => ({ error: null })}
        {...{
          prefillEmail,
          deleteAccountSuccess,
          hasBounced,
          integration,
          serviceName,
        }}
      />
    </LocationProvider>
  );
};
