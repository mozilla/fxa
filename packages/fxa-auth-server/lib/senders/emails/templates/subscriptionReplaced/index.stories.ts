/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';

export default {
  title: 'SubPlat Emails/Templates/subscriptionReplaced',
} as Meta;

const createStory = subplatStoryWithProps(
  'subscriptionReplaced',
  'Sent when a user has overlapping subscriptions when upgrading to a bundle.',
  {
    productName: 'Firefox Fortress',
  }
);

export const SubscriptionReplaced = createStory();
