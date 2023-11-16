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
  'Reminder short form - no specified product'
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

export const LayoutWithWasDeleted = createStory(
  {
    wasDeleted: true,
  },
  'Fraudulent account deletion'
);
