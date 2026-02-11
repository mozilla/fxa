/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';

export default {
  title: 'SubPlat Emails/Templates/downloadSubscription',
} as Meta;

const createStory = subplatStoryWithProps(
  'downloadSubscription',
  'Sent when a user successfully adds a subscription.',
  {
    icon: 'https://cdn.accounts.firefox.com/product-icons/mozilla-vpn-email.png',
    link: 'http://getfirefox.com/',
    productName: 'Firefox Fortress',
    subscriptionSupportUrl: 'http://localhost:3030/support',
    playStoreLink:
      'https://play.google.com/store/apps/details?id=org.mozilla.firefox',
    appStoreLink:
      'https://apps.apple.com/us/app/firefox-private-safe-browser/id989804926',
    // Forces fallbacks to be used in appBadges partial
    iosUrl: undefined,
    androidUrl: undefined,
  }
);

export const DownloadSubscription = createStory();

export const DownloadSubscriptionJustAppleStore = createStory(
  {
    playStoreLink: undefined,
  },
  'Just Apple App Store'
);

export const DownloadSubscriptionJustAndroidStore = createStory(
  {
    appStoreLink: undefined,
  },
  'Just Android App Store'
);

export const DownloadSubscriptionNoAppStore = createStory(
  {
    appStoreLink: undefined,
    playStoreLink: undefined,
  },
  'No App Store'
);
