/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';

export default {
  title: 'SubPlat Emails/Templates/subscriptionReactivation',
} as Meta;

const createStory = subplatStoryWithProps(
  'subscriptionReactivation',
  'Sent when a user reactivates their subscription.',
  {
    productName: 'Firefox Fortress',
    invoiceTotal: '$20',
    nextInvoiceDateOnly: '11/13/2021',
    icon: 'https://placekitten.com/512/512',
    subscriptionSupportUrl: 'http://localhost:3030/support',
  }
);

export const SubscriptionReactivation = createStory();
