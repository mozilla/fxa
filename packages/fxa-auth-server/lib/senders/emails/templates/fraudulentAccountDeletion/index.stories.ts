/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';

export default {
  title: 'SubPlat Emails/Templates/fraudulentAccountDeletion',
} as Meta;

const createStory = subplatStoryWithProps(
  'fraudulentAccountDeletion',
  'Sent to inform user that their unverified account was deleted and transaction was reimbursed.',
  {
    mozillaSupportUrl: 'https://support.mozilla.org',
    wasDeleted: true,
  }
);

export const FraudulentAccountDeletion = createStory();
