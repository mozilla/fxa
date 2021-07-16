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
  buttonText: 'Sync another device',
  anotherDeviceURL:
    '/connect_another_device?utm_medium=email&utm_campaign=fx-cad-reminder-first&utm_content=fx-connect-device',
  iosURL:
    'https://accounts-static.cdn.mozilla.net/product-icons/apple-app-store.png',
  androidURL:
    'https://accounts-static.cdn.mozilla.net/product-icons/google-play.png',
  onDesktopOrTabletDevice: true,
};

const commonPropsWithOverrides = (
  overrides: Partial<typeof defaultVariables> = {}
) =>
  Object.assign({
    template: 'cadReminder',
    doc: 'The Connect Another Device Reminder is sent when [TODO: documentation].',
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
