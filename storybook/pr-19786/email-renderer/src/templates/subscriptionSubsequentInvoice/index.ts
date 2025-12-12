/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  productName: string;
  invoiceAmountDue: string;
  invoiceDateOnly: string;
  invoiceNumber: string;
  invoiceTotalInCents: number;
  invoiceTotal: string;
  invoiceSubtotal: number | null;
  invoiceTaxAmount: number | null;
  invoiceDiscountAmount: number | null;
  discountType: string | null;
  discountDuration: string | null;
  productPaymentCycle: string;
  invoiceAmountDueInCents: number;
  paymentProviderName: string;
  remainingAmountTotalInCents: number;
  offeringPriceInCents: number;
  offeringPrice: string;
  unusedAmountTotalInCents: number;
  unusedAmountTotal: string;
  invoiceSubtotalInCents: number;
  creditAppliedInCents: number;
  invoiceStartingBalance: string;
  manageSubscriptionUrl: string;
  invoiceTaxAmountInCents: number;
};

export const template = 'subscriptionSubsequentInvoice';
export const version = 5;
export const layout = 'subscription';
export const includes = {
  subject: {
    id: 'subscriptionSubsequentInvoice-subject-2',
    message:
      'Your <%- productName %> <%- productPaymentCycle %> invoice from Mozilla is ready',
  },
};
