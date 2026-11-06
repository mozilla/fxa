/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'SubPlat Emails/Templates/subscriptionCancellation',
} as Meta;

const data = {
  productName: '123Done Pro',
  isCancellationEmail: true,
  invoiceTotal: '$2,000.00',
  invoiceDateOnly: '11/13/2021',
  serviceLastActiveDateOnly: '12/13/2021',
  cancellationSurveyUrl:
    'https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21',
  showOutstandingBalance: true,
  cancelAtEnd: false,
  isFreeTrialCancellation: false,
};

const createStory = subplatStoryWithProps<TemplateData>(
  'subscriptionCancellation',
  'Sent when a user cancels their subscription.',
  data,
  includes
);

export const SubscriptionCancellation = createStory();

const freeTrialData = {
  ...data,
  isFreeTrialCancellation: true,
  showOutstandingBalance: false,
  trialEndDateOnly: '12/13/2021',
};

const freeTrialIncludes = {
  ...includes,
  subject: {
    id: 'subscriptionCancellation-freeTrial-subject',
    message: 'Your <%- productName %> free trial has been canceled',
  },
};

const createFreeTrialStory = subplatStoryWithProps<TemplateData>(
  'subscriptionCancellation',
  'Sent when a user cancels their free trial.',
  freeTrialData,
  freeTrialIncludes
);

export const FreeTrialCancellation = createFreeTrialStory();
