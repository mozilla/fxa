/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import { stripeInvoiceToFirstInvoicePreviewDTO } from './stripeInvoiceToFirstInvoicePreviewDTO';
import { StripeResponseFactory } from '../factories/api-list.factory';
import { StripeDiscountFactory } from '../factories/discount.factory';
import { StripeTaxRateFactory } from '../factories/tax-rate.factory';
import { StripeUpcomingInvoiceFactory } from '../factories/upcoming-invoice.factory';

describe('stripeInvoiceToFirstInvoicePreviewDTO', () => {
  it('formats invoice', () => {
    const mockUpcomingInvoice = StripeResponseFactory(
      StripeUpcomingInvoiceFactory({
        discount: StripeDiscountFactory(),
        total_discount_amounts: [
          {
            amount: 500,
            discount: StripeDiscountFactory(),
          },
        ],
        total_tax_amounts: [
          {
            amount: faker.number.int(1000),
            inclusive: false,
            tax_rate: StripeTaxRateFactory(),
            taxability_reason: null,
            taxable_amount: null,
          },
        ],
      })
    );

    const result = stripeInvoiceToFirstInvoicePreviewDTO(mockUpcomingInvoice);
    expect(result).toEqual({
      currency: mockUpcomingInvoice.currency,
      listAmount: mockUpcomingInvoice.amount_due,
      totalAmount: mockUpcomingInvoice.total,
      taxAmounts: [
        {
          title: mockUpcomingInvoice.total_tax_amounts[0].tax_rate.display_name,
          inclusive: mockUpcomingInvoice.total_tax_amounts[0].inclusive,
          amount: mockUpcomingInvoice.total_tax_amounts[0].amount,
        },
      ],
      discountAmount:
        mockUpcomingInvoice.discount &&
        mockUpcomingInvoice.total_discount_amounts?.[0].amount,
      subTotal: mockUpcomingInvoice.subtotal,
    });
  });
});
