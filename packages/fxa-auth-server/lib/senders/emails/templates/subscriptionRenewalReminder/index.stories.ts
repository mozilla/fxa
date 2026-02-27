/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';

export default {
  title: 'SubPlat Emails/Templates/subscriptionRenewalReminder',
} as Meta;

const createStory = subplatStoryWithProps(
  'subscriptionRenewalReminder',
  'Sent to remind a user of an upcoming automatic subscription renewal X days out from charge',
  {
    productName: '123Done Pro',
    invoiceTotal: '$20.00',
    planInterval: 'month',
    reminderLength: '7',
    subscriptionSupportUrl: 'http://localhost:3030/support',
    updateBillingUrl: 'http://localhost:3030/subscriptions',
    discountEnding: false,
    hasDifferentDiscount: false,
    invoiceTax: undefined,
    showTax: false,
  }
);

export const MonthlyPlanNoDiscount = createStory(
  {},
  'Monthly Plan - No Discount'
);

export const MonthlyPlanDiscountEnding = createStory(
  {
    discountEnding: true,
  },
  'Monthly Plan - Discount Ending'
);

export const YearlyPlanNoDiscount = createStory(
  {
    planInterval: 'year',
    reminderLength: '15',
    invoiceTotal: '$199.99',
    discountEnding: false,
  },
  'Yearly Plan - No Discount'
);

export const YearlyPlanDiscountEnding = createStory(
  {
    planInterval: 'year',
    reminderLength: '15',
    invoiceTotal: '$199.99',
    discountEnding: true,
    hasDifferentDiscount: false,
  },
  'Yearly Plan - Discount Ending'
);

export const MonthlyPlanDiscountChanging = createStory(
  {
    discountEnding: true,
    hasDifferentDiscount: true,
    invoiceTotal: '$14.00',
  },
  'Monthly Plan - Discount Changing'
);

export const YearlyPlanDiscountChanging = createStory(
  {
    planInterval: 'year',
    planIntervalCount: '1',
    reminderLength: '15',
    invoiceTotal: '$139.99',
    discountEnding: true,
    hasDifferentDiscount: true,
  },
  'Yearly Plan - Discount Changing'
);

export const MonthlyPlanWithTax = createStory(
  {
    showTax: true,
    invoiceTotalExcludingTax: '$20.00',
    invoiceTax: '$2.60',
    invoiceTotal: '$22.60',
  },
  'Monthly Plan - With Tax'
);
