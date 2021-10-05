/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/postVerify',
} as Meta;

const createStory = storyWithProps(
  'postVerify',
  'Sent after account is confirmed during Sync registration.',
  {
    link: 'http://localhost:3030/connect_another_device',
    desktopLink: 'https://firefox.com',
    onDesktopOrTabletDevice: true,
  }
);

export const PostVerifyDesktopTablet = createStory(
  {
    onDesktopOrTabletDevice: true,
  },
  'User is on desktop or tablet device'
);

export const PostVerifyMobile = createStory(
  {
    onDesktopOrTabletDevice: false,
  },
  'User is on mobile device'
);
