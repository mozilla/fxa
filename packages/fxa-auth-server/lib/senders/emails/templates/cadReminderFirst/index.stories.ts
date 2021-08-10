/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Story, Meta } from '@storybook/html';
import storybookEmail, {
  StorybookEmailArgs,
  commonArgs,
} from '../../storybook-email';

export default {
  title: 'Emails/cadReminderFirst',
} as Meta;

const Template: Story<StorybookEmailArgs> = (args) => storybookEmail(args);

const defaultVariables = {
  ...commonArgs,
  link: 'http://localhost:3030/connect_another_device',
  action: 'Sync another device',
  androidUrl:
    'https://accounts-static.cdn.mozilla.net/product-icons/google-play.png',
  iosUrl:
    'https://accounts-static.cdn.mozilla.net/product-icons/apple-app-store.png',
  onDesktopOrTabletDevice: true,
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

export const CadReminderArLocale = Template.bind({});
CadReminderArLocale.args = commonPropsWithOverrides({
  acceptLanguage: 'ar',
});
CadReminderArLocale.storyName = 'User has ar locale';
