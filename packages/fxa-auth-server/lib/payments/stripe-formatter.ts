/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as invoiceDTO from 'fxa-shared/dto/auth/payments/invoice';
import { Stripe } from 'stripe';

/**
 * Formats a Stripe Invoice to the FirstInvoicePreview DTO format.
 */
export function stripeInvoiceToFirstInvoicePreviewDTO(
  invoice: Stripe.Invoice
): invoiceDTO.FirstInvoicePreview {
  const invoicePreview: invoiceDTO.firstInvoicePreviewSchema = {
    subtotal: invoice.subtotal,
    subtotal_excluding_tax: invoice.subtotal_excluding_tax,
    total: invoice.total,
    total_excluding_tax: invoice.total_excluding_tax,
    line_items: invoice.lines.data.map((line) => ({
      amount: line.amount,
      currency: line.currency,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: line.price!.id,
      name: line.description || '',
    })),
  };

  // Add tax if it exists
  if (invoice.total_tax_amounts.length > 0) {
    invoicePreview.tax = invoice.total_tax_amounts.map((tax) => ({
      amount: tax.amount,
      inclusive: tax.inclusive,
      display_name:
        typeof tax.tax_rate === 'object'
          ? tax.tax_rate.display_name
          : undefined,
    }));
  }

  // Add discount if it exists
  if (invoice.discount && invoice.total_discount_amounts) {
    invoicePreview.discount = {
      amount: invoice.total_discount_amounts[0].amount,
      amount_off: invoice.discount.coupon.amount_off,
      percent_off: invoice.discount.coupon.percent_off,
    };
  }
  return invoicePreview;
}

/**
 * Formats an array of Stripe Invoice to the SubsequentInvoicePreview DTO format.
 */
export function stripeInvoicesToSubsequentInvoicePreviewsDTO(
  invoices: Stripe.Invoice[]
): invoiceDTO.SubsequentInvoicePreview[] {
  return invoices.map((invoice) => {
    const invoicePreview: invoiceDTO.subsequentInvoicePreview = {
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
            ? tax.tax_rate.display_name
            : undefined,
      }));
    }

    return invoicePreview;
  });
}
