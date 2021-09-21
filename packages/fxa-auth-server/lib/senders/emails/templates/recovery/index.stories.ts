/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_LOCATION } from '../../partials/location/mocks';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/recovery',
} as Meta;

const createStory = storyWithProps(
  'recovery',
  'Sent when user begins password reset flow',
  {
    ...MOCK_LOCATION,
    link: 'http://localhost:3030/complete_reset_password',
  }
);

export const Recovery = createStory();
