/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as invoiceDTO from 'fxa-shared/dto/auth/payments/invoice';
import { Stripe } from 'stripe';

type ExpandedInvoicePreview = [
  invoicePreview: Stripe.Invoice,
  proratedInvoice?: Stripe.Invoice,
];

function taxRateDisplayName(taxRate: string | Stripe.TaxRate | undefined) {
  return typeof taxRate === 'object'
    ? taxRate.display_name || undefined
    : undefined;
}

/**
 * Formats a Stripe Invoice to the FirstInvoicePreview DTO format.
 */
export function stripeInvoiceToFirstInvoicePreviewDTO(
  invoice: ExpandedInvoicePreview
): invoiceDTO.FirstInvoicePreview {
  const invoicePreview: invoiceDTO.firstInvoicePreviewSchema = {
    subtotal: invoice[0].subtotal,
    subtotal_excluding_tax: invoice[0].subtotal_excluding_tax,
    total: invoice[0].total,
    total_excluding_tax: invoice[0].total_excluding_tax,
    line_items: invoice[0].lines.data.map((line) => ({
      amount: line.amount,
      currency: line.currency,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: line.pricing!.price_details!.price as string,
      name: line.description || '',
      period: {
        end: line.period.end,
        start: line.period.start,
      },
    })),
  };

  // Add tax if it exists
  const totalTaxes = invoice[0].total_taxes ?? [];
  if (totalTaxes.length > 0) {
    invoicePreview.tax = totalTaxes.map((tax) => ({
      amount: tax.amount,
      inclusive: tax.tax_behavior === 'inclusive',
      display_name: taxRateDisplayName(tax.tax_rate_details?.tax_rate),
    }));
  }

  // Add discount if it exists
  const firstDiscount = invoice[0].discounts?.[0];
  const discount =
    typeof firstDiscount === 'object' ? firstDiscount : undefined;
  const rawCoupon = discount?.source?.coupon;
  const coupon = typeof rawCoupon === 'object' ? rawCoupon : undefined;
  if (invoice[0].total_discount_amounts?.length) {
    invoicePreview.discount = {
      amount: invoice[0].total_discount_amounts[0].amount,
      amount_off: coupon?.amount_off ?? null,
      percent_off: coupon?.percent_off ?? null,
    };
  }

  if (invoice[1]) {
    const proration = invoice[1].lines.data.find(
      (lineItem) => lineItem.parent?.subscription_item_details?.proration
    );

    if (proration) {
      invoicePreview.prorated_amount = proration.amount;
      invoicePreview.one_time_charge = invoice[1].total;
    }
  }

  return invoicePreview;
}

/**
 * Formats an array of Stripe Invoice to the stripeInvoiceToLatestInvoiceItemsDTO DTO format.
 *
 * Currently this is the same as stripeInvoiceToFirstInvoicePreviewDTO, however could change
 * in future.
 */
export function stripeInvoiceToLatestInvoiceItemsDTO(
  invoice: Stripe.Invoice
): invoiceDTO.LatestInvoiceItems {
  return stripeInvoiceToFirstInvoicePreviewDTO([invoice, undefined]);
}
