/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';

export default {
  title: 'SubPlat Emails/Templates/subscriptionUpgrade',
} as Meta;

const createStory = subplatStoryWithProps(
  'subscriptionUpgrade',
  'Sent when a user upgrades their subscription.',
  {
    paymentAmountNew: '£123,121.00',
    paymentAmountOld: '¥99,991',
    productIconURLNew:
      'https://accounts-static.cdn.mozilla.net/product-icons/mozilla-vpn-email.png',
    productIconURLOld:
      'https://accounts-static.cdn.mozilla.net/product-icons/mozilla-vpn-email.png',
    productNameNew: 'Product Name B',
    productNameOld: 'Product Name A',
    productPaymentCycleNew: 'year',
    productPaymentCycleOld: 'month',
    paymentProrated: '$5,231.00',
    subscriptionSupportUrl: 'http://localhost:3030/support',
  }
);

export const SubscriptionUpgrade = createStory();
