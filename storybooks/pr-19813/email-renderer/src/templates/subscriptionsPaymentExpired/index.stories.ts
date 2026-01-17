/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'SubPlat Emails/Templates/subscriptionsPaymentExpired',
} as Meta;

const data = {
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

  // Had to add this in! Double check value.
  productName: 'Firefox Fortress',
};

const createStory = subplatStoryWithProps<TemplateData>(
  'subscriptionsPaymentExpired',
  'Sent whenever a user has multiple subscriptions and their payment method has expired or will expire at the end of the month.',
  data,
  includes
);

export const SubscriptionsPaymentExpired = createStory();
