/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';
import { includes } from '../mocks';

export default {
  title: 'Partials/footers/automatedEmailSignIn',
} as Meta;

const createStory = storyWithProps(
  '_storybook',
  'This partial is used in footers for automated emails where signing in to review account security settings is recommended.',
  {
    layout: null,
    subject: 'N/A',
    partial: 'automatedEmailSignIn',
    securitySettingsLink: 'http://localhost:3030/settings#security',
    reviewActivitySupportUrl:
      'https://support.mozilla.org/kb/review-mozilla-account-activity-and-protect-data',
  },
  includes
);

export const AutomatedEmailSignIn = createStory();
