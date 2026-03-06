/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_USER_INFO } from '../../partials/userInfo/mocks';
import { storyWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'FxA Emails/Templates/passwordlessSigninOtp',
} as Meta;

const data = {
  ...MOCK_USER_INFO,
  code: '96318398',
  codeExpiryMinutes: 10,
  supportUrl: 'https://support.mozilla.org',
};

const createStory = storyWithProps<TemplateData>(
  'passwordlessSigninOtp',
  'OTP sent to user for passwordless sign-in.',
  data,
  includes
);

export const PasswordlessSigninOtp = createStory();
