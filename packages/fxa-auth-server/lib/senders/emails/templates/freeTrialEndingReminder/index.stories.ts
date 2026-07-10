/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';

export default {
  title: 'SubPlat Emails/Templates/freeTrialEndingReminder',
} as Meta;

const createStory = subplatStoryWithProps(
  'freeTrialEndingReminder',
  'Sent to remind a user their free trial is ending and will convert to a paid subscription.',
  {
    productName: '123Done Pro',
    serviceLastActiveDateOnly: 'July 15, 2025',
    invoiceTotal: '$9.99',
    invoiceSubtotal: '$12.99',
    invoiceDiscountAmount: '$3.00',
    invoiceTaxAmount: '$1.20',
    showTaxAmount: true,
    showDiscount: true,
    updateBillingUrl: 'http://localhost:3030/subscriptions',
    cancelSubscriptionUrl: 'http://localhost:3030/subscriptions',
    subscriptionSupportUrlWithUtm: 'http://localhost:3030/support',
    productIconURLNew:
      'https://cdn.accounts.firefox.com/product-icons/mozilla-vpn-email.png',
  }
);

export const FreeTrialEndingReminderFull = createStory(
  {},
  'With Tax and Discount'
);

export const FreeTrialEndingReminderNoTaxNoDiscount = createStory(
  {
    showTaxAmount: false,
    showDiscount: false,
    invoiceTotal: '$12.99',
  },
  'Without Tax or Discount'
);

