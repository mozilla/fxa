/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { StripeInvoiceLineItem } from '../stripe.client.types';

export const StripeInvoiceLineItemFactory = (
  override?: Partial<StripeInvoiceLineItem>
): StripeInvoiceLineItem => ({
  id: faker.string.alphanumeric(10),
  object: 'line_item',
  amount: faker.number.int({ max: 1000 }),
  amount_excluding_tax: faker.number.int({ max: 1000 }),
  currency: faker.finance.currencyCode(),
  description: null,
  discount_amounts: null,
  discountable: true,
  discounts: [],
  invoice: null,
  livemode: false,
  metadata: {},
  period: {
    end: faker.number.int({ min: 1000000 }),
    start: faker.number.int({ max: 1000000 }),
  },
  plan: null,
  price: null,
  proration: false,
  proration_details: null,
  quantity: null,
  subscription: null,
  tax_amounts: [],
  tax_rates: [],
  type: 'subscription',
  unit_amount_excluding_tax: null,
  ...override,
});
