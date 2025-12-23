/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';

export default {
  title: 'SubPlat Emails/Templates/subscriptionStaySubscribedReminder',
} as Meta;

const createStory = subplatStoryWithProps(
  'subscriptionStaySubscribedReminder',
  'Sent to remind a user their subscriptions is expiring soon.',
  {
    productName: 'Firefox Fortress',
    serviceLastActiveDateOnly: 'July 15, 2025',
    accountSettingsUrl: 'http://localhost:3030/settings',
    subscriptionSupportUrl: 'http://localhost:3030/support',
    churnTermsUrl: 'http://localhost:3030/support',
    productIconURLNew:
      'https://cdn.accounts.firefox.com/product-icons/mozilla-vpn-email.png',
    ctaButtonLabel: 'Stay subscribed and save 20%',
    ctaButtonUrl: 'http://localhost:3030/renew',
    showChurn: true,
  }
);

export const SubscriptionReactivation = createStory();
