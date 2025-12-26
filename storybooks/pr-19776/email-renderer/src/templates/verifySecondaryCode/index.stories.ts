/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_USER_INFO } from '../../partials/userInfo/mocks';
import { storyWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'FxA Emails/Templates/verifySecondaryCode',
} as Meta;

const data = {
  ...MOCK_USER_INFO,
  email: 'foo@bar.com',
  code: '918398',
};

const createStory = storyWithProps<TemplateData>(
  'verifySecondaryCode',
  'Sent to verify the addition of a secondary email via code.',
  data,
  includes
);

export const VerifySecondaryCode = createStory();
