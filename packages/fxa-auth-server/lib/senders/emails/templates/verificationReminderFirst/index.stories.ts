/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { commonArgs, Template } from '../../storybook-email';

export default {
  title: 'Emails/verificationReminderFirst',
} as Meta;

const defaultVariables = {
  ...commonArgs,
  title: 'Welcome to the Firefox family',
  description:
    'A few days ago you created a Firefox account, but never confirmed it.',
  subDescription:
    'Confirm now and get technology that fights for and protects your privacy, arms you with practical knowledge, and the respect you deserve.',
  action: 'Confirm email',
  link: 'http://localhost:3030/verify_email',
  subject: 'Reminder: Finish creating your account',
};

const commonPropsWithOverrides = (
  overrides: Partial<typeof defaultVariables> = {}
) =>
  Object.assign({
    template: 'verificationReminderFirst',
    variables: {
      ...defaultVariables,
      ...overrides,
    },
  });

export const verificationReminderFirst = Template.bind({});
verificationReminderFirst.args = commonPropsWithOverrides();
verificationReminderFirst.storyName = 'default';
