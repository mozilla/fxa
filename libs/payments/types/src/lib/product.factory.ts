/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Product } from './product.types';

// export const ProductFactory = {
//   create(stripeProduct: Stripe.Product): Product {
//     if (typeof stripeProduct.default_price === 'string') {
//       // throw error or fetch/expand from stripe
//       throw new Error('default_price not expanded');
//     }

//     if (typeof stripeProduct.tax_code === 'string') {
//       // throw error or fetch/expand from stripe
//       throw new Error('tax_code not expanded');
//     }

//     const product = {
//       ...stripeProduct,
//       default_price: stripeProduct.default_price,
//       tax_code: stripeProduct.tax_code,
//     } satisfies Product;

//     return product;
//   },
// };

export const ProductFactory = (override: Partial<Product>): Product => ({
  id: faker.string.alphanumeric(10),
  object: 'product',
  active: true,
  attributes: null,
  created: 1,
  description: 'test product',
  images: ['img1.jpg'],
  livemode: false,
  metadata: {},
  name: 'product',
  package_dimensions: null,
  shippable: false,
  type: 'service',
  updated: 2,
  url: 'http://product.com',
  default_price: null,
  tax_code: null,
  ...override,
});
