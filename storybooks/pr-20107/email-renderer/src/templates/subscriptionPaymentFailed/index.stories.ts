/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'SubPlat Emails/Templates/subscriptionPaymentFailed',
} as Meta;

const data = {
  icon: 'https://cdn.accounts.firefox.com/product-icons/mozilla-vpn-email.png',
  productName: 'Firefox Fortress',
  subscriptionSupportUrl: 'http://localhost:3030/support',
  updateBillingUrl: 'http://localhost:3030/subscriptions',
};

const createStory = subplatStoryWithProps<TemplateData>(
  'subscriptionPaymentFailed',
  'Sent when there is a problem with the latest payment.',
  data,
  includes
);

export const SubscriptionPaymentFailed = createStory();
