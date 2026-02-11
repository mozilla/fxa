/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/postRemoveSecondary',
} as Meta;

const createStory = storyWithProps(
  'postRemoveSecondary',
  'Sent to primary email after secondary email is removed.',
  {
    link: 'http://localhost:3030/settings',
    secondaryEmail: 'secondary@email.com',
  }
);

export const PostRemoveSecondary = createStory();
