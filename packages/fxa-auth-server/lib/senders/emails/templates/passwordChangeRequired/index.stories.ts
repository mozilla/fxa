/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/passwordChangeRequired',
} as Meta;

const createStory = storyWithProps(
  'passwordChangeRequired',
  "Sent when an account's devices are disconnected and a password change is required due to suspicious activity"
);

export const PasswordChangeRequired = createStory();
