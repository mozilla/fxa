/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'SubPlat Emails/Templates/subscriptionDowngrade',
} as Meta;

const data = {
  paymentAmountNew: '£123,121.00',
  paymentAmountOld: '¥99,991',
  paymentProrated: '$5,231.00',
  productIconURLNew:
    'https://cdn.accounts.firefox.com/product-icons/mozilla-vpn-email.png',
  productIconURLOld:
    'https://cdn.accounts.firefox.com/product-icons/mozilla-vpn-email.png',
  productName: 'Product Name B',
  productNameOld: 'Product Name A',
  productPaymentCycleNew: 'month',
  productPaymentCycleOld: 'year',
  subscriptionSupportUrl: 'http://localhost:3030/support',
};

const createStory = subplatStoryWithProps<TemplateData>(
  'subscriptionDowngrade',
  'Sent when a user downgrades their subscription.',
  data,
  includes
);

export const SubscriptionDowngrade = createStory();
