/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_USER_INFO } from '../../partials/userInfo/mocks';
import { storyWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'FxA Emails/Templates/verify',
} as Meta;

const data = {
  ...MOCK_USER_INFO,
  link: 'http://localhost:3030/verify_email',
  sync: true,
};

const createStory = storyWithProps<TemplateData>(
  'verify',
  "Sent to users that create an account through Firefox, don't verify their email, and go into Sync preferences to resend the verification email as a link.",
  data,
  includes
);

export const VerifyEmail = createStory();
