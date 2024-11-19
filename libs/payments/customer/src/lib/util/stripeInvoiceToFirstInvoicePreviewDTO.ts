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
    title: amount.tax_rate.display_name,
    inclusive: amount.inclusive,
    amount: amount.amount,
  }));

  const discountAmount = invoice.total_discount_amounts
    ? invoice.total_discount_amounts.reduce(
        (discount, { amount }) => discount + amount,
        0
      )
    : null;

  return {
    currency: invoice.currency,
    listAmount: invoice.amount_due,
    totalAmount: invoice.total,
    taxAmounts,
    discountAmount,
    subtotal: invoice.subtotal,
    discountEnd: invoice.discount?.end,
    discountType: invoice.discount?.coupon.duration,
    number: invoice.number,
    paypalTransactionId:
      invoice.metadata?.[STRIPE_INVOICE_METADATA.PaypalTransactionId],
  };
}
