/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'FxA Emails/Templates/postRemoveSecondary',
} as Meta;

const data = {
  link: 'http://localhost:3030/settings',
  secondaryEmail: 'secondary@email.com',
  supportUrl: 'https://support.mozilla.org',
};

const createStory = storyWithProps<TemplateData>(
  'postRemoveSecondary',
  'Sent to primary email after secondary email is removed.',
  data,
  includes
);

export const PostRemoveSecondary = createStory();
