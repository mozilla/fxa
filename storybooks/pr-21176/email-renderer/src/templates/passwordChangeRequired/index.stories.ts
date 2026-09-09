/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'FxA Emails/Templates/passwordChangeRequired',
} as Meta;

const data = {
  link: 'http://localhost:3030/reset_password',
};

const createStory = storyWithProps<TemplateData>(
  'passwordChangeRequired',
  "Sent when an account's devices are disconnected and a password change is required due to suspicious activity. It currently needs Ops to manually trigger via bulk-mailer",
  data,
  includes
);

export const PasswordChangeRequired = createStory();
