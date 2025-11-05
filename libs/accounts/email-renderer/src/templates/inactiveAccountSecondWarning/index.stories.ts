/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'FxA Emails/Templates/inactiveAccountSecondWarning',
} as Meta;

const data = {
  deletionDate: 'Thursday, Jan 9, 2025',
  link: 'http://localhost:3030/signin',
};

const createStory = storyWithProps<TemplateData>(
  'inactiveAccountSecondWarning',
  'Second reminder sent to inactive account before account is deleted',
  data,
  includes
);

export const inactiveAccountSecondWarning = createStory();
