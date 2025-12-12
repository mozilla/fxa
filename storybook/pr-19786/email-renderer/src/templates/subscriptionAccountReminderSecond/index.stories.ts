/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'SubPlat Emails/Templates/subscriptionAccountReminderSecond',
} as Meta;

const data = {
  link: 'http://localhost:3030/post_verify/finish_account_setup/set_password',
  reminderShortForm: true,
  resetLink: 'http://localhost:3030/settings/change_password',
  subscriptionSupportUrl: 'http://localhost:3030/support',
};

const createStory = subplatStoryWithProps<TemplateData>(
  'subscriptionAccountReminderSecond',
  'Sent as a final reminder to a user to remind them to finish setting up a Mozilla account as they signed up through the password-less flow without an existing account.',
  data,
  includes
);

export const SubscriptionAccountReminderSecond = createStory();
