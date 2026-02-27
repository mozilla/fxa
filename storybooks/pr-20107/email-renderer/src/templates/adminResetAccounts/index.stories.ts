/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'FxA Emails/Templates/adminResetAccounts',
} as Meta;

const data = {
  status: [
    {
      locator: 'foo@mozilla.com',
      status: 'Success',
    },
    {
      locator: 'Bar@mozilla.com',
      status: 'Not found',
    },
  ],
};

const createStory = storyWithProps<TemplateData>(
  'adminResetAccounts',
  'Sent after an admin resets a batch of accounts.',
  data,
  includes
);

export const CadReminderDefault = createStory();
