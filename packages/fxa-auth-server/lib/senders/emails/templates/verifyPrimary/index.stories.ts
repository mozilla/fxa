/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_LOCATION } from '../../partials/location/mocks';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/verifyPrimary',
} as Meta;

const createStory = storyWithProps(
  'verifyPrimary',
  'Sent to users with an unverified primary email, meaning an unverified account, when they attempt an action requiring a verified account.',
  {
    ...MOCK_LOCATION,
    link: 'http://localhost:3030/verify_primary_email',
    sync: false,
    passwordChangeLink: 'http://localhost:3030/settings/change_password',
  }
);

export const VerifyPrimaryEmail = createStory();
