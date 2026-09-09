/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_USER_INFO } from '../../partials/userInfo/mocks';
import { storyWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'FxA Emails/Templates/verifyShortCode/Strapi',
} as Meta;

const data = {
  ...MOCK_USER_INFO,
  code: '918398',
  cmsRpClientId: '00f00f',
  cmsRpFromName: 'Testo Inc.',
  entrypoint: 'quux',
  subject: 'Confirm Your Account',
  headline: 'Verify you account to start using Product!',
  description: 'Use the code below to verify your account and gogogo',
  supportUrl: 'https://support.mozilla.org',
};

const createStory = storyWithProps<TemplateData>(
  'verifyShortCode',
  'Sent to users to verify their account via code after signing up.',
  data,
  includes,
  'fxa',
  'strapi'
);

export const VerifyShortCodeStrapi = createStory();
