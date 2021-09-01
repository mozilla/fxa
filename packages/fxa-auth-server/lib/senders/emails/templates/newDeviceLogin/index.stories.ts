/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { commonArgs, Template } from '../../storybook-email';

export default {
  title: 'Emails/newDeviceLogin',
} as Meta;

export const newDeviceLogin = Template.bind({});
newDeviceLogin.args = {
  template: 'newDeviceLogin',
  variables: {
    ...commonArgs,
    date: 'Thursday, Sep 2, 2021',
    device: 'Firefox on Mac OSX 10.11',
    ip: '10.246.67.38',
    location: 'Madrid, Spain (estimated)',
    time: '12:26:44 AM (CEST)',
    action: 'Manage account',
    clientName: 'Firefox',
    passwordChangeLink: 'http://localhost:3030/settings/change_password',
    subject: 'New sign-in to Firefox',
  },
};
newDeviceLogin.storyName = 'default';
