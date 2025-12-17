/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { subplatStoryWithProps } from '../../storybook-email';
import { includes, TemplateData } from './index';

export default {
  title: 'SubPlat Emails/Templates/subscriptionFailedPaymentsCancellation',
} as Meta;

const data = {
  productName: 'Firefox Fortress',
  isCancellationEmail: true,
  cancellationSurveyUrl:
    'https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21',
};

const createStory = subplatStoryWithProps<TemplateData>(
  'subscriptionFailedPaymentsCancellation',
  'Sent when failed payments result in cancellation of user subscription.',
  data,
  includes
);

export const subscriptionFailedPaymentsCancellation = createStory();
