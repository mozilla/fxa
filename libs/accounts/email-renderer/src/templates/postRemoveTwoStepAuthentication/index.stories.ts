/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_USER_INFO } from '../../partials/userInfo/mocks';
import { storyWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'FxA Emails/Templates/postRemoveTwoStepAuthentication',
} as Meta;

const data = {
  ...MOCK_USER_INFO,
  link: 'http://localhost:3030/settings',
  passwordChangeLink: 'http://localhost:3030/settings/change_password',
};

const createStory = storyWithProps<TemplateData>(
  'postRemoveTwoStepAuthentication',
  'Sent when a user disables two-step authentication.',
  data,
  includes
);

export const PostRemoveAccountRecovery = createStory();
