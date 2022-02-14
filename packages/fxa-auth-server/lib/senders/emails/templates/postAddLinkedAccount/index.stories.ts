/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_LOCATION } from '../../partials/location/mocks';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/postAddLinkedAccount',
} as Meta;

const createStory = storyWithProps(
  'postAddLinkedAccount',
  'Sent to notify the account is linked to another account.',
  {
    ...MOCK_LOCATION,
    link: 'http://localhost:3030/settings',
    passwordChangeLink: 'http://localhost:3030/settings/change_password',
  }
);

export const PostAddLinkedAccountApple = createStory(
  {
    providerName: 'Apple',
  },
  'Linked to an Apple account'
);

export const PostAddLinkedAccountGoogle = createStory(
  {
    providerName: 'Google',
  },
  'Linked to a Google account'
);
