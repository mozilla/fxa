/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_LOCATION } from '../../partials/location/mocks';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/verifySecondaryCode',
} as Meta;

const createStory = storyWithProps(
  'verifySecondaryCode',
  'Sent to verify the addition of a secondary email via code.',
  {
    ...MOCK_LOCATION,
    email: 'foo@bar.com',
    code: '918398',
  }
);

export const VerifySecondaryCode = createStory();
