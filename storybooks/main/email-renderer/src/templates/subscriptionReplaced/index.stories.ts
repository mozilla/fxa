/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'SubPlat Emails/Templates/subscriptionReplaced',
} as Meta;

const data = {
  productName: 'Firefox Fortress',
};

const createStory = subplatStoryWithProps<TemplateData>(
  'subscriptionReplaced',
  'Sent when a user has overlapping subscriptions when upgrading to a bundle.',
  data,
  includes
);

export const SubscriptionReplaced = createStory();
