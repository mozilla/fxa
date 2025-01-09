/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'Partials/accountDeletionInfoBlock',
} as Meta;

const createStory = storyWithProps(
  '_storybook',
  'This partial is used in account deletion emails to provide information and assistance about the deletion process.',
  {
    layout: null,
    subject: 'N/A',
    partial: 'accountDeletionInfoBlock',
  }
);

export const accountDeletionInfoBlock = createStory();
