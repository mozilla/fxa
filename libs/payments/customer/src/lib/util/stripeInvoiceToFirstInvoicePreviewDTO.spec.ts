/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { stripeInvoiceToInvoicePreviewDTO } from './stripeInvoiceToFirstInvoicePreviewDTO';
import {
  StripeApiListFactory,
  StripeCouponFactory,
  StripeDiscountFactory,
  StripeInvoiceLineItemFactory,
  StripeResponseFactory,
  StripeTotalDiscountAmountsFactory,
  StripeTotalTaxAmountsFactory,
  StripeUpcomingInvoiceFactory,
} from '@fxa/payments/stripe';

describe('stripeInvoiceToFirstInvoicePreviewDTO', () => {
  it('formats invoice', () => {
    const mockDiscountAmount = StripeTotalDiscountAmountsFactory();
    const mockTaxAmount = StripeTotalTaxAmountsFactory();
    const mockInvoiceLineItem = StripeInvoiceLineItemFactory({
      tax_amounts: [mockTaxAmount],
    });
    const mockUpcomingInvoice = StripeResponseFactory(
      StripeUpcomingInvoiceFactory({
        lines: StripeApiListFactory([mockInvoiceLineItem]),
        total_discount_amounts: [mockDiscountAmount],
        total_tax_amounts: [mockTaxAmount],
      })
    );

    const result = stripeInvoiceToInvoicePreviewDTO(mockUpcomingInvoice);
    expect(result).toEqual({
      currency: mockUpcomingInvoice.currency,
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
      amountDue: mockUpcomingInvoice.amount_due,
      creditApplied: mockUpcomingInvoice.ending_balance
        ? mockUpcomingInvoice.starting_balance -
          mockUpcomingInvoice.ending_balance
        : mockUpcomingInvoice.starting_balance,
      remainingAmountTotal: undefined,
      startingBalance: mockUpcomingInvoice.starting_balance,
      unusedAmountTotal: 0,
      discountEnd: undefined,
      discountType: undefined,
      number: null,
      nextInvoiceDate: mockUpcomingInvoice.lines.data[0].period.end,
      subsequentAmount: mockInvoiceLineItem.amount,
      subsequentAmountExcludingTax: mockInvoiceLineItem.amount_excluding_tax,
      subsequentTax: [
        {
          title: mockTaxAmount.tax_rate.display_name,
          inclusive: mockTaxAmount.inclusive,
          amount: mockTaxAmount.amount,
        },
      ],
      totalExcludingTax: mockUpcomingInvoice.total_excluding_tax,
    });
  });

  it('formats invoice with discount', () => {
    const mockDiscountAmount = StripeTotalDiscountAmountsFactory();
    const mockTaxAmount = StripeTotalTaxAmountsFactory();
    const mockDiscount = StripeDiscountFactory({
      coupon: StripeCouponFactory({
        name: 'Sonny and Jerry Two-Fur-One Special',
      }),
    });
    const mockInvoiceLineItem = StripeInvoiceLineItemFactory({
      tax_amounts: [mockTaxAmount],
    });
    const mockUpcomingInvoice = StripeResponseFactory(
      StripeUpcomingInvoiceFactory({
        discount: mockDiscount,
        lines: StripeApiListFactory([mockInvoiceLineItem]),
        total_discount_amounts: [mockDiscountAmount],
        total_tax_amounts: [mockTaxAmount],
      })
    );

    const result = stripeInvoiceToInvoicePreviewDTO(mockUpcomingInvoice);
    expect(result).toEqual({
      currency: mockUpcomingInvoice.currency,
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
      amountDue: mockUpcomingInvoice.amount_due,
      creditApplied: mockUpcomingInvoice.ending_balance
        ? mockUpcomingInvoice.starting_balance -
          mockUpcomingInvoice.ending_balance
        : mockUpcomingInvoice.starting_balance,
      remainingAmountTotal: undefined,
      startingBalance: mockUpcomingInvoice.starting_balance,
      unusedAmountTotal: 0,
      discountEnd: null,
      discountType: mockDiscount.coupon.duration,
      number: null,
      nextInvoiceDate: mockUpcomingInvoice.lines.data[0].period.end,
      promotionName: 'Sonny and Jerry Two-Fur-One Special',
      subsequentAmount: mockInvoiceLineItem.amount,
      subsequentAmountExcludingTax: mockInvoiceLineItem.amount_excluding_tax,
      subsequentTax: [
        {
          title: mockTaxAmount.tax_rate.display_name,
          inclusive: mockTaxAmount.inclusive,
          amount: mockTaxAmount.amount,
        },
      ],
      totalExcludingTax: mockUpcomingInvoice.total_excluding_tax,
    });
  });

  it('formats invoice with multiple discount and tax amounts', () => {
    const mockDiscountAmount1 = StripeTotalDiscountAmountsFactory();
    const mockDiscountAmount2 = StripeTotalDiscountAmountsFactory();
    const mockTaxAmount1 = StripeTotalTaxAmountsFactory();
    const mockTaxAmount2 = StripeTotalTaxAmountsFactory();
    const mockInvoiceLineItem = StripeInvoiceLineItemFactory({
      tax_amounts: [mockTaxAmount1],
    });
    const mockUpcomingInvoice = StripeResponseFactory(
      StripeUpcomingInvoiceFactory({
        lines: StripeApiListFactory([mockInvoiceLineItem]),
        total_discount_amounts: [mockDiscountAmount1, mockDiscountAmount2],
        total_tax_amounts: [mockTaxAmount1, mockTaxAmount2],
      })
    );

    const result = stripeInvoiceToInvoicePreviewDTO(mockUpcomingInvoice);
    expect(result).toEqual({
      currency: mockUpcomingInvoice.currency,
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
      amountDue: mockUpcomingInvoice.amount_due,
      creditApplied: mockUpcomingInvoice.ending_balance
        ? mockUpcomingInvoice.starting_balance -
          mockUpcomingInvoice.ending_balance
        : mockUpcomingInvoice.starting_balance,
      remainingAmountTotal: undefined,
      startingBalance: mockUpcomingInvoice.starting_balance,
      unusedAmountTotal: 0,
      discountEnd: undefined,
      discountType: undefined,
      number: null,
      nextInvoiceDate: mockUpcomingInvoice.lines.data[0].period.end,
      subsequentAmount: mockInvoiceLineItem.amount,
      subsequentAmountExcludingTax: mockInvoiceLineItem.amount_excluding_tax,
      subsequentTax: [
        {
          title: mockTaxAmount1.tax_rate.display_name,
          inclusive: mockTaxAmount1.inclusive,
          amount: mockTaxAmount1.amount,
        },
      ],
      totalExcludingTax: mockUpcomingInvoice.total_excluding_tax,
    });
  });

  it('formats invoice with empty discount and tax amounts', () => {
    const mockUpcomingInvoice = StripeResponseFactory(
      StripeUpcomingInvoiceFactory({
        total_discount_amounts: [],
        total_tax_amounts: [],
      })
    );

    const result = stripeInvoiceToInvoicePreviewDTO(mockUpcomingInvoice);
    expect(result.taxAmounts).toEqual([]);
    expect(result.discountAmount).toEqual(0);
  });

  it('formats invoice with null discount', () => {
    const mockUpcomingInvoice = StripeResponseFactory(
      StripeUpcomingInvoiceFactory({
        total_discount_amounts: null,
      })
    );

    const result = stripeInvoiceToInvoicePreviewDTO(mockUpcomingInvoice);
    expect(result.discountAmount).toBeNull();
  });
});
