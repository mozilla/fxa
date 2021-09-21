/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_LOCATION } from '../../partials/location/mocks';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/newDeviceLogin',
} as Meta;

const createStory = storyWithProps(
  'newDeviceLogin',
  'Sent to notify the account that a new device has signed in.',
  {
    ...MOCK_LOCATION,
    clientName: 'Firefox',
    passwordChangeLink: 'http://localhost:3030/settings/change_password',
    link: 'http://localhost:3030/settings',
  }
);

export const NewDeviceLoginFirefox = createStory(
  {},
  'New device login through Firefox'
);
export const NewDeviceLoginOther = createStory(
  { clientName: 'Some Other Relier' },
  'New device login through something else'
);
