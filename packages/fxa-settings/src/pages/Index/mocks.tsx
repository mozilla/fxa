/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { MozServices } from '../../lib/types';
import { IntegrationType } from '../../models';
import { IndexIntegration } from './interfaces';
import Index from '.';
import { MOCK_CLIENT_ID } from '../mocks';

export function createMockIndexOAuthIntegration({
  clientId = MOCK_CLIENT_ID,
}): IndexIntegration {
  return {
    type: IntegrationType.OAuthWeb,
    isSync: () => false,
    getClientId: () => clientId,
  };
}
export function createMockIndexSyncIntegration(): IndexIntegration {
  return {
    type: IntegrationType.OAuthNative,
    isSync: () => true,
    getClientId: () => MOCK_CLIENT_ID,
  };
}

export function createMockIndexWebIntegration(): IndexIntegration {
  return {
    type: IntegrationType.Web,
    isSync: () => false,
    getClientId: () => undefined,
  };
}

export const Subject = ({
  integration = createMockIndexWebIntegration(),
  serviceName = MozServices.Default,
}: {
  integration?: IndexIntegration;
  serviceName?: MozServices;
}) => {
  return (
    <LocationProvider>
      <Index
        {...{
          integration,
          serviceName,
        }}
      />
    </LocationProvider>
  );
};
