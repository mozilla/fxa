/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { commonArgs, Template } from '../../storybook-email';

export default {
  title: 'Emails/verify',
} as Meta;

const defaultVariables = {
  ...commonArgs,
  location: 'Madrid, Spain (estimated)',
  device: 'Firefox on Mac OSX 10.11',
  ip: '10.246.67.38',
  link: 'http://localhost:3030/verify_email',
  action: 'Confirm email',
  subject: 'Finish creating your account',
  sync: true,
};

export const verifyEmail = Template.bind({});
verifyEmail.args = {
  template: 'verify',
  doc: 'Low Recovery Code emails are sent when a user has 2 or less recovery codes remaining',
  variables: {
    ...defaultVariables,
  },
};
verifyEmail.storyName = 'default';
