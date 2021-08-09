/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Story, Meta } from '@storybook/html';
import storybookEmail, { StorybookEmailArgs } from '../../storybook-email';

export default {
  title: 'Emails/cadReminder',
} as Meta;

const Template: Story<StorybookEmailArgs> = (args) => storybookEmail(args);

const defaultVariables = {
  action: 'Sync another device',
  oneClickLink: true,
  link: 'http://localhost:3030/connect_another_device?utm_medium=email&utm_campaign=fx-cad-reminder-first&utm_content=fx-connect-device',
  iosUrl:
    'https://accounts-static.cdn.mozilla.net/product-icons/apple-app-store.png',
  androidUrl:
    'https://accounts-static.cdn.mozilla.net/product-icons/google-play.png',
  onDesktopOrTabletDevice: true,
  subject: 'Your Friendly Reminder: How To Complete Your Sync Setup',
  privacyUrl:
    'https://www.mozilla.org/privacy?utm_medium=email&utm_campaign=fx-cad-reminder-first&utm_content=fx-privacy',
  supportUrl:
    'https://support.mozilla.org/kb/im-having-problems-with-my-firefox-account?utm_medium=email&utm_campaign=fx-cad-reminder-first&utm_content=fx-support',
  headerText: "Here's your reminder to sync devices.",
  bodyText:
    'It takes two to sync. Syncing another device with Firefox privately keeps your bookmarks, passwords and other Firefox data the same everywhere you use Firefox.',
  acceptLanguage: 'en-US',
};

const commonPropsWithOverrides = (
  overrides: Partial<typeof defaultVariables> = {}
) =>
  Object.assign({
    template: 'cadReminderFirst',
    layout: 'fxa',
    doc: 'Connect Another Device (CAD) reminder emails are sent out 24 hours after a user clicks "send me a reminder" on the connect another device page.',
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
