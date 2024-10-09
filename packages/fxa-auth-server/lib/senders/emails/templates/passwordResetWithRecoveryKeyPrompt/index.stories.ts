/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_USER_INFO } from '../../partials/userInfo/mocks';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/passwordResetWithRecoveryKeyPrompt',
} as Meta;

const createStory = storyWithProps(
  'passwordResetWithRecoveryKeyPrompt',
  'Sent when a sync user resets their password without an account recovery key.',
  {
    ...MOCK_USER_INFO,
    link: 'http://localhost:3030/settings/account_recovery',
    passwordChangeLink: 'http://localhost:3030/settings/change_password',
    productName: 'Firefox',
  }
);

export const PasswordResetWithRecoveryKeyPrompt = createStory();
