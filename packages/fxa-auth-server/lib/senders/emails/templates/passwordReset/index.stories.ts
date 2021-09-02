/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { commonArgs, Template } from '../../storybook-email';

export default {
  title: 'Emails/passwordReset',
} as Meta;

export const passwordReset = Template.bind({});
passwordReset.args = {
  template: 'passwordReset',
  variables: {
    ...commonArgs,
    resetLink: 'http://localhost:3030/settings/change_password',
    subject: 'Password updated',
  },
};
passwordReset.storyName = 'default';
