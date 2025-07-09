/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StripeInvoice, StripeUpcomingInvoice } from '@fxa/payments/stripe';
import { InvoicePreview, STRIPE_INVOICE_METADATA } from '../types';

/**
 * Formats a Stripe Invoice to the FirstInvoicePreview DTO format.
 */
export function stripeInvoiceToInvoicePreviewDTO(
  invoice: StripeUpcomingInvoice | StripeInvoice
): InvoicePreview {
  const taxAmounts = invoice.total_tax_amounts.map((amount) => ({
    title: amount.tax_rate.display_name || '',
    inclusive: amount.inclusive,
    amount: amount.amount,
  }));

  const discountAmount = invoice.total_discount_amounts
    ? invoice.total_discount_amounts.reduce(
        (discount, { amount }) => discount + amount,
        0
      )
    : null;

  const unusedAmountTotal = invoice.lines.data
    .filter((line) => line.proration === true && line.amount < 0)
    .reduce((sum, line) => sum + line.amount, 0);

  return {
    currency: invoice.currency,
    totalAmount: invoice.total,
    taxAmounts,
    discountAmount,
    subtotal: invoice.subtotal,
    discountEnd: invoice.discount?.end,
    discountType: invoice.discount?.coupon.duration,
    number: invoice.number,
    paypalTransactionId:
      invoice.metadata?.[STRIPE_INVOICE_METADATA.PaypalTransactionId],
    nextInvoiceDate: invoice.lines.data[0].period.end,
    amountDue: invoice.amount_due,
    creditApplied: invoice.ending_balance
      ? invoice.starting_balance - invoice.ending_balance
      : invoice.starting_balance,
    startingBalance: invoice.starting_balance,
    unusedAmountTotal,
  };
}
