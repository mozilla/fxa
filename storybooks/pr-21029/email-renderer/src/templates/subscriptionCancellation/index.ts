/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as CancellationSurveyTemplateData } from '../../partials/cancellationSurvey';

export type TemplateData = CancellationSurveyTemplateData & {
  productName: string;
  isCancellationEmail: boolean;
  invoiceTotal: string;
  invoiceDateOnly: string;
  serviceLastActiveDateOnly: string;
  cancellationSurveryUrl?: string;
  showOutstandingBalance: boolean;
  cancelAtEnd: boolean;
  isFreeTrialCancellation: boolean;
  trialEndDateOnly?: string;
};

export const template = 'subscriptionCancellation';
export const version = 4;
export const layout = 'subscription';
export const includes = {
  subject: {
    id: 'subscriptionCancellation-subject',
    message: 'Your <%- productName %> subscription has been cancelled',
  },
};
