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
  'Sent to remind a user of an upcoming automatic subscription renewal X days out from charge (X being what is set in the Stripe dashboard)',
  {
    productName: 'Firefox Fortress',
    invoiceTotal: '$20.00',
    planInterval: 'week',
    planIntervalCount: '2',
    reminderLength: '14',
    subscriptionSupportUrl: 'http://localhost:3030/support',
    updateBillingUrl: 'http://localhost:3030/subscriptions',
  }
);

export const SubscriptionReactivation = createStory();
