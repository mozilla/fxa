/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  invoiceAmountDue: string;
  invoiceAmountDueInCents: number;
  icon: string;
  invoiceDateOnly: string;
  invoiceLink: string;
  invoiceNumber: string;
  invoiceTotal: string;
  invoiceTotalInCents: number;
  invoiceSubtotal: string | null;
  invoiceTaxAmount: string | null;
  invoiceDiscountAmount: string | null;
  discountType: string | null;
  discountDuration: string | null;
  nextInvoiceDateOnly: string;
  subscriptionSupportUrl: string;
  paymentProrated: string | null;
  showPaymentMethod: boolean;
  showProratedAmount: boolean;
  showTaxAmount: boolean;
  cardName: string;
  paymentProviderName: string;
  lastFour: string;
  remainingAmountTotalInCents: number;
  offeringPrice: string;
  offeringPriceInCents: number;
  unusedAmountTotal: string;
  unusedAmountTotalInCents: number;
  invoiceSubtotalInCents: number;
  creditAppliedInCents: number;
  invoiceStartingBalance: string;
  manageSubscriptionUrl: string;
  invoiceTaxAmountInCents: number;
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
