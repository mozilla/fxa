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
import {
  MONITOR_CLIENTIDS,
  POCKET_CLIENTIDS,
} from '../../models/integrations/client-matching';
import { MozServices } from '../../lib/types';
import { MOCK_EMAIL } from '../mocks';

export default {
  title: 'Pages/Index',
  component: Index,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = ({
  ...props // overrides
}: Partial<IndexProps> = {}) => {
  const story = () => <Subject {...props} />;
  return story;
};

export const Default = storyWithProps();

export const WithBouncedEmail = storyWithProps({
  hasBounced: true,
  prefillEmail: MOCK_EMAIL,
});

export const WithServiceRelayIntegration = storyWithProps({
  integration: createMockIndexOAuthNativeIntegration({
    isDesktopRelay: true,
    isSync: false,
  }),
});

export const WithPrefilledEmail = storyWithProps({
  prefillEmail: MOCK_EMAIL,
});

export const WithDeleteAccountSuccess = storyWithProps({
  deleteAccountSuccess: true,
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

export const Pocket = storyWithProps({
  integration: createMockIndexOAuthIntegration({
    clientId: POCKET_CLIENTIDS[0],
  }),
  serviceName: MozServices.Pocket,
});
