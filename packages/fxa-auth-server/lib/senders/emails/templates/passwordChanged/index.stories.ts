/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { buildStory } from '../../storybook-email';

export default {
  title: 'Emails/passwordChanged',
} as Meta;

const createStory = buildStory(
  'passwordChanged',
  'Sent when password has been changed.',
  {
    location: 'Madrid, Spain (estimated)',
    device: 'Firefox on Mac OSX 10.11',
    ip: '10.246.67.38',
    resetLink: 'http://localhost:3030/settings/change_password',
  }
);

export const PasswordChanged = createStory();
