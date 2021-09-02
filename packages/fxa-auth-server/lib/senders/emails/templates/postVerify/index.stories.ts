/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { Template, commonArgs } from '../../storybook-email';

export default {
  title: 'Emails/postVerify',
} as Meta;

const defaultVariables = {
  ...commonArgs,
  action: 'Set up next device',
  desktopLink: 'https://firefox.com',
  subject: 'Account verified. Next, sync another device to finish setup',
  onDesktopOrTabletDevice: true,
};

const commonPropsWithOverrides = (
  overrides: Partial<typeof defaultVariables> = {}
) =>
  Object.assign({
    template: 'postVerify',
    doc: 'postVerify template',
    variables: {
      ...defaultVariables,
      ...overrides,
    },
  });

export const PostVerifyDesktopTablet = Template.bind({});
PostVerifyDesktopTablet.args = commonPropsWithOverrides({
  onDesktopOrTabletDevice: true,
});
PostVerifyDesktopTablet.storyName = 'User is on desktop or tablet device';

export const PostVerifyMobile = Template.bind({});
PostVerifyMobile.args = commonPropsWithOverrides({
  onDesktopOrTabletDevice: false,
});
PostVerifyMobile.storyName = 'User is on mobile device';
