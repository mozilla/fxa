/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';
import { MOCK_USER_INFO } from '../../partials/userInfo/mocks';

export default {
  title: 'FxA Emails/Templates/postSigninRecoveryPhone',
} as Meta;

const createStory = storyWithProps(
  'postSigninRecoveryPhone',
  'Sent when a user uses their recovery phone to sign in as an alternative to their authenticator app.',
  {
    ...MOCK_USER_INFO,
    link: 'http://localhost:3030/settings',
    resetLink: 'http://localhost:3030/reset_password',
  }
);

export const postSigninRecoveryPhone = createStory();
