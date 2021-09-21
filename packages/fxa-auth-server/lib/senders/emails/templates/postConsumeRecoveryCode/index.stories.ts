/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_LOCATION } from '../../partials/location/mocks';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/postConsumeRecoveryCode',
} as Meta;

const createStory = storyWithProps(
  'postConsumeRecoveryCode',
  'Sent when user has used a recovery code',
  {
    ...MOCK_LOCATION,
    link: 'http://localhost:3030/settings',
    passwordChangeLink: 'http://localhost:3030/settings/change_password',
  }
);

export const PostConsumeRecoveryCode = createStory();
