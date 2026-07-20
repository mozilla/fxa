/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as SubscriptionSupportContactTemplateData } from '../../partials/subscriptionSupportContact';
import { TemplateData as SubscriptionUpdateBillingEnsureTemplateData } from '../../partials/subscriptionUpdateBillingEnsure';

export type TemplateData = SubscriptionSupportContactTemplateData &
  SubscriptionUpdateBillingEnsureTemplateData & {
    productName: string;
    showTax: boolean;
    invoiceTotalExcludingTax?: string;
    invoiceTax?: string;
    invoiceTotal: string;
    planInterval: string;
    reminderLength: string;
    subscriptionSupportUrl: string;
    updateBillingUrl: string;
    discountEnding?: boolean;
    hasDifferentDiscount?: boolean;
  };

export const template = 'subscriptionRenewalReminder';
export const version = 4;
export const layout = 'subscription';
export const includes = {
  subject: {
    id: 'subscriptionRenewalReminder-subject-2',
    message: 'Your <%- productName %> subscription is about to renew',
  },
};
