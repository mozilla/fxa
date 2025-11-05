/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'FxA Emails/Templates/verificationReminderSecond',
} as Meta;

const data = {
  link: 'http://localhost:3030/verify_email',
};

const createStory = storyWithProps<TemplateData>(
  'verificationReminderSecond',
  'Reminder sent 5 days after an ignored verification.',
  data,
  includes
);

export const verificationReminderSecond = createStory();
