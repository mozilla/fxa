/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';

export default {
  title: 'SubPlat Emails/Templates/subscriptionsPaymentExpired',
} as Meta;

const createStory = subplatStoryWithProps(
  'subscriptionsPaymentExpired',
  'Sent whenever a user has multiple subscriptions and their card will expire at the end of the month.',
  {
    subscriptions: [
      {
        productName: 'Firefox Fortress',
      },
      {
        productName: 'Mozilla VPN',
      },
    ],
    updateBillingUrl: 'http://localhost:3030/subscriptions',
    subscriptionSupportUrl: 'http://localhost:3030/support',
  }
);

export const SubscriptionsPaymentExpired = createStory();
