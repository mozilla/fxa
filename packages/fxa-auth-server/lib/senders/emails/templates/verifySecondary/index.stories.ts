/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { buildStory } from '../../storybook-email';

export default {
  title: 'Emails/verifySecondary',
} as Meta;

const createStory = buildStory(
  'verifySecondary',
  'Sent to verify the addition of a secondary email via link.',
  {
    location: 'Madrid, Spain (estimated)',
    device: 'Firefox on Mac OSX 10.11',
    ip: '10.246.67.38',
    email: 'foo@bar.com',
    link: 'http://localhost:3030/verify_email',
  }
);

export const VerifySecondary = createStory();
