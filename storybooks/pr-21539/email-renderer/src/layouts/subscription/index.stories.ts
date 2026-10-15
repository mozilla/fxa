/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { includes } from './mocks';
import { subplatStoryWithProps } from '../../storybook-email';

const createStory = subplatStoryWithProps(
  '_storybook',
  'The Subscription Platform email base layout.',
  {
    subject: 'N/A',
    brandMessagingMode: 'none',
  },
  includes
);

export const LayoutNoProduct = createStory(
  {
    reminderShortForm: true,
  },
  'Reminder short form - no specified product'
);

export const LayoutNoProductWithBrandMessaging = createStory(
  {
    reminderShortForm: true,
    brandMessagingMode: 'postlaunch',
  },
  'Reminder short form - no specified product - with brand messaging'
);

export const LayoutMultipleProducts = createStory(
  {
    subscriptions: [
      {
        productName: '123Done Pro',
      },
      {
        productName: 'Mozilla VPN',
      },
    ],
  },
  'Multiple products - No brand messaging'
);

export const LayoutMultipleProductsWithBrandMessaging = createStory(
  {
    subscriptions: [
      {
        productName: '123Done Pro',
      },
      {
        productName: 'Mozilla VPN',
      },
    ],
    brandMessagingMode: 'postlaunch',
  },
  'Multiple products - With brand messaging'
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

export default {
  title: 'SubPlat Emails/Layout',
  component: LayoutNoProduct,
} as Meta;
