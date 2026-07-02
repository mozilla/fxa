/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';
import { MOCK_USER_INFO } from '../../partials/userInfo/mocks';
import { includes, TemplateData } from './index';

export default {
  title: 'FxA Emails/Templates/passwordResetRecoveryPhone',
} as Meta;

const data = {
  ...MOCK_USER_INFO,
  link: 'http://localhost:3030/settings',
  resetLink: 'http://localhost:3030/reset_password',
  twoFactorSettingsLink:
    'http://localhost:3030/settings#two-step-authentication',
  supportUrl: 'http://localhost:3030/support',
};

const createStory = storyWithProps<TemplateData>(
  'passwordResetRecoveryPhone',
  'Sent when a user uses their recovery phone to reset their password as an alternative to their authenticator app.',
  data,
  includes
);

export const passwordResetRecoveryPhone = createStory();
