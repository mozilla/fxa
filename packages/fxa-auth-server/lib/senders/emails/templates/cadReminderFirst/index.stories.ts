/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import {
  Template,
  commonArgs,
  StorybookEmailArgs,
} from '../../storybook-email';

export default {
  title: 'Emails/cadReminderFirst',
} as Meta;

const defaultVariables = {
  ...commonArgs,
  action: 'Sync another device',
  oneClickLink: true,
  bodyText:
    'It takes two to sync. Syncing another device with Firefox privately keeps your bookmarks, passwords and other Firefox data the same everywhere you use Firefox.',
  headerText: "Here's your reminder to sync devices.",
  subject: 'Your Friendly Reminder: How To Complete Your Sync Setup',
};

const commonPropsWithOverrides = (
  overrides: Partial<
    typeof defaultVariables | StorybookEmailArgs['variables']
  > = {}
) =>
  Object.assign({
    template: 'cadReminderFirst',
    doc: 'Connect Another Device (CAD) first reminder email is sent out 8 hours after a user clicks "send me a reminder" on the connect another device page.',
    variables: {
      ...defaultVariables,
      ...overrides,
    },
  });

export const CadReminderDefault = Template.bind({});
CadReminderDefault.args = commonPropsWithOverrides();
CadReminderDefault.storyName = 'default';

export const CadReminderArLocale = Template.bind({});
CadReminderArLocale.args = commonPropsWithOverrides({
  acceptLanguage: 'ar',
});
CadReminderArLocale.storyName = 'User has ar locale';
