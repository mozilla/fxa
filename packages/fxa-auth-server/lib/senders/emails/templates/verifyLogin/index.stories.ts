/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_LOCATION } from '../../partials/location/mocks';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/verifyLogin',
} as Meta;

const createStory = storyWithProps(
  'verifyLogin',
  'Sent to users to verify a new login.',
  {
    ...MOCK_LOCATION,
    link: 'http://localhost:3030/complete_signin',
    clientName: 'Firefox',
    passwordChangeLink: 'http://localhost:3030/settings/change_password',
  }
);

export const VerifyLoginFirefox = createStory(
  {},
  'Verify login through Firefox'
);
export const VerifyLoginOther = createStory(
  { clientName: 'Some Other Relier' },
  'Verify login through something else'
);
