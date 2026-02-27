/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'SubPlat Emails/Templates/subscriptionPaymentExpired',
} as Meta;

const data = {
  productName: '123Done Pro',
  updateBillingUrl: 'http://localhost:3030/subscriptions',
  subscriptionSupportUrl: 'http://localhost:3030/support',
};

const createStory = subplatStoryWithProps<TemplateData>(
  'subscriptionPaymentExpired',
  'Sent whenever a user has a single subscription and their payment method has expired or will expire at the end of the month, triggered by a Stripe webhook.',
  data,
  includes
);

export const SubscriptionPaymentExpired = createStory();
