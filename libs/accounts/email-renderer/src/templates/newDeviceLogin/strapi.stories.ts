/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { MOCK_USER_INFO } from '../../partials/userInfo/mocks';
import { storyWithProps } from '../../storybook-email';
import { getIncludes, TemplateData } from './index';

export default {
  title: 'FxA Emails/Templates/newDeviceLogin/Strapi',
} as Meta;

const data = {
  ...MOCK_USER_INFO,
  cmsRpClientId: '00f00f',
  cmsRpFromName: 'Testo Inc.',
  entrypoint: 'quux',
  subject: 'New Login',
  headline: 'You logged into Product!',
  description: 'It appears you logged in.',
  clientName: 'Firefox',
  passwordChangeLink: 'http://localhost:3030/settings/change_password',
  link: 'http://localhost:3030/settings',
  mozillaSupportUrl: 'https://support.mozilla.org',
  showBannerWarning: false,
};

const createStory = storyWithProps<TemplateData>(
  'newDeviceLogin',
  'Sent to notify the account that a new service has signed in.',
  data,
  getIncludes(data),
  'fxa',
  'strapi'
);

export const NewDeviceLoginRp = createStory(
  { clientName: '123 Done' },
  'New device login through RP with CMS Email'
);
