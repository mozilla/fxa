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
    invoiceAmountDue: '$10.00',
    paymentAmountNew: '$69.89',
    paymentAmountOld: '$9.89',
    productIconURLNew:
      'https://cdn.accounts.firefox.com/product-icons/mozilla-vpn-email.png',
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

export const PositiveProratedWithTax = createStory(
  {
    paymentProrated: '$60.00',
    paymentProratedInCents: 6000,
    paymentTaxOldInCents: 50,
    paymentTaxOld: '$0.50',
    paymentTaxNewInCents: 60,
    paymentTaxNew: '$0.60',
  },
  'Charge - Prorated amount with tax is positive'
);

export const NegativeProrated = createStory(
  {
    paymentProrated: '$60.00',
    paymentProratedInCents: -6000,
  },
  'Credit - Prorated amount is negative'
);

export const NegativeProratedWithTax = createStory(
  {
    paymentProrated: '$60.00',
    paymentProratedInCents: -6000,
    paymentTaxOldInCents: 50,
    paymentTaxOld: '$0.50',
    paymentTaxNewInCents: 60,
    paymentTaxNew: '$0.60',
  },
  'Credit - Prorated amount with tax is negative'
);

export const NoProrated = createStory(
  {
    paymentProrated: '$0.00',
    paymentProratedInCents: 0,
  },
  'Prorated amount is zero'
);
