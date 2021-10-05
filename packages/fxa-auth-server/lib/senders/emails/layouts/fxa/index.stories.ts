/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Layout',
} as Meta;

const createStory = storyWithProps('_storybook', 'The FxA email base layout.', {
  sync: false,
  subject: 'N/A',
});

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
