/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  invoiceAmountDue: string;
  paymentAmountNew: string;
  paymentAmountOld: string;
  productIconURLNew: string;
  productName: string;
  productNameOld: string;
  productPaymentCycleNew: string;
  productPaymentCycleOld: string;
  paymentProrated: string;
  subscriptionSupportUrl: string;
};

export const template = 'subscriptionUpgrade';
export const version = 7;
export const layout = 'subscription';
export const includes = {
  subject: {
    id: 'subscriptionUpgrade-subject',
    message: 'You have upgraded to <%- productName %>',
  },
};
