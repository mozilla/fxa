/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_USER_INFO } from '../../partials/userInfo/mocks';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/postNewRecoveryCodes',
} as Meta;

const createStory = storyWithProps(
  'postNewRecoveryCodes',
  'Sent when user has created new backup authentication codes, resetting their existing ones',
  {
    ...MOCK_USER_INFO,
    link: 'http://localhost:3030/settings',
    passwordChangeLink: 'http://localhost:3030/settings/change_password',
  }
);

export const PostNewRecoveryCodes = createStory();
