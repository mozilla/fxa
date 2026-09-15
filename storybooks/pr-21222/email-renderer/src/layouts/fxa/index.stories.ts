/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';
import { includes } from './mocks';

export default {
  title: 'FxA Emails/Layout',
} as Meta;

const createStory = storyWithProps(
  '_storybook',
  'The FxA email base layout.',
  {
    sync: false,
    subject: 'N/A',
  },
  includes
);

export const NotThroughSyncFlow = createStory(
  {},
  'Email not triggered through sync flow'
);

export const ThroughSyncFlow = createStory(
  {
    sync: true,
  },
  'Email triggered through sync flow'
);

export const MessagingNotThroughSyncFlowWithBrandMessaging = createStory(
  {
    brandMessagingMode: 'postlaunch',
  },
  'Email not triggered through sync flow with brand messaging'
);

export const MessagingThroughSyncFlowWithBrandMessaging = createStory(
  {
    brandMessagingMode: 'postlaunch',
  },
  'Email triggered through sync flow with brand messaging'
);
