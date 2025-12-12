/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_USER_INFO } from '../../partials/userInfo/mocks';
import { storyWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'FxA Emails/Templates/recovery',
} as Meta;

const data = {
  ...MOCK_USER_INFO,
  link: 'http://localhost:3030/complete_reset_password',
  supportUrl: 'https://support.mozilla.org',
};

const createStory = storyWithProps<TemplateData>(
  'recovery',
  'Sent when user begins password reset flow',
  data,
  includes
);

export const Recovery = createStory();
