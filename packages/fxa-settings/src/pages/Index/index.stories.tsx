/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Index from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { IndexProps } from './interfaces';
import {
  createMockIndexOAuthIntegration,
  createMockIndexOAuthNativeIntegration,
  Subject,
} from './mocks';
import { MONITOR_CLIENTIDS } from '../../models/integrations/client-matching';
import { MozServices } from '../../lib/types';
import { MOCK_EMAIL, MOCK_CMS_INFO } from '../mocks';

export default {
  title: 'Pages/Index',
  component: Index,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = ({
  ...props // overrides
}: Partial<IndexProps> & {
  initialErrorBanner?: string;
  initialSuccessBanner?: string;
  initialTooltipMessage?: string;
  supportsKeysOptionalLogin?: boolean;
} = {}) => {
  const story = () => <Subject {...props} />;
  return story;
};

export const Default = storyWithProps();

export const WithServiceRelayIntegration = storyWithProps({
  integration: createMockIndexOAuthNativeIntegration({
    isFirefoxClientServiceRelay: true,
    isSync: false,
  }),
});
export const WithThirdPartyAuthServiceRelayIntegration = storyWithProps({
  integration: createMockIndexOAuthNativeIntegration({
    isFirefoxClientServiceRelay: true,
    isSync: false,
  }),
  supportsKeysOptionalLogin: true,
});

export const WithThirdPartyAuthServiceAIWindowIntegration = storyWithProps({
  integration: createMockIndexOAuthNativeIntegration({
    isFirefoxClientServiceAiWindow: true,
    isSync: false,
  }),
  supportsKeysOptionalLogin: true,
});

export const WithPrefilledEmail = storyWithProps({
  prefillEmail: MOCK_EMAIL,
});

export const Sync = storyWithProps({
  integration: createMockIndexOAuthNativeIntegration(),
  serviceName: MozServices.FirefoxSync,
});

export const Monitor = storyWithProps({
  integration: createMockIndexOAuthIntegration({
    clientId: MONITOR_CLIENTIDS[0],
  }),
  serviceName: MozServices.Monitor,
});

export const WithCms = storyWithProps({
  integration: createMockIndexOAuthNativeIntegration({
    isFirefoxClientServiceRelay: true,
    isSync: false,
    cmsInfo: MOCK_CMS_INFO,
  }),
});

export const WithCmsOnMobile = storyWithProps({
  integration: createMockIndexOAuthNativeIntegration({
    isFirefoxClientServiceRelay: true,
    isSync: false,
    cmsInfo: MOCK_CMS_INFO,
  }),
  isMobile: true,
});

export const WithCmsSplitLayout = storyWithProps({
  integration: createMockIndexOAuthNativeIntegration({
    isFirefoxClientServiceRelay: true,
    isSync: false,
    cmsInfo: {
      ...MOCK_CMS_INFO,
      EmailFirstPage: {
        ...MOCK_CMS_INFO.EmailFirstPage,
        splitLayout: true,
      },
    },
  }),
});

export const WithCmsWithSharedFallback = storyWithProps({
  integration: createMockIndexOAuthNativeIntegration({
    isFirefoxClientServiceRelay: true,
    isSync: false,
    cmsInfo: {
      ...MOCK_CMS_INFO,
      EmailFirstPage: {
        ...MOCK_CMS_INFO.EmailFirstPage,
        logoUrl: undefined,
        logoAltText: undefined,
      },
    },
  }),
});

export const WithSuccessBanner = storyWithProps({
  initialSuccessBanner:
    'Container can pass a success message - Mainly used for successful account deletion',
});

export const WithErrorBanner = storyWithProps({
  initialErrorBanner: 'Container can pass an error message',
});

export const WithErrorTooltip = storyWithProps({
  initialTooltipMessage: 'Container can pass a tooltip error',
});
