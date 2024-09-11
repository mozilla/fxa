/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';

import {
  stripeInvoiceToFirstInvoicePreviewDTO,
  stripeInvoicesToSubsequentInvoicePreviewsDTO,
  stripeInvoiceToLatestInvoiceItemsDTO,
} from '../../../lib/payments/stripe-formatter';

import previewInvoiceWithTax from './fixtures/stripe/invoice_preview_tax.json';
import previewInvoiceWithDiscountAndTax from './fixtures/stripe/invoice_preview_tax_discount.json';
import { deepCopy } from './util';

function buildExpectedLineItems(invoice) {
  return invoice.line_items.map((item) => ({
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

    assert.deepEqual(invoice.line_items, expectedLineItems);
    assert.equal(invoice.total, previewInvoiceWithTax.total);
    assert.equal(invoice.subtotal, previewInvoiceWithTax.subtotal);
    assert.equal(
      invoice.tax[0].amount,
      previewInvoiceWithTax.total_tax_amounts[0].amount
    );
    assert.equal(
      invoice.tax[0].display_name,
      previewInvoiceWithTax.total_tax_amounts[0].tax_rate.display_name
    );
    assert.equal(invoice.tax[0].inclusive, true);
    assert.isUndefined(invoice.discount);
  });

  it('formats an invoice with tax and discount', () => {
    const invoice = stripeInvoiceToFirstInvoicePreviewDTO([
      deepCopy(previewInvoiceWithDiscountAndTax),
      undefined,
    ]);
    assert.equal(invoice.total, previewInvoiceWithDiscountAndTax.total);
    assert.equal(invoice.subtotal, previewInvoiceWithDiscountAndTax.subtotal);
    assert.equal(
      invoice.tax[0].amount,
      previewInvoiceWithDiscountAndTax.total_tax_amounts[0].amount
    );
    assert.equal(
      invoice.tax[0].display_name,
      previewInvoiceWithDiscountAndTax.total_tax_amounts[0].tax_rate
        .display_name
    );
    assert.equal(invoice.tax[0].inclusive, true);
    assert.equal(
      invoice.discount.amount,
      previewInvoiceWithDiscountAndTax.total_discount_amounts[0].amount
    );
    assert.equal(
      invoice.discount.amount_off,
      previewInvoiceWithDiscountAndTax.discount.coupon.amount_off
    );
    assert.equal(
      invoice.discount.percent_off,
      previewInvoiceWithDiscountAndTax.discount.coupon.percent_off
    );
  });

  it('formats an invoice where tax display_name is an empty string', () => {
    const invoicePreview = deepCopy(previewInvoiceWithTax);
    invoicePreview.total_tax_amounts[0].tax_rate.display_name = '';

    const invoice = stripeInvoiceToFirstInvoicePreviewDTO([
      invoicePreview,
      undefined,
    ]);

    assert.equal(invoice.total, invoicePreview.total);
    assert.equal(invoice.subtotal, invoicePreview.subtotal);
    assert.equal(
      invoice.tax[0].amount,
      invoicePreview.total_tax_amounts[0].amount
    );
    assert.equal(invoice.tax[0].display_name, undefined);
    assert.equal(invoice.tax[0].inclusive, true);
  });

  it('formats an invoice with a prorated amount', () => {
    const firstInvoice = deepCopy(previewInvoiceWithTax);
    const proratedInvoice = deepCopy(previewInvoiceWithTax);
    proratedInvoice.lines.data[0].proration = true;

    const invoice = stripeInvoiceToFirstInvoicePreviewDTO([
      firstInvoice,
      proratedInvoice,
    ]);
    const expectedLineItems = buildExpectedLineItems(invoice);

    assert.deepEqual(invoice.line_items, expectedLineItems);
    assert.equal(invoice.total, previewInvoiceWithTax.total);
    assert.equal(invoice.subtotal, previewInvoiceWithTax.subtotal);
    assert.equal(
      invoice.tax[0].amount,
      previewInvoiceWithTax.total_tax_amounts[0].amount
    );
    assert.equal(
      invoice.tax[0].display_name,
      previewInvoiceWithTax.total_tax_amounts[0].tax_rate.display_name
    );
    assert.equal(invoice.tax[0].inclusive, true);
    assert.isUndefined(invoice.discount);
    assert.equal(invoice.one_time_charge, proratedInvoice.total);
    assert.equal(invoice.prorated_amount, proratedInvoice.lines.data[0].amount);
  });
});

describe('stripeInvoicesToSubsequentInvoicePreviewsDTO', () => {
  it('formats an array of invoices', () => {
    const invoice = stripeInvoicesToSubsequentInvoicePreviewsDTO([
      deepCopy(previewInvoiceWithDiscountAndTax),
      deepCopy(previewInvoiceWithDiscountAndTax),
    ]);
    assert.equal(
      invoice[0].subscriptionId,
      previewInvoiceWithDiscountAndTax.subscription
    );
    assert.equal(
      invoice[0].period_start,
      previewInvoiceWithDiscountAndTax.period_end
    );
    assert.equal(invoice[0].total, previewInvoiceWithDiscountAndTax.total);
    assert.equal(
      invoice[1].subscriptionId,
      previewInvoiceWithDiscountAndTax.subscription
    );
    assert.equal(
      invoice[1].period_start,
      previewInvoiceWithDiscountAndTax.period_end
    );
    assert.equal(invoice[1].total, previewInvoiceWithDiscountAndTax.total);
  });

  it('formats an invoice where tax display_name is an empty string', () => {
    const invoicePreview = deepCopy(previewInvoiceWithTax);
    invoicePreview.total_tax_amounts[0].tax_rate.display_name = '';

    const invoices = stripeInvoicesToSubsequentInvoicePreviewsDTO([
      invoicePreview,
    ]);
    const invoice = invoices[0];

    assert.equal(invoice.total, invoicePreview.total);
    assert.equal(invoice.subtotal, invoicePreview.subtotal);
    assert.equal(
      invoice.tax[0].amount,
      invoicePreview.total_tax_amounts[0].amount
    );
    assert.equal(invoice.tax[0].display_name, undefined);
    assert.equal(invoice.tax[0].inclusive, true);
  });
});

describe('stripeInvoiceToLatestInvoiceItemsDTO', () => {
  it('formats an invoice with tax', () => {
    const invoice = stripeInvoiceToLatestInvoiceItemsDTO(
      deepCopy(previewInvoiceWithTax)
    );
    const expectedLineItems = buildExpectedLineItems(invoice);

    assert.deepEqual(invoice.line_items, expectedLineItems);
    assert.equal(invoice.total, previewInvoiceWithTax.total);
    assert.equal(invoice.subtotal, previewInvoiceWithTax.subtotal);
    assert.equal(
      invoice.tax[0].amount,
      previewInvoiceWithTax.total_tax_amounts[0].amount
    );
    assert.equal(
      invoice.tax[0].display_name,
      previewInvoiceWithTax.total_tax_amounts[0].tax_rate.display_name
    );
    assert.equal(invoice.tax[0].inclusive, true);
    assert.isUndefined(invoice.discount);
  });

  it('formats an invoice with tax and discount', () => {
    const invoice = stripeInvoiceToLatestInvoiceItemsDTO(
      deepCopy(previewInvoiceWithDiscountAndTax)
    );
    assert.equal(invoice.total, previewInvoiceWithDiscountAndTax.total);
    assert.equal(invoice.subtotal, previewInvoiceWithDiscountAndTax.subtotal);
    assert.equal(
      invoice.tax[0].amount,
      previewInvoiceWithDiscountAndTax.total_tax_amounts[0].amount
    );
    assert.equal(
      invoice.tax[0].display_name,
      previewInvoiceWithDiscountAndTax.total_tax_amounts[0].tax_rate
        .display_name
    );
    assert.equal(invoice.tax[0].inclusive, true);
    assert.equal(
      invoice.discount.amount,
      previewInvoiceWithDiscountAndTax.total_discount_amounts[0].amount
    );
    assert.equal(
      invoice.discount.amount_off,
      previewInvoiceWithDiscountAndTax.discount.coupon.amount_off
    );
    assert.equal(
      invoice.discount.percent_off,
      previewInvoiceWithDiscountAndTax.discount.coupon.percent_off
    );
  });
});
