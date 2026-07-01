/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { stripeInvoiceToInvoicePreviewDTO } from './stripeInvoiceToFirstInvoicePreviewDTO';
import {
  StripeApiListFactory,
  StripeCouponFactory,
  StripeDiscountFactory,
  StripeInvoiceLineItemFactory,
  StripeInvoiceLineItemTaxFactory,
  StripeResponseFactory,
  StripeTaxRateFactory,
  StripeTotalDiscountAmountsFactory,
  StripeUpcomingInvoiceFactory,
} from '@fxa/payments/stripe';

describe('stripeInvoiceToFirstInvoicePreviewDTO', () => {
  it('formats invoice', () => {
    const mockDiscountAmount = StripeTotalDiscountAmountsFactory();
    // createPreview expands the tax_rate on both line-item taxes and invoice-level
    // total_taxes, so each surfaces a TaxRate object the DTO reads display_name from.
    const mockLineItemTaxRate = StripeTaxRateFactory();
    const mockTotalTaxRate = StripeTaxRateFactory();
    const mockLineItemTax = StripeInvoiceLineItemTaxFactory({
      tax_behavior: 'exclusive',
      tax_rate_details: { tax_rate: mockLineItemTaxRate as unknown as string },
    });
    const mockTotalTax = StripeInvoiceLineItemTaxFactory({
      amount: 123,
      tax_behavior: 'exclusive',
      tax_rate_details: { tax_rate: mockTotalTaxRate as unknown as string },
    });
    const mockInvoiceLineItem = StripeInvoiceLineItemFactory({
      taxes: [mockLineItemTax],
    });
    const mockUpcomingInvoice = StripeResponseFactory(
      StripeUpcomingInvoiceFactory({
        lines: StripeApiListFactory([mockInvoiceLineItem]),
        total_discount_amounts: [mockDiscountAmount],
        total_taxes: [mockTotalTax],
      })
    );

    const result = stripeInvoiceToInvoicePreviewDTO(mockUpcomingInvoice);
    expect(result).toEqual({
      currency: mockUpcomingInvoice.currency,
      totalAmount: mockUpcomingInvoice.total,
      taxAmounts: [
        {
          title: mockTotalTaxRate.display_name,
          inclusive: false,
          amount: 123,
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
      invoiceDate: mockUpcomingInvoice.created,
      number: null,
      nextInvoiceDate: mockUpcomingInvoice.lines.data[0].period.end,
      promotionName: undefined,
      subsequentAmount: mockInvoiceLineItem.amount,
      subsequentAmountExcludingTax: mockInvoiceLineItem.amount,
      subsequentTax: [
        {
          title: mockLineItemTaxRate.display_name,
          inclusive: false,
          amount: mockLineItemTax.amount,
        },
      ],
      totalExcludingTax: mockUpcomingInvoice.total_excluding_tax,
    });
  });

  it('subtracts inclusive line-item tax from subsequentAmountExcludingTax', () => {
    const mockInclusiveTax = StripeInvoiceLineItemTaxFactory({
      tax_behavior: 'inclusive',
      amount: 50,
    });
    const mockInvoiceLineItem = StripeInvoiceLineItemFactory({
      amount: 1000,
      taxes: [mockInclusiveTax],
    });
    const mockUpcomingInvoice = StripeResponseFactory(
      StripeUpcomingInvoiceFactory({
        lines: StripeApiListFactory([mockInvoiceLineItem]),
        total_discount_amounts: [],
        total_taxes: [],
      })
    );

    const result = stripeInvoiceToInvoicePreviewDTO(mockUpcomingInvoice);
    expect(result.subsequentAmount).toBe(1000);
    expect(result.subsequentAmountExcludingTax).toBe(950);
  });

  it('formats invoice with discount', () => {
    const mockDiscountAmount = StripeTotalDiscountAmountsFactory();
    const mockDiscount = StripeDiscountFactory({
      source: {
        type: 'coupon',
        coupon: StripeCouponFactory({
          name: 'Sonny and Jerry Two-Fur-One Special',
          duration: 'repeating',
        }),
      },
      end: 1700000000,
    });
    const mockInvoiceLineItem = StripeInvoiceLineItemFactory({ taxes: [] });
    const mockUpcomingInvoice = StripeResponseFactory(
      StripeUpcomingInvoiceFactory({
        discounts: [mockDiscount],
        lines: StripeApiListFactory([mockInvoiceLineItem]),
        total_discount_amounts: [mockDiscountAmount],
        total_taxes: [],
      })
    );

    const result = stripeInvoiceToInvoicePreviewDTO(mockUpcomingInvoice);
    expect(result.discountAmount).toBe(mockDiscountAmount.amount);
    expect(result.discountEnd).toBe(1700000000);
    expect(result.discountType).toBe('repeating');
    expect(result.promotionName).toBe('Sonny and Jerry Two-Fur-One Special');
  });

  it('sums multiple discount and tax amounts', () => {
    const mockDiscountAmount1 = StripeTotalDiscountAmountsFactory();
    const mockDiscountAmount2 = StripeTotalDiscountAmountsFactory();
    const mockInvoiceLineItem = StripeInvoiceLineItemFactory({ taxes: [] });
    const mockUpcomingInvoice = StripeResponseFactory(
      StripeUpcomingInvoiceFactory({
        lines: StripeApiListFactory([mockInvoiceLineItem]),
        total_discount_amounts: [mockDiscountAmount1, mockDiscountAmount2],
        total_taxes: [
          StripeInvoiceLineItemTaxFactory({ amount: 10 }),
          StripeInvoiceLineItemTaxFactory({ amount: 20 }),
        ],
      })
    );

    const result = stripeInvoiceToInvoicePreviewDTO(mockUpcomingInvoice);
    expect(result.discountAmount).toBe(
      mockDiscountAmount1.amount + mockDiscountAmount2.amount
    );
    expect(result.taxAmounts).toEqual([
      { title: '', inclusive: false, amount: 10 },
      { title: '', inclusive: false, amount: 20 },
    ]);
  });

  it('formats invoice with empty discount and tax amounts', () => {
    const mockUpcomingInvoice = StripeResponseFactory(
      StripeUpcomingInvoiceFactory({
        total_discount_amounts: [],
        total_taxes: [],
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
