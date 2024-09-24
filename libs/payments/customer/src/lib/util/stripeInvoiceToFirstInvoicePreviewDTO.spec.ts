/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { stripeInvoiceToFirstInvoicePreviewDTO } from './stripeInvoiceToFirstInvoicePreviewDTO';
import {
  StripeDiscountFactory,
  StripeResponseFactory,
  StripeTotalDiscountAmountsFactory,
  StripeTotalTaxAmountsFactory,
  StripeUpcomingInvoiceFactory,
} from '@fxa/payments/stripe';

describe('stripeInvoiceToFirstInvoicePreviewDTO', () => {
  it('formats invoice', () => {
    const mockDiscountAmount = StripeTotalDiscountAmountsFactory();
    const mockTaxAmount = StripeTotalTaxAmountsFactory();
    const mockUpcomingInvoice = StripeResponseFactory(
      StripeUpcomingInvoiceFactory({
        total_discount_amounts: [mockDiscountAmount],
        total_tax_amounts: [mockTaxAmount],
      })
    );

    const result = stripeInvoiceToFirstInvoicePreviewDTO(mockUpcomingInvoice);
    expect(result).toEqual({
      currency: mockUpcomingInvoice.currency,
      listAmount: mockUpcomingInvoice.amount_due,
      totalAmount: mockUpcomingInvoice.total,
      taxAmounts: [
        {
          title: mockTaxAmount.tax_rate.display_name,
          inclusive: mockTaxAmount.inclusive,
          amount: mockTaxAmount.amount,
        },
      ],
      discountAmount: mockDiscountAmount.amount,
      subtotal: mockUpcomingInvoice.subtotal,
      discountEnd: undefined,
      discountType: undefined,
    });
  });

  it('formats invoice with discount', () => {
    const mockDiscountAmount = StripeTotalDiscountAmountsFactory();
    const mockTaxAmount = StripeTotalTaxAmountsFactory();
    const mockDiscount = StripeDiscountFactory();
    const mockUpcomingInvoice = StripeResponseFactory(
      StripeUpcomingInvoiceFactory({
        discount: mockDiscount,
        total_discount_amounts: [mockDiscountAmount],
        total_tax_amounts: [mockTaxAmount],
      })
    );

    const result = stripeInvoiceToFirstInvoicePreviewDTO(mockUpcomingInvoice);
    expect(result).toEqual({
      currency: mockUpcomingInvoice.currency,
      listAmount: mockUpcomingInvoice.amount_due,
      totalAmount: mockUpcomingInvoice.total,
      taxAmounts: [
        {
          title: mockTaxAmount.tax_rate.display_name,
          inclusive: mockTaxAmount.inclusive,
          amount: mockTaxAmount.amount,
        },
      ],
      discountAmount: mockDiscountAmount.amount,
      subtotal: mockUpcomingInvoice.subtotal,
      discountEnd: null,
      discountType: 'forever',
    });
  });

  it('formats invoice with multiple discount and tax amounts', () => {
    const mockDiscountAmount1 = StripeTotalDiscountAmountsFactory();
    const mockDiscountAmount2 = StripeTotalDiscountAmountsFactory();
    const mockTaxAmount1 = StripeTotalTaxAmountsFactory();
    const mockTaxAmount2 = StripeTotalTaxAmountsFactory();
    const mockUpcomingInvoice = StripeResponseFactory(
      StripeUpcomingInvoiceFactory({
        total_discount_amounts: [mockDiscountAmount1, mockDiscountAmount2],
        total_tax_amounts: [mockTaxAmount1, mockTaxAmount2],
      })
    );

    const result = stripeInvoiceToFirstInvoicePreviewDTO(mockUpcomingInvoice);
    expect(result).toEqual({
      currency: mockUpcomingInvoice.currency,
      listAmount: mockUpcomingInvoice.amount_due,
      totalAmount: mockUpcomingInvoice.total,
      taxAmounts: [
        {
          title: mockTaxAmount1.tax_rate.display_name,
          inclusive: mockTaxAmount1.inclusive,
          amount: mockTaxAmount1.amount,
        },
        {
          title: mockTaxAmount2.tax_rate.display_name,
          inclusive: mockTaxAmount2.inclusive,
          amount: mockTaxAmount2.amount,
        },
      ],
      discountAmount: mockDiscountAmount1.amount + mockDiscountAmount2.amount,
      subtotal: mockUpcomingInvoice.subtotal,
      discountEnd: undefined,
      discountType: undefined,
    });
  });

  it('formats invoice with empty discount and tax amounts', () => {
    const mockUpcomingInvoice = StripeResponseFactory(
      StripeUpcomingInvoiceFactory({
        total_discount_amounts: [],
        total_tax_amounts: [],
      })
    );

    const result = stripeInvoiceToFirstInvoicePreviewDTO(mockUpcomingInvoice);
    expect(result.taxAmounts).toEqual([]);
    expect(result.discountAmount).toEqual(0);
  });

  it('formats invoice with null discount', () => {
    const mockUpcomingInvoice = StripeResponseFactory(
      StripeUpcomingInvoiceFactory({
        total_discount_amounts: null,
      })
    );

    const result = stripeInvoiceToFirstInvoicePreviewDTO(mockUpcomingInvoice);
    expect(result.discountAmount).toBeNull();
  });
});
