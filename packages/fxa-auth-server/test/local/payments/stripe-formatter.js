/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');

const {
  stripeInvoiceToInvoicePreviewDTO,
} = require('../../../lib/payments/stripe-formatter');
const previewInvoiceWithTax = require('./fixtures/stripe/invoice_preview_tax.json');
const previewInvoiceWithDiscountAndTax = require('./fixtures/stripe/invoice_preview_tax_discount.json');
const { deepCopy } = require('./util');

describe('stripeInvoiceToInvoicePreviewDTO', () => {
  it('formats an invoice with tax', () => {
    const invoice = stripeInvoiceToInvoicePreviewDTO(
      deepCopy(previewInvoiceWithTax)
    );
    assert.equal(invoice.total, previewInvoiceWithTax.total);
    assert.equal(invoice.subtotal, previewInvoiceWithTax.subtotal);
    assert.equal(invoice.currency, previewInvoiceWithTax.currency);
    assert.equal(
      invoice.tax.amount,
      previewInvoiceWithTax.total_tax_amounts[0].amount
    );
    assert.equal(
      invoice.tax.percentage,
      previewInvoiceWithTax.default_tax_rates[0].percentage
    );
    assert.equal(invoice.tax.inclusive, true);
    assert.isUndefined(invoice.discount);
  });

  it('formats an invoice with tax and discount', () => {
    const invoice = stripeInvoiceToInvoicePreviewDTO(
      deepCopy(previewInvoiceWithDiscountAndTax)
    );
    assert.equal(invoice.total, previewInvoiceWithDiscountAndTax.total);
    assert.equal(invoice.subtotal, previewInvoiceWithDiscountAndTax.subtotal);
    assert.equal(invoice.currency, previewInvoiceWithDiscountAndTax.currency);
    assert.equal(
      invoice.tax.amount,
      previewInvoiceWithDiscountAndTax.total_tax_amounts[0].amount
    );
    assert.equal(
      invoice.tax.percentage,
      previewInvoiceWithDiscountAndTax.default_tax_rates[0].percentage
    );
    assert.equal(invoice.tax.inclusive, true);
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
