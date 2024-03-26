/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { StripePrice } from '../stripe.client.types';

export const PriceFactory = (override?: Partial<StripePrice>): StripePrice => ({
  id: `price_${faker.string.alphanumeric({ length: 24 })}`,
  object: 'price',
  active: true,
  billing_scheme: 'per_unit',
  created: faker.number.int(),
  currency: faker.finance.currencyCode(),
  custom_unit_amount: null,
  livemode: false,
  lookup_key: null,
  metadata: {},
  nickname: null,
  product: `prod_${faker.string.alphanumeric({ length: 14 })}`,
  recurring: null,
  tax_behavior: 'exclusive',
  tiers_mode: null,
  transform_quantity: null,
  type: 'recurring',
  unit_amount: faker.number.int({ max: 1000 }),
  unit_amount_decimal: faker.commerce.price({ min: 1000 }),
  ...override,
});
