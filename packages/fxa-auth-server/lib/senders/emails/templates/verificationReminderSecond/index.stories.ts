/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Story, Meta } from '@storybook/html';
import storybookEmail, {
  StorybookEmailArgs,
  commonArgs,
} from '../../storybook-email';
import { templateVariables } from '.';

export default {
  title: 'Emails/verificationReminderSecond',
} as Meta;

const Template: Story<StorybookEmailArgs> = (args) => storybookEmail(args);

const defaultVariables = {
  ...commonArgs,
  ...templateVariables,
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
