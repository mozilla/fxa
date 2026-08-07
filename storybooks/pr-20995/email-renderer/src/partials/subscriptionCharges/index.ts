/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This template invokes the paymentProviderTemplate;
import { TemplateData as PaymentProviderTemplateData } from '../paymentProvider';

export type TemplateData = PaymentProviderTemplateData & {
  invoiceNumber: string;
  invoiceDateOnly: string;

  remainingAmountTotalInCents?: number;
  offeringPriceInCents?: number;
  remainingAmountTotal?: string;
  offeringPrice?: string;
  unusedAmountTotalInCents?: number;
  unusedAmountTotal?: string;

  invoiceSubtotalInCents?: number;
  invoiceSubtotal?: string;
  discountType?: string;
  discountDuration?: string;
  invoiceDiscountAmount?: string;

  showTaxAmount?: boolean;
  invoiceTaxAmountInCents?: number;
  invoiceTaxAmount?: string;

  invoiceAmountDueInCents?: number;
  invoiceTotal?: string;

  creditAppliedInCents?: number;
  invoiceStartingBalance?: string;
  creditApplied?: string;

  invoiceAmountDue: string;
  invoiceTotalInCents: number;
  creditReceived: string;
};
