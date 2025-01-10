/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/inactiveAccountSecondWarning',
} as Meta;

const createStory = storyWithProps(
  'inactiveAccountSecondWarning',
  'Second reminder sent to inactive account before account is deleted',
  {
    deletionDate: '2025-01-01',
    link: 'http://localhost:3030/signin',
  }
);

export const inactiveAccountSecondWarning = createStory();
