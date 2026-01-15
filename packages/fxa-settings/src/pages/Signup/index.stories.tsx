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
import { MONITOR_CLIENTIDS } from '../../models/integrations/client-matching';
import { AppContext, OAuthNativeServices } from '../../models';
import { mockUseFxAStatus } from '../../lib/hooks/useFxAStatus/mocks';
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
  supportsKeysOptionalLogin = false,
}: {
  integration?: SignupIntegration;
  offeredSyncEnginesOverride?: ReturnType<typeof getSyncEngineIds>;
  isMobile?: boolean;
  supportsKeysOptionalLogin?: boolean;
}) => {
  const useFxAStatusResult = mockUseFxAStatus({
    offeredSyncEnginesOverride,
    supportsKeysOptionalLogin,
  });

  return (
    <AppContext.Provider value={mockAppContext()}>
      <LocationProvider>
        <Signup
          {...{
            integration,
            beginSignupHandler: mockBeginSignupHandler,
            useFxAStatusResult,
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
    integration={createMockSignupOAuthNativeIntegration(
      OAuthNativeServices.Relay,
      false
    )}
  />
);

export const WithThirdPartyAuthServiceRelayIntegration = () => (
  <StoryWithProps
    integration={createMockSignupOAuthNativeIntegration(
      OAuthNativeServices.Relay,
      false
    )}
    supportsKeysOptionalLogin={true}
  />
);

export const WithThirdPartyAuthServiceAIWindowIntegration = () => (
  <StoryWithProps
    integration={createMockSignupOAuthNativeIntegration(
      OAuthNativeServices.AiWindow,
      false
    )}
    supportsKeysOptionalLogin={true}
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

export const WithCmsSplitLayout = () => (
  <StoryWithProps
    integration={createMockSignupOAuthWebIntegration(
      MONITOR_CLIENTIDS[0],
      undefined,
      {
        ...MOCK_CMS_INFO,
        SignupSetPasswordPage: {
          ...MOCK_CMS_INFO.SignupSetPasswordPage,
          splitLayout: true,
        },
      }
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
