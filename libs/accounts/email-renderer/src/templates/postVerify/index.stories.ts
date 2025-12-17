/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'FxA Emails/Templates/postVerify',
} as Meta;

const data = {
  link: 'http://localhost:3030/connect_another_device',
  desktopLink: 'https://firefox.com',
  onDesktopOrTabletDevice: true,
  productName: 'Firefox',
  playStoreLink:
    'https://play.google.com/store/apps/details?id=org.mozilla.firefox',
  appStoreLink:
    'https://apps.apple.com/us/app/firefox-private-safe-browser/id989804926',
  supportUrl: 'https://support.mozilla.org',
  cssPath: '',
  hideDeviceLink: true,
};

const createStory = storyWithProps<TemplateData>(
  'postVerify',
  'Sent after account is confirmed during Sync registration on non-mobile and mobile devices.',
  data,
  includes
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
