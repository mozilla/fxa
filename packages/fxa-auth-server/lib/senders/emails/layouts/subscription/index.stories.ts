/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';

export default {
  title: 'SubPlat Emails/Layout',
} as Meta;

const createStory = subplatStoryWithProps(
  '_storybook',
  'The Subscription Platform email base layout.',
  {
    subject: 'N/A',
  }
);

export const LayoutNoProduct = createStory(
  {
    reminderShortForm: true,
  },
  'Reminder short form - user has Firefox account, no specific product, shows Mozilla Privacy Policy and Firefox Cloud Terms of Service links, hides Terms and cancellation policy, Cancel/Reactivate subscription, and Update billing information links'
);

export const LayoutMultipleProducts = createStory(
  {
    subscriptions: [
      {
        productName: 'Firefox Fortress',
      },
      {
        productName: 'Mozilla VPN',
      },
    ],
  },
  'Multiple products'
);

export const LayoutWithProduct = createStory(
  {
    productName: 'Mozilla VPN',
  },
  'Specific product'
);

export const LayoutWithProductCancellation = createStory(
  {
    productName: 'Mozilla VPN',
    isCancellationEmail: true,
  },
  'Cancellation email'
);
