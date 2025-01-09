/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'Partials/footers/automatedEmailNotAuthorized',
} as Meta;

const createStory = storyWithProps(
  '_storybook',
  'This partial is used in footers for automated emails - text format only',
  {
    layout: null,
    subject: 'N/A',
    partial: 'automatedEmailNotAuthorized',
    passwordChangeLink: 'http://localhost:3030/settings/change_password',
  }
);

export const AutomatedEmailNotAuthorized = createStory();
