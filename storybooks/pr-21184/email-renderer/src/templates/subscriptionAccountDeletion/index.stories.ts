/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'SubPlat Emails/Templates/subscriptionAccountDeletion',
} as Meta;

const data = {
  productName: '123Done Pro',
  isCancellationEmail: true,
  invoiceTotal: '$20',
  invoiceDateOnly: '11/13/2021',
  cancellationSurveyUrl:
    'https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21',
};

const createStory = subplatStoryWithProps<TemplateData>(
  'subscriptionAccountDeletion',
  'Sent when a user with an active subscription deletes their Mozilla account.',
  data,
  includes
);

export const SubscriptionAccountDeletion = createStory();
