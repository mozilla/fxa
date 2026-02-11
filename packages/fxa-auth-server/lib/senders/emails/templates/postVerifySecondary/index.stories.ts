/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/postVerifySecondary',
} as Meta;

const createStory = storyWithProps(
  'postVerifySecondary',
  'Sent to primary email after secondary email is verified.',
  {
    link: 'http://localhost:3030/settings',
    secondaryEmail: 'secondary@email.com',
    passwordChangeLink: 'http://localhost:3030/settings/change_password',
  }
);

export const PostVerifySecondary = createStory();
