/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';

export default {
  title: 'FxA Emails/Layout',
} as Meta;

const createStory = storyWithProps(
  '_storybook',
  'The Strapi email layout.',
  {
    sync: false,
    subject: 'N/A',
    logoUrl:
      'https://accounts-cdn.stage.mozaws.net/product-icons/monitor-logo-email.png',
    logoAltText: 'Monitor logo',
    logoWidth: '280px',
  },
  'fxa',
  'strapi'
);

export const CMS = createStory({}, 'CMS customized email');
