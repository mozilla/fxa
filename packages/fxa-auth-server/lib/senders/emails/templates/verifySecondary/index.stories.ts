/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_LOCATION } from '../../partials/location/mocks';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/verifySecondary',
} as Meta;

const createStory = storyWithProps(
  'verifySecondary',
  'Sent to verify the addition of a secondary email via link.',
  {
    ...MOCK_LOCATION,
    email: 'foo@bar.com',
    link: 'http://localhost:3030/verify_email',
  }
);

export const VerifySecondary = createStory();
