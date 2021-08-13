/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Story, Meta } from '@storybook/html';
import storybookEmail, { StorybookEmailArgs } from '../../storybook-email';
import * as cadReminderFirst from '../cadReminderFirst/index.stories';

export default {
  title: 'Emails/cadReminderSecond',
} as Meta;

const Template: Story<StorybookEmailArgs> = (args) => storybookEmail(args);

const defaultVariables = {
  ...cadReminderFirst.CadReminderDesktopTablet.args.variables,
  bodyText:
    'Syncing another device with Firefox privately keeps your bookmarks, passwords and other Firefox data the same everywhere you use Firefox.',
  headerText: 'Last reminder to sync devices!',
  subject: 'Final Reminder: Complete Sync Setup',
};

const commonPropsWithOverrides = (
  overrides: Partial<typeof defaultVariables> = {}
) =>
  Object.assign({
    template: 'cadReminderSecond',
    doc: 'Connect Another Device (CAD) second reminder email is sent out 72 hours after a user clicks "send me a reminder" on the connect another device page.',
    variables: {
      ...defaultVariables,
      ...overrides,
    },
  });

export const CadReminderDesktopTablet = Template.bind({});
CadReminderDesktopTablet.args = commonPropsWithOverrides({
  onDesktopOrTabletDevice: true,
});
CadReminderDesktopTablet.storyName = 'User is on desktop or tablet device';

export const CadReminderMobile = Template.bind({});
CadReminderMobile.args = commonPropsWithOverrides({
  onDesktopOrTabletDevice: false,
});
CadReminderMobile.storyName = 'User is on mobile device';
