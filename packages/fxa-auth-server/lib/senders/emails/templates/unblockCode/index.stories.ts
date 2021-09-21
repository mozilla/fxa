/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_LOCATION } from '../../partials/location/mocks';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/unblockCode',
} as Meta;

const createStory = storyWithProps(
  'unblockCode',
  'Sent to verify or unblock a blocked account sign-in via code.',
  {
    ...MOCK_LOCATION,
    unblockCode: '1ILO0Z5P',
    reportSignInLink: 'http://localhost:3030/report_signin',
  }
);

export const UnblockCode = createStory();
