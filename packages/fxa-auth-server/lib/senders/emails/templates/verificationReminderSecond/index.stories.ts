/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { commonArgs, Template } from '../../storybook-email';

export default {
  title: 'Emails/verificationReminderSecond',
} as Meta;

const defaultVariables = {
  ...commonArgs,
  title: 'Still there?',
  description:
    'Almost a week ago you created a Firefox Account but never verified it. We’re worried about you.',
  subDescription:
    "Confirm this email address to activate your account and let us know you're okay.",
  action: 'Confirm email',
  link: 'http://localhost:3030/verify_email',
  subject: 'Final reminder: Activate your account',
};

const commonPropsWithOverrides = (
  overrides: Partial<typeof defaultVariables> = {}
) =>
  Object.assign({
    template: 'verificationReminderSecond',
    variables: {
      ...defaultVariables,
      ...overrides,
    },
  });

export const verificationReminderSecond = Template.bind({});
verificationReminderSecond.args = commonPropsWithOverrides();
verificationReminderSecond.storyName = 'default';
