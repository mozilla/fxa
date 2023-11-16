/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';

export default {
  title: 'SubPlat Emails/Templates/subscriptionAccountReminderFirst',
} as Meta;

const createStory = subplatStoryWithProps(
  'subscriptionAccountReminderFirst',
  'Sent to a user to remind them to finish setting up a Mozilla account as they signed up through the password-less flow without an existing account.',
  {
    link: 'http://localhost:3030/post_verify/finish_account_setup/set_password',
    reminderShortForm: true,
    resetLink: 'http://localhost:3030/settings/change_password',
    subscriptionSupportUrl: 'http://localhost:3030/support',
  }
);

export const SubscriptionAccountReminderFirst = createStory();
