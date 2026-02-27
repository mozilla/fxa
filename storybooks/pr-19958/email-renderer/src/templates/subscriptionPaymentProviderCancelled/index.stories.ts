/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'SubPlat Emails/Templates/subscriptionPaymentProviderCancelled',
} as Meta;

const data = {
  productName: 'Firefox Fortress',
  subscriptionSupportUrl: 'http://localhost:3030/support',
  updateBillingUrl: 'http://localhost:3030/subscriptions',
};

const createStory = subplatStoryWithProps<TemplateData>(
  'subscriptionPaymentProviderCancelled',
  'Sent when a problem is detected with the payment method.',
  data,
  includes
);

export const SubscriptionPaymentProviderCancelled = createStory();
