/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as invoiceDTO from 'fxa-shared/dto/auth/payments/invoice';
import { InvoicePreview } from 'fxa-shared/subscriptions/types';
import { Stripe } from 'stripe';

/**
 * Formats a Stripe Invoice to the FirstInvoicePreview DTO format.
 */
export function stripeInvoiceToFirstInvoicePreviewDTO(
  invoice: InvoicePreview
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
      id: line.price!.id,
      name: line.description || '',
      period: {
        end: line.period.end,
        start: line.period.start,
      },
    })),
  };

  // Add tax if it exists
  if (invoice[0].total_tax_amounts.length > 0) {
    invoicePreview.tax = invoice[0].total_tax_amounts.map((tax) => ({
      amount: tax.amount,
      inclusive: tax.inclusive,
      display_name:
        typeof tax.tax_rate === 'object'
          ? tax.tax_rate.display_name || undefined
          : undefined,
    }));
  }

  // Add discount if it exists
  if (invoice[0].discount && invoice[0].total_discount_amounts) {
    invoicePreview.discount = {
      amount: invoice[0].total_discount_amounts[0].amount,
      amount_off: invoice[0].discount.coupon.amount_off,
      percent_off: invoice[0].discount.coupon.percent_off,
    };
  }

  if (invoice[1]) {
    const proration = invoice[1].lines.data.find(
      (lineItem) => lineItem.proration
    );

    if (proration) {
      invoicePreview.prorated_amount = proration.amount;
      invoicePreview.one_time_charge = invoice[1].total;
    }
  }

  return invoicePreview;
}

/**
 * Formats an array of Stripe Invoice to the SubsequentInvoicePreview DTO format.
 */
export function stripeInvoicesToSubsequentInvoicePreviewsDTO(
  invoices: Stripe.UpcomingInvoice[]
): invoiceDTO.SubsequentInvoicePreview[] {
  return invoices.map((invoice) => {
    const invoicePreview: invoiceDTO.subsequentInvoicePreview = {
      currency: invoice.currency,
      subscriptionId: invoice.subscription as string,
      period_start: invoice.period_end,
      subtotal: invoice.subtotal,
      subtotal_excluding_tax: invoice.subtotal_excluding_tax,
      total: invoice.total,
      total_excluding_tax: invoice.total_excluding_tax,
    };

    if (invoice.total_tax_amounts.length > 0) {
      invoicePreview.tax = invoice.total_tax_amounts.map((tax) => ({
        amount: tax.amount,
        inclusive: tax.inclusive,
        display_name:
          typeof tax.tax_rate === 'object'
            ? tax.tax_rate.display_name || undefined
            : undefined,
      }));
    }

    return invoicePreview;
  });
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
