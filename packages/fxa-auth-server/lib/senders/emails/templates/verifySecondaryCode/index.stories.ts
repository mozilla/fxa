/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps, commonArgs, Template } from '../../storybook-email';

export default {
  title: 'Emails/verifySecondaryCode',
} as Meta;

const createStory = storyWithProps(
  'verifySecondaryCode',
  'Sent to verify the addition of a secondary email via code.',
  {
    location: 'Madrid, Spain (estimated)',
    device: 'Firefox on Mac OSX 10.11',
    ip: '10.246.67.38',
    email: 'foo@bar.com',
    code: '918398',
  }
);

export const VerifySecondaryCode = createStory();
