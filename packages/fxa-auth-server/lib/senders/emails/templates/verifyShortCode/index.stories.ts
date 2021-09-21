/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_LOCATION } from '../../partials/location/mocks';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/verifyShortCode',
} as Meta;

const createStory = storyWithProps(
  'verifyShortCode',
  'Sent to users to verify their account via code after signing up.',
  {
    ...MOCK_LOCATION,
    code: '918398',
  }
);

export const VerifyShortCode = createStory();
