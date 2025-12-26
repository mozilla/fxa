/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_USER_INFO } from '../../partials/userInfo/mocks';
import { storyWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'FxA Emails/Templates/postConsumeRecoveryCode',
} as Meta;

const data = {
  ...MOCK_USER_INFO,
  link: 'http://localhost:3030/settings',
  resetLink: 'http://localhost:3030/reset_password',
  twoFactorSettingsLink:
    'http://localhost:3030/settings#two-step-authentication',
};

const createStory = storyWithProps<TemplateData>(
  'postConsumeRecoveryCode',
  'Sent when user has used a backup authentication code to authorize a password reset',
  data,
  includes
);

export const PostConsumeRecoveryCode = createStory();
