/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_LOCATION } from '../../partials/location/mocks';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/passwordChanged',
} as Meta;

const createStory = storyWithProps(
  'passwordChanged',
  'Sent when password has been changed.',
  {
    ...MOCK_LOCATION,
    resetLink: 'http://localhost:3030/settings/change_password',
  }
);

export const PasswordChanged = createStory();
