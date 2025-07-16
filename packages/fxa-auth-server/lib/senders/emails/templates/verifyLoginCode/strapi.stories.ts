/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_USER_INFO } from '../../partials/userInfo/mocks';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Templates/verifyLoginCode/Strapi',
} as Meta;

const createStory = storyWithProps(
  'verifyLoginCode',
  'Sent to verify a login via code.',
  {
    ...MOCK_USER_INFO,
    code: '918398',
    passwordChangeLink: 'http://localhost:3030/settings/change_password',
    serviceName: 'Firefox',
    cmsRpClientId: '00f00f',
    cmsRpFromName: 'Testo Inc.',
    entrypoint: 'quux',
    subject: 'Confirm Your Login',
    headline: 'Are you signing in to use Product?',
    description: 'Use the code below to verify your signin.',
  }
);

export const VerifyLoginCodeEmailStrapi = createStory();
