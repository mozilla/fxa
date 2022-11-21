/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/verificationReminderFinal',
} as Meta;

const createStory = storyWithProps(
  'verificationReminderFinal',
  'Final reminder sent to users that have not verified their account, sent 15 days after initial attempt.',
  {
    link: 'http://localhost:3030/verify_email',
  }
);

export const VerificationReminderFinal = createStory();
