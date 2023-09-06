/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Price } from './price.types';
import { ProductFactory } from './product.factory';

// export const PriceFactory = {
//   create(stripePrice: Stripe.Price): Price {
//     if (typeof stripePrice.product === 'string') {
//       // throw error or fetch/expand from stripe
//       throw new Error('product not expanded');
//     }

//     const price = {
//       ...stripePrice,
//       product: stripePrice.product,
//     } satisfies Price;

//     return price;
//   },
// };

export const PriceFactory = (override: Partial<Price>): Price => ({
  id: faker.string.alphanumeric(10),
  object: 'price',
  active: true,
  billing_scheme: 'per_unit',
  created: 1,
  currency: 'USD',
  custom_unit_amount: null,
  livemode: false,
  lookup_key: null,
  metadata: {},
  nickname: null,
  product: ProductFactory({}),
  recurring: null,
  tax_behavior: 'exclusive',
  tiers_mode: null,
  transform_quantity: null,
  type: 'recurring',
  unit_amount: 500,
  unit_amount_decimal: '5.00',
  ...override,
});
