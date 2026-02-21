/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'SubPlat Emails/Templates/subscriptionRenewalReminder',
} as Meta;

const data = {
  productName: 'Firefox Fortress',
  invoiceTotal: '$20.00',
  planInterval: 'month',
  planIntervalCount: '1',
  reminderLength: '7',
  subscriptionSupportUrl: 'http://localhost:3030/support',
  updateBillingUrl: 'http://localhost:3030/subscriptions',
  hadDiscount: false,
};

const createStory = subplatStoryWithProps<TemplateData>(
  'subscriptionRenewalReminder',
  'Sent to remind a user of an upcoming automatic subscription renewal X days out from charge',
  data,
  includes
);

export const MonthlyPlanNoDiscount = createStory(
  {},
  'Monthly Plan - No Discount'
);

export const MonthlyPlanDiscountEnding = createStory(
  {
    hadDiscount: true,
  },
  'Monthly Plan - Discount Ending'
);

export const YearlyPlanNoDiscount = createStory(
  {
    planInterval: 'year',
    planIntervalCount: '1',
    reminderLength: '15',
    invoiceTotal: '$199.99',
    hadDiscount: false,
  },
  'Yearly Plan - No Discount'
);

export const YearlyPlanDiscountEnding = createStory(
  {
    planInterval: 'year',
    planIntervalCount: '1',
    reminderLength: '15',
    invoiceTotal: '$199.99',
    hadDiscount: true,
  },
  'Yearly Plan - Discount Ending'
);
