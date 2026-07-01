/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  stripeInvoiceToFirstInvoicePreviewDTO,
  stripeInvoiceToLatestInvoiceItemsDTO,
} from './stripe-formatter';

const previewInvoiceWithTax = require('../../test/local/payments/fixtures/stripe/invoice_preview_tax.json');
const previewInvoiceWithDiscountAndTax = require('../../test/local/payments/fixtures/stripe/invoice_preview_tax_discount.json');
const { deepCopy } = require('../../test/local/payments/util');

function buildExpectedLineItems(invoice: any) {
  return invoice.line_items.map((item: any) => ({
    amount: item.amount,
    currency: item.currency,
    id: item.id,
    name: item.name,
    period: {
      end: item.period.end,
      start: item.period.start,
    },
  }));
}

describe('stripeInvoiceToFirstInvoicePreviewDTO', () => {
  it('formats an invoice with tax', () => {
    const invoice = stripeInvoiceToFirstInvoicePreviewDTO([
      deepCopy(previewInvoiceWithTax),
      undefined,
    ]);
    const expectedLineItems = buildExpectedLineItems(invoice);

    expect(invoice.line_items).toEqual(expectedLineItems);
    expect(invoice.total).toBe(previewInvoiceWithTax.total);
    expect(invoice.subtotal).toBe(previewInvoiceWithTax.subtotal);
    expect(invoice.tax[0].amount).toBe(
      previewInvoiceWithTax.total_taxes[0].amount
    );
    expect(invoice.tax[0].display_name).toBe(
      previewInvoiceWithTax.total_taxes[0].tax_rate_details.tax_rate.display_name
    );
    expect(invoice.tax[0].inclusive).toBe(true);
    expect(invoice.discount).toBeUndefined();
  });

  it('formats an invoice with tax and discount', () => {
    const invoice = stripeInvoiceToFirstInvoicePreviewDTO([
      deepCopy(previewInvoiceWithDiscountAndTax),
      undefined,
    ]);
    expect(invoice.total).toBe(previewInvoiceWithDiscountAndTax.total);
    expect(invoice.subtotal).toBe(previewInvoiceWithDiscountAndTax.subtotal);
    expect(invoice.tax[0].amount).toBe(
      previewInvoiceWithDiscountAndTax.total_taxes[0].amount
    );
    expect(invoice.tax[0].display_name).toBeUndefined();
    expect(invoice.tax[0].inclusive).toBe(true);
    expect(invoice.discount.amount).toBe(
      previewInvoiceWithDiscountAndTax.total_discount_amounts[0].amount
    );
    expect(invoice.discount.amount_off).toBe(
      previewInvoiceWithDiscountAndTax.discounts[0].source.coupon.amount_off
    );
    expect(invoice.discount.percent_off).toBe(
      previewInvoiceWithDiscountAndTax.discounts[0].source.coupon.percent_off
    );
  });

  it('formats an invoice where tax display_name is an empty string', () => {
    const invoicePreview = deepCopy(previewInvoiceWithTax);
    invoicePreview.total_taxes[0].tax_rate_details.tax_rate.display_name = '';

    const invoice = stripeInvoiceToFirstInvoicePreviewDTO([
      invoicePreview,
      undefined,
    ]);

    expect(invoice.total).toBe(invoicePreview.total);
    expect(invoice.subtotal).toBe(invoicePreview.subtotal);
    expect(invoice.tax[0].amount).toBe(
      invoicePreview.total_taxes[0].amount
    );
    expect(invoice.tax[0].display_name).toBeUndefined();
    expect(invoice.tax[0].inclusive).toBe(true);
  });

  it('formats an invoice with a prorated amount', () => {
    const firstInvoice = deepCopy(previewInvoiceWithTax);
    const proratedInvoice = deepCopy(previewInvoiceWithTax);
    proratedInvoice.lines.data[0].parent.subscription_item_details.proration =
      true;

    const invoice = stripeInvoiceToFirstInvoicePreviewDTO([
      firstInvoice,
      proratedInvoice,
    ]);
    const expectedLineItems = buildExpectedLineItems(invoice);

    expect(invoice.line_items).toEqual(expectedLineItems);
    expect(invoice.total).toBe(previewInvoiceWithTax.total);
    expect(invoice.subtotal).toBe(previewInvoiceWithTax.subtotal);
    expect(invoice.tax[0].amount).toBe(
      previewInvoiceWithTax.total_taxes[0].amount
    );
    expect(invoice.tax[0].display_name).toBe(
      previewInvoiceWithTax.total_taxes[0].tax_rate_details.tax_rate.display_name
    );
    expect(invoice.tax[0].inclusive).toBe(true);
    expect(invoice.discount).toBeUndefined();
    expect(invoice.one_time_charge).toBe(proratedInvoice.total);
    expect(invoice.prorated_amount).toBe(proratedInvoice.lines.data[0].amount);
  });
});

describe('stripeInvoiceToLatestInvoiceItemsDTO', () => {
  it('formats an invoice with tax', () => {
    const invoice = stripeInvoiceToLatestInvoiceItemsDTO(
      deepCopy(previewInvoiceWithTax)
    );
    const expectedLineItems = buildExpectedLineItems(invoice);

    expect(invoice.line_items).toEqual(expectedLineItems);
    expect(invoice.total).toBe(previewInvoiceWithTax.total);
    expect(invoice.subtotal).toBe(previewInvoiceWithTax.subtotal);
    expect(invoice.tax[0].amount).toBe(
      previewInvoiceWithTax.total_taxes[0].amount
    );
    expect(invoice.tax[0].display_name).toBe(
      previewInvoiceWithTax.total_taxes[0].tax_rate_details.tax_rate.display_name
    );
    expect(invoice.tax[0].inclusive).toBe(true);
    expect(invoice.discount).toBeUndefined();
  });

  it('formats an invoice with tax and discount', () => {
    const invoice = stripeInvoiceToLatestInvoiceItemsDTO(
      deepCopy(previewInvoiceWithDiscountAndTax)
    );
    expect(invoice.total).toBe(previewInvoiceWithDiscountAndTax.total);
    expect(invoice.subtotal).toBe(previewInvoiceWithDiscountAndTax.subtotal);
    expect(invoice.tax[0].amount).toBe(
      previewInvoiceWithDiscountAndTax.total_taxes[0].amount
    );
    expect(invoice.tax[0].display_name).toBeUndefined();
    expect(invoice.tax[0].inclusive).toBe(true);
    expect(invoice.discount.amount).toBe(
      previewInvoiceWithDiscountAndTax.total_discount_amounts[0].amount
    );
    expect(invoice.discount.amount_off).toBe(
      previewInvoiceWithDiscountAndTax.discounts[0].source.coupon.amount_off
    );
    expect(invoice.discount.percent_off).toBe(
      previewInvoiceWithDiscountAndTax.discounts[0].source.coupon.percent_off
    );
  });
});
