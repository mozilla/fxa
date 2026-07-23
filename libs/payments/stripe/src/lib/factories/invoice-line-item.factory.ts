/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import Stripe from 'stripe';
import { StripeInvoiceLineItem } from '../stripe.client.types';

export const StripeInvoiceLineItemFactory = (
  override?: Partial<StripeInvoiceLineItem>
): StripeInvoiceLineItem => ({
  id: faker.string.alphanumeric(10),
  object: 'line_item',
  amount: faker.number.int({ max: 1000 }),
  currency: faker.finance.currencyCode().toLowerCase(),
  description: null,
  discount_amounts: null,
  discountable: true,
  discounts: [],
  invoice: null,
  livemode: false,
  metadata: {},
  parent: {
    invoice_item_details: null,
    subscription_item_details: {
      invoice_item: null,
      proration: false,
      proration_details: { credited_items: null },
      subscription: `sub_${faker.string.alphanumeric({ length: 24 })}`,
      subscription_item: `si_${faker.string.alphanumeric({ length: 14 })}`,
    },
    type: 'subscription_item_details',
  },
  period: {
    end: faker.number.int({ min: 1000000 }),
    start: faker.number.int({ max: 1000000 }),
  },
  pretax_credit_amounts: null,
  pricing: {
    price_details: {
      price: `price_${faker.string.alphanumeric({ length: 24 })}`,
      product: `prod_${faker.string.alphanumeric({ length: 24 })}`,
    },
    type: 'price_details',
    unit_amount_decimal: Stripe.Decimal.from(faker.commerce.price({ min: 1000 })),
  },
  quantity: null,
  quantity_decimal: null,
  subscription: null,
  subtotal: faker.number.int({ max: 1000 }),
  taxes: [],
  ...override,
});
