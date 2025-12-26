/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';
import { MOCK_USER_INFO } from '../../partials/userInfo/mocks';
import { includes, TemplateData } from './index';

export default {
  title: 'FxA Emails/Templates/postChangeRecoveryPhone',
} as Meta;

const data = {
  ...MOCK_USER_INFO,
  resetLink: 'http://localhost:3030/reset_password',
};

const createStory = storyWithProps<TemplateData>(
  'postChangeRecoveryPhone',
  'Sent when a user updates their recovery phone number.',
  data,
  includes
);

export const PostChangeRecoveryPhone = createStory();
