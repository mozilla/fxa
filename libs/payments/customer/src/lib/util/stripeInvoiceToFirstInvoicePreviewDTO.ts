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

  const { remainingAmountTotal, unusedAmountTotal } = invoice.lines.data.reduce(
    (totals, line) => {
      if (line.proration === true) {
        const amount = line.amount || 0;
        const description = line.description || '';

        if (amount < 0 && /^Unused/i.test(description)) {
          totals.unusedAmountTotal += amount;
        } else if (amount > 0 && /^Remaining/i.test(description)) {
          totals.remainingAmountTotal =
            (totals.remainingAmountTotal ?? 0) + amount;
        }
      }
      return totals;
    },
    {
      remainingAmountTotal: undefined as number | undefined,
      unusedAmountTotal: 0,
    }
  );

  const notProrated = invoice.lines.data.find(
    (line) => line.proration === false
  );
  const subsequentAmount = notProrated?.amount;
  const subsequentAmountExcludingTax =
    notProrated?.amount_excluding_tax ?? undefined;

  const subsequentTax = notProrated?.tax_amounts.map((tax) => ({
    title: tax.tax_rate.display_name || '',
    inclusive: tax.inclusive,
    amount: tax.amount,
  }));

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
    invoiceDate: invoice.created,
    nextInvoiceDate: invoice.lines.data[0].period.end,
    amountDue: invoice.amount_due,
    creditApplied: invoice.ending_balance
      ? invoice.starting_balance - invoice.ending_balance
      : invoice.starting_balance,
    promotionName: invoice.discount?.coupon.name,
    remainingAmountTotal,
    startingBalance: invoice.starting_balance,
    totalExcludingTax: invoice.total_excluding_tax,
    unusedAmountTotal,
    subsequentAmount,
    subsequentAmountExcludingTax,
    subsequentTax,
  };
}
