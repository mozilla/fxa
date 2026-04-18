/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_USER_INFO } from '../../partials/userInfo/mocks';
import { includes, TemplateData } from './index';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/passwordlessSigninOtp/Strapi',
} as Meta;

const data: TemplateData = {
  ...MOCK_USER_INFO,
  code: '12345678',
  codeExpiryMinutes: 10,
  supportUrl: 'https://support.mozilla.org',
  time: '11:45 AM',
  date: 'March 5, 2026',
  cmsRpClientId: '00f00f',
  cmsRpFromName: 'Testo Inc.',
  entrypoint: 'quux',
  subject: 'Finish your sign in',
  headline: 'Complete your sign in to Product',
  description:
    'Use the code below to verify your sign-in and access your account.',
  target: 'strapi',
};

const createStory = storyWithProps<TemplateData>(
  'passwordlessSigninOtp',
  'Sent to verify a passwordless sign-in via OTP code.',
  data,
  includes
);

export const PasswordlessSigninOtpEmailStrapi = createStory();
