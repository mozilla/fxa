/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_USER_INFO } from '../../partials/userInfo/mocks';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/passwordForgotOtp',
} as Meta;

const createStory = storyWithProps(
  'passwordForgotOtp',
  'OTP sent to user to start password reset.',
  {
    ...MOCK_USER_INFO,
    code: '96318398',
  }
);

export const PasswordForgotOtp = createStory();
