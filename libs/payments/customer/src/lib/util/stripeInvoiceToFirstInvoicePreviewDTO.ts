/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Stripe } from 'stripe';

import { StripeInvoice, StripeUpcomingInvoice } from '@fxa/payments/stripe';
import { InvoicePreview, STRIPE_INVOICE_METADATA } from '../types';

/**
 * Formats a Stripe Invoice to the FirstInvoicePreview DTO format.
 */
export function stripeInvoiceToInvoicePreviewDTO(
  invoice: StripeUpcomingInvoice | StripeInvoice
): InvoicePreview {
  const taxAmounts = (invoice.total_taxes ?? []).map((tax) => ({
    // createPreview expands total_taxes.tax_rate_details.tax_rate; the SDK still
    // types it as an id, so cast to read the label. Falls back to '' when a
    // non-preview path (invoicesRetrieve) leaves it unexpanded.
    title:
      (tax.tax_rate_details?.tax_rate as unknown as Stripe.TaxRate)
        ?.display_name || '',
    inclusive: tax.tax_behavior === 'inclusive',
    amount: tax.amount,
  }));

  const discountAmount = invoice.total_discount_amounts
    ? invoice.total_discount_amounts.reduce(
        (discount, { amount }) => discount + amount,
        0
      )
    : null;

  const { remainingAmountTotal, unusedAmountTotal } = invoice.lines.data.reduce(
    (totals, line) => {
      if (line.parent?.subscription_item_details?.proration === true) {
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
    (line) => line.parent?.subscription_item_details?.proration === false
  );
  const subsequentAmount = notProrated?.amount;
  const subsequentAmountExcludingTax = notProrated
    ? notProrated.amount -
      (notProrated.taxes ?? [])
        .filter((tax) => tax.tax_behavior === 'inclusive')
        .reduce((sum, tax) => sum + tax.amount, 0)
    : undefined;

  const subsequentTax = notProrated?.taxes?.map((tax) => ({
    title:
      (tax.tax_rate_details?.tax_rate as unknown as Stripe.TaxRate)
        ?.display_name || '',
    inclusive: tax.tax_behavior === 'inclusive',
    amount: tax.amount,
  }));

  return {
    currency: invoice.currency,
    totalAmount: invoice.total,
    taxAmounts,
    discountAmount,
    subtotal: invoice.subtotal,
    discountEnd: invoice.discounts[0]?.end,
    discountType: invoice.discounts[0]?.source?.coupon.duration,
    number: invoice.number,
    paypalTransactionId:
      invoice.metadata?.[STRIPE_INVOICE_METADATA.PaypalTransactionId],
    invoiceDate: invoice.created,
    invoiceUrl: invoice.hosted_invoice_url,
    nextInvoiceDate: invoice.lines.data[0].period.end,
    amountDue: invoice.amount_due,
    creditApplied: invoice.ending_balance
      ? invoice.starting_balance - invoice.ending_balance
      : invoice.starting_balance,
    promotionName: invoice.discounts[0]?.source?.coupon.name,
    remainingAmountTotal,
    startingBalance: invoice.starting_balance,
    totalExcludingTax: invoice.total_excluding_tax,
    unusedAmountTotal,
    subsequentAmount,
    subsequentAmountExcludingTax,
    subsequentTax,
  };
}
