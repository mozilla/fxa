/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'SubPlat Emails/Templates/subscriptionsPaymentProviderCancelled',
} as Meta;

const data = {
  subscriptions: [
    {
      productName: '123Done Pro',
    },
    {
      productName: 'Mozilla VPN',
    },
  ],
  subscriptionSupportUrl: 'http://localhost:3030/support',
  updateBillingUrl: 'http://localhost:3030/subscriptions',

  // Had to add this in. Double check!
  productName: '123Done Pro',
};

const createStory = subplatStoryWithProps<TemplateData>(
  'subscriptionsPaymentProviderCancelled',
  'Sent when a user has multiple subscriptions and a problem has been detected with payment method.',
  data,
  includes
);

export const SubscriptionsPaymentProviderCancelled = createStory();
