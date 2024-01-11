/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Signup from '.';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import {
  createMockSignupOAuthIntegration,
  createMockSignupSyncDesktopV3Integration,
  mockBeginSignupHandler,
  signupQueryParams,
} from './mocks';
import { SignupIntegration } from './interfaces';
import { SignupQueryParams } from '../../models/pages/signup';
import { mockUrlQueryData } from '../../models/mocks';
import {
  MONITOR_CLIENTIDS,
  POCKET_CLIENTIDS,
} from '../../models/integrations/client-matching';
import { getSyncEngineIds } from '../../components/ChooseWhatToSync/sync-engines';
import { isOAuthIntegration, isSyncDesktopV3Integration } from '../../models';
import { MOCK_CLIENT_ID } from '../mocks';

export default {
  title: 'Pages/Signup',
  component: Signup,
  decorators: [withLocalization],
} as Meta;

const urlQueryData = mockUrlQueryData(signupQueryParams);
const queryParamModel = new SignupQueryParams(urlQueryData);

const storyWithProps = (
  integration: SignupIntegration = createMockSignupOAuthIntegration()
) => {
  const isSyncOAuth = isOAuthIntegration(integration) && integration.isSync();

  const story = () => (
    <LocationProvider>
      <Signup
        {...{
          integration,
          queryParamModel,
          beginSignupHandler: mockBeginSignupHandler,
          webChannelEngines: getSyncEngineIds(),
          isSyncWebChannel:
            isSyncOAuth || isSyncDesktopV3Integration(integration),
          isSyncOAuth,
        }}
      />
    </LocationProvider>
  );
  return story;
};

export const Default = storyWithProps();

export const CantChangeEmail = storyWithProps();

export const ClientIsPocket = storyWithProps(
  createMockSignupOAuthIntegration(POCKET_CLIENTIDS[0])
);

export const ClientIsMonitor = storyWithProps(
  createMockSignupOAuthIntegration(MONITOR_CLIENTIDS[0])
);

export const SyncDesktopV3 = storyWithProps(
  createMockSignupSyncDesktopV3Integration()
);

export const SyncOAuth = storyWithProps(
  createMockSignupOAuthIntegration(MOCK_CLIENT_ID, true)
);
