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
import { mockUseSyncEngines } from '../../lib/hooks/useSyncEngines/mocks';
import { MOCK_EMAIL, MOCK_CMS_INFO } from '../mocks';
import { getSyncEngineIds } from '../../lib/sync-engines';

export default {
  title: 'Pages/Signup',
  component: Signup,
  decorators: [withLocalization],
} as Meta;

const StoryWithProps = ({
  integration = createMockSignupOAuthWebIntegration(),
  isMobile = false,
  offeredSyncEnginesOverride,
}: {
  integration?: SignupIntegration;
  offeredSyncEnginesOverride?: ReturnType<typeof getSyncEngineIds>;
  isMobile?: boolean;
}) => {
  const useSyncEnginesResult = mockUseSyncEngines(offeredSyncEnginesOverride);

  return (
    <AppContext.Provider value={mockAppContext()}>
      <LocationProvider>
        <Signup
          {...{
            integration,
            beginSignupHandler: mockBeginSignupHandler,
            useSyncEnginesResult,
            isMobile,
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

// Happens when the browser does not send FxA the 'creditcards' sync engine
export const SyncOAuthWithoutPaymentMethods = () => (
  <StoryWithProps
    integration={createMockSignupOAuthNativeIntegration()}
    offeredSyncEnginesOverride={['bookmarks']}
  />
);
export const OAuthDesktopServiceRelay = () => (
  <StoryWithProps
    integration={createMockSignupOAuthNativeIntegration('relay', false)}
  />
);

export const WithCms = () => (
  <StoryWithProps
    integration={createMockSignupOAuthWebIntegration(
      MONITOR_CLIENTIDS[0],
      undefined,
      MOCK_CMS_INFO
    )}
  />
);

export const WithCmsUsingSharedFallback = () => (
  <StoryWithProps
    integration={createMockSignupOAuthWebIntegration(
      MONITOR_CLIENTIDS[0],
      undefined,
      {
        ...MOCK_CMS_INFO,
        SignupSetPasswordPage: {
          ...MOCK_CMS_INFO.SignupSetPasswordPage,
          logoUrl: undefined,
          logoAltText: undefined,
        },
      }
    )}
  />
);

export const WithCmsOnMobile = () => (
  <StoryWithProps
    integration={createMockSignupOAuthWebIntegration(
      MONITOR_CLIENTIDS[0],
      undefined,
      MOCK_CMS_INFO
    )}
    isMobile={true}
  />
);
