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
    paymentAmountNew: '$69.89',
    paymentAmountOld: '$9.89',
    productIconURLNew:
      'https://accounts-static.cdn.mozilla.net/product-icons/mozilla-vpn-email.png',
    productName: 'Product Name B',
    productNameOld: 'Product Name A',
    productPaymentCycleNew: 'year',
    productPaymentCycleOld: 'month',
    paymentProrated: '$60.00',
    subscriptionSupportUrl: 'http://localhost:3030/support',
  }
);

export const PositiveProrated = createStory(
  {
    paymentProrated: '$60.00',
    paymentProratedInCents: 6000,
  },
  'Charge - Prorated amount is positive'
);

export const NegativeProrated = createStory(
  {
    paymentProrated: '$60.00',
    paymentProratedInCents: -6000,
  },
  'Credit - Prorated amount is negative'
);

export const NoProrated = createStory(
  {
    paymentProrated: '$0.00',
    paymentProratedInCents: 0,
  },
  'Prorated amount is zero'
);
