/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as invoiceDTO from 'fxa-shared/dto/auth/payments/invoice';
import { StripeInvoice } from '@fxa/payments/stripe';

type ExpandedInvoicePreview = [
  invoicePreview: StripeInvoice,
  proratedInvoice?: StripeInvoice,
];

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
      display_name: tax.tax_rate_details?.tax_rate?.display_name || undefined,
    }));
  }

  // Add discount if it exists
  const discount = invoice[0].discounts?.[0];
  const coupon = discount?.source.coupon;
  if (coupon && invoice[0].total_discount_amounts) {
    invoicePreview.discount = {
      amount: invoice[0].total_discount_amounts[0].amount,
      amount_off: coupon.amount_off,
      percent_off: coupon.percent_off,
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
  invoice: StripeInvoice
): invoiceDTO.LatestInvoiceItems {
  return stripeInvoiceToFirstInvoicePreviewDTO([invoice, undefined]);
}
