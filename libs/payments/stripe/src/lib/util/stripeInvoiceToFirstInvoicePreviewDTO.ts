/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StripeUpcomingInvoice } from '../stripe.client.types';

/**
 * Formats a Stripe Invoice to the FirstInvoicePreview DTO format.
 */
export function stripeInvoiceToFirstInvoicePreviewDTO(
  invoice: StripeUpcomingInvoice
) {
  const taxAmounts = [
    {
      title: invoice.total_tax_amounts[0].tax_rate.display_name,
      inclusive: invoice.total_tax_amounts[0].inclusive,
      amount: invoice.total_tax_amounts[0].amount,
    },
  ];

  const discountAmount =
    (invoice.discount &&
      invoice.total_discount_amounts &&
      invoice.total_discount_amounts[0].amount) ??
    null;

  return {
    currency: invoice.currency,
    listAmount: invoice.amount_due,
    totalAmount: invoice.total,
    taxAmounts,
    discountAmount,
    subTotal: invoice.subtotal,
  };
}
