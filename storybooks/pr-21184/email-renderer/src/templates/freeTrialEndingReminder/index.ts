/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  productName: string;
  serviceLastActiveDateOnly: string;
  invoiceTotal: string;
  invoiceSubtotal: string;
  invoiceDiscountAmount?: string;
  invoiceTaxAmount?: string;
  showTaxAmount: boolean;
  showDiscount: boolean;
  updateBillingUrl: string;
  cancelSubscriptionUrl: string;
  subscriptionSupportUrlWithUtm: string;
  productIconURLNew: string;
};

export const template = 'freeTrialEndingReminder';
export const version = 2;
export const layout = 'subscription';
export const includes = {
  subject: {
    id: 'freeTrialEndingReminder-subject',
    message: 'Your <%- productName %> free trial ends soon',
  },
};
