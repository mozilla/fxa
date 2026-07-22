/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as IconTemplateData } from '../../partials/icon';
import { TemplateData as SubscriptionChargesTemplateData } from '../../partials/subscriptionCharges';
import { TemplateData as SubscriptionSupportGetHelpTemplateData } from '../../partials/subscriptionSupportGetHelp';
import { TemplateData as ViewInvoiceTemplateData } from '../../partials/viewInvoice';

export type TemplateData = IconTemplateData &
  SubscriptionChargesTemplateData &
  SubscriptionSupportGetHelpTemplateData &
  ViewInvoiceTemplateData & {
    nextInvoiceDateOnly: string;
    productName: string;
  };

export const template = 'subscriptionFirstInvoice';
export const version = 4;
export const layout = 'subscription';
export const includes = {
  subject: {
    id: 'subscriptionFirstInvoice-subject',
    message: '<%- productName %> payment confirmed',
  },
};
