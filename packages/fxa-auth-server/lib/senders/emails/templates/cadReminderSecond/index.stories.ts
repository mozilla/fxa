/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';
import * as cadReminderFirst from '../cadReminderFirst/index.stories';

export default {
  title: 'FxA Emails/Templates/cadReminderSecond',
} as Meta;

const createStory = storyWithProps(
  'cadReminderSecond',
  'Sent 72 hours after a user clicks "send me a reminder" on the connect another device page.',
  cadReminderFirst.CadReminderDefault.args.variables
);

export const CadReminderDefault = createStory();
