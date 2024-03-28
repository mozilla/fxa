/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { StripeProduct } from '../stripe.client.types';

export const StripeProductFactory = (
  override?: Partial<StripeProduct>
): StripeProduct => ({
  id: `prod_${faker.string.alphanumeric({ length: 14 })}`,
  object: 'product',
  active: true,
  attributes: null,
  created: faker.number.int(),
  description: faker.string.alphanumeric(),
  images: [faker.system.commonFileName('jpg')],
  livemode: false,
  metadata: {},
  name: faker.string.alphanumeric(),
  package_dimensions: null,
  shippable: false,
  type: 'service',
  updated: faker.number.int(),
  url: faker.internet.url(),
  default_price: null,
  tax_code: null,
  ...override,
});
