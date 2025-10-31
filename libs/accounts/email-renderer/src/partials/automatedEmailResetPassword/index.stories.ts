/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';
import { includes } from '../mocks';

export default {
  title: 'Partials/footers/automatedEmailResetPassword',
} as Meta;

const createStory = storyWithProps(
  '_storybook',
  'This partial is used in footers for automated emails where password reset is recommended.',
  {
    layout: null,
    subject: 'N/A',
    partial: 'automatedEmailResetPassword',
    resetLink: 'http://localhost:3030/reset_password',
  },
  includes
);

export const AutomatedEmailResetPassword = createStory();
