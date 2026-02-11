/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';
import { MOCK_USER_INFO } from '../../partials/userInfo/mocks';

export default {
  title: 'FxA Emails/Templates/postAddRecoveryPhone',
} as Meta;

const createStory = storyWithProps(
  'postAddRecoveryPhone',
  'Sent when a user adds their phone number as a backup recovery method',
  {
    ...MOCK_USER_INFO,
    maskedLastFourPhoneNumber: '••••••1234',
    link: 'http://localhost:3030/settings',
    resetLink: 'http://localhost:3030/reset_password',
    twoFactorSupportLink:
      'https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication',
  }
);

export const PostAddRecoveryPhone = createStory();
