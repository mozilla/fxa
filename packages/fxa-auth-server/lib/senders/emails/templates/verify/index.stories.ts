/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_LOCATION_TRUNCATED } from '../../partials/location/mocks';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/verify',
} as Meta;

const createStory = storyWithProps(
  'verify',
  "Sent to users that create an account through Firefox, don't verify their email, and go into Sync preferences to resend the verification email as a link.",
  {
    ...MOCK_LOCATION_TRUNCATED,
    link: 'http://localhost:3030/verify_email',
    sync: true,
  }
);

export const VerifyEmail = createStory();
