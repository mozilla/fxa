/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Signup from '.';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import {
  createMockSignupOAuthNativeIntegration,
  createMockSignupOAuthWebIntegration,
  createMockSignupSyncDesktopV3Integration,
  mockBeginSignupHandler,
} from './mocks';
import { SignupIntegration } from './interfaces';
import { mockAppContext } from '../../models/mocks';
import {
  MONITOR_CLIENTIDS,
  POCKET_CLIENTIDS,
} from '../../models/integrations/client-matching';
import { AppContext } from '../../models';
import { useMockSyncEngines } from '../../lib/hooks/useSyncEngines/mocks';
import { MOCK_EMAIL } from '../mocks';

export default {
  title: 'Pages/Signup',
  component: Signup,
  decorators: [withLocalization],
} as Meta;

const StoryWithProps = ({
  integration = createMockSignupOAuthWebIntegration(),
}: {
  integration?: SignupIntegration;
}) => {
  const useSyncEnginesResult = useMockSyncEngines();

  return (
    <AppContext.Provider value={mockAppContext()}>
      <LocationProvider>
        <Signup
          {...{
            integration,
            beginSignupHandler: mockBeginSignupHandler,
            useSyncEnginesResult,
          }}
          email={MOCK_EMAIL}
        />
      </LocationProvider>
    </AppContext.Provider>
  );
};

export const Default = () => <StoryWithProps />;
export const CantChangeEmail = () => <StoryWithProps />;
export const ClientIsPocket = () => (
  <StoryWithProps
    integration={createMockSignupOAuthWebIntegration(POCKET_CLIENTIDS[0])}
  />
);
export const ClientIsMonitor = () => (
  <StoryWithProps
    integration={createMockSignupOAuthWebIntegration(MONITOR_CLIENTIDS[0])}
  />
);
export const SyncDesktopV3 = () => (
  <StoryWithProps integration={createMockSignupSyncDesktopV3Integration()} />
);
export const SyncOAuth = () => (
  <StoryWithProps integration={createMockSignupOAuthNativeIntegration()} />
);
export const OAuthDesktopServiceRelay = () => (
  <StoryWithProps
    integration={createMockSignupOAuthNativeIntegration('relay', false)}
  />
);
