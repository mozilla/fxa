/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'FxA Emails/Templates/cadReminderSecond',
} as Meta;

const data = {
  oneClickLink: 'http://localhost:3030/connect_another_device?one_click=true',
  link: 'http://localhost:3030/connect_another_device',
  productName: 'Firefox',
};

const createStory = storyWithProps<TemplateData>(
  'cadReminderSecond',
  'Sent 72 hours after a user clicks "send me a reminder" on the connect another device page.',
  data,
  includes
);

export const CadReminderDefault = createStory();
