/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_USER_INFO } from '../../partials/userInfo/mocks';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/newDeviceLogin',
} as Meta;

const createStory = storyWithProps(
  'newDeviceLogin',
  'Sent to notify the account that a new device or service has signed in.',
  {
    ...MOCK_USER_INFO,
    clientName: 'Firefox',
    passwordChangeLink: 'http://localhost:3030/settings/change_password',
    link: 'http://localhost:3030/settings',
    mozillaSupportUrl: 'https://support.mozilla.org',
    showBannerWarning: false,
  }
);

export const NewDeviceLoginFirefox = createStory(
  {},
  'New device login through Firefox'
);

export const NewDeviceLoginAMO = createStory(
  { clientName: 'Add-ons', showBannerWarning: true },
  'New device login through AMO or web, with warning banner'
);
export const NewDeviceLoginOther = createStory(
  { clientName: '123 Done' },
  'New device login through something else'
);

export const NewDeviceLoginForMozillaAccount = createStory(
  { clientName: 'Mozilla' },
  'New device login for your Mozilla account'
);
