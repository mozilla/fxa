/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'FxA Emails/Templates/inactiveAccountFinalWarning',
} as Meta;

const data = {
  // dates will be passed in to the template already localized and formatted by the email handler
  deletionDate: 'Thursday, Jan 9, 2025',
  link: 'http://localhost:3030/signin',
  supportUrl: 'https://support.mozilla.org',
  unsubscribeUrl: 'https://accounts.firefox.com/unsubscribe',
};

const createStory = storyWithProps<TemplateData>(
  'inactiveAccountFinalWarning',
  'Final reminder sent to inactive account before account is deleted',
  data,
  includes
);

export const inactiveAccountFinalWarning = createStory();
