/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StripeUpcomingInvoice } from '../stripe.client.types';
import { InvoicePreview } from '../stripe.types';

/**
 * Formats a Stripe Invoice to the FirstInvoicePreview DTO format.
 */
export function stripeInvoiceToFirstInvoicePreviewDTO(
  invoice: StripeUpcomingInvoice
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
  };
}
