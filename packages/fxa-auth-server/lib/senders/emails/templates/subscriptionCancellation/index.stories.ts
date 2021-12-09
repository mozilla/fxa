/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';

export default {
  title: 'SubPlat Emails/Templates/subscriptionCancellation',
} as Meta;

const createStory = subplatStoryWithProps(
  'subscriptionCancellation',
  'Sent when a user cancels their subscription.',
  {
    productName: 'Firefox Fortress',
    isCancellationEmail: true,
    invoiceTotal: '$2,000.00',
    invoiceDateOnly: '11/13/2021',
    serviceLastActiveDateOnly: '12/13/2021',
    cancellationSurveryUrl:
      'https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21',
  }
);

export const SubscriptionCancellation = createStory();
