/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'SubPlat Emails/Templates/subscriptionEndingReminder',
} as Meta;

const data = {
  productName: '123Done Pro',
  serviceLastActiveDateOnly: 'July 15, 2025',
  accountSettingsUrl: 'http://localhost:3030/settings',
  subscriptionSupportUrlWithUtm: 'http://localhost:3030/support',
  churnTermsUrlWithUtm: 'http://localhost:3030/support',
  productIconURLNew:
    'https://cdn.accounts.firefox.com/product-icons/mozilla-vpn-email.png',
  ctaButtonLabel: 'Stay subscribed and save 20%',
  ctaButtonUrlWithUtm: 'http://localhost:3030/renew',
  showChurn: true,
};

const createStory = subplatStoryWithProps<TemplateData>(
  'subscriptionEndingReminder',
  'Sent to remind a user their subscriptions is expiring soon.',
  data,
  includes
);

export const SubscriptionEndingReminderWithoutChurn = createStory(
  {
    showChurn: false,
  },
  'Without Churn Prompt'
);

export const SubscriptionEndingReminderWithChurn = createStory(
  {
    showChurn: true,
  },
  'With Churn Prompt'
);
