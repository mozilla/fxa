/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');

const {
  stripeInvoiceToFirstInvoicePreviewDTO,
  stripeInvoicesToSubsequentInvoicePreviewsDTO,
} = require('../../../lib/payments/stripe-formatter');
const previewInvoiceWithTax = require('./fixtures/stripe/invoice_preview_tax.json');
const previewInvoiceWithDiscountAndTax = require('./fixtures/stripe/invoice_preview_tax_discount.json');
const { deepCopy } = require('./util');

describe('stripeInvoiceToFirstInvoicePreviewDTO', () => {
  it('formats an invoice with tax', () => {
    const invoice = stripeInvoiceToFirstInvoicePreviewDTO(
      deepCopy(previewInvoiceWithTax)
    );
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
    const invoice = stripeInvoiceToFirstInvoicePreviewDTO(
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
});
