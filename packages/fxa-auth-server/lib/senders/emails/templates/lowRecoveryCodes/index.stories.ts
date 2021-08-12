/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Story, Meta } from '@storybook/html';
import storybookEmail, { StorybookEmailArgs } from '../../storybook-email';

export default {
  title: 'Emails/lowRecoveryCodes',
} as Meta;

const Template: Story<StorybookEmailArgs> = (args) => storybookEmail(args);

const defaultVariables = {
  action: 'Generate codes',
  link: 'http://localhost:3030/settings/two_step_authentication/replace_codes?low_recovery_codes=true',
  subject: '2 recovery codes remaining',
  privacyUrl: 'https://www.mozilla.org/privacy',
  supportUrl:
    'https://support.mozilla.org/kb/im-having-problems-with-my-firefox-account',
  acceptLanguage: 'en-US',
  numberRemaining: 1,
};

const commonPropsWithOverrides = (
  overrides: Partial<typeof defaultVariables> = {}
) =>
  Object.assign({
    template: 'lowRecoveryCodes',
    layout: 'fxa',
    doc: 'Low Recovery Code emails are sent when a user has 2 or less recovery codes remaining',
    variables: {
      ...defaultVariables,
      ...overrides,
    },
  });

export const LowRecoveryCodesOne = Template.bind({});
LowRecoveryCodesOne.args = commonPropsWithOverrides({
  numberRemaining: 1,
});
LowRecoveryCodesOne.storyName = 'User has 1 recovery code remaining';

export const LowRecoveryCodesMultiple = Template.bind({});
LowRecoveryCodesMultiple.args = commonPropsWithOverrides({
  numberRemaining: 2,
});
LowRecoveryCodesMultiple.storyName =
  'User has more than 1 recovery codes remaining';
