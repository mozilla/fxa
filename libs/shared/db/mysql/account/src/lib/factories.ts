/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { faker } from '@faker-js/faker';
import { CartState } from '../../../../../../payments/cart/src';
import { Cart } from './cart';
import { CartFields } from './types';

export const CartFactory = (override?: Partial<Cart>): CartFields => ({
  id: faker.string.uuid(),
  state: CartState.START,
  offeringConfigId: faker.helpers.arrayElement([
    'vpn',
    'relay-phone',
    'relay-email',
    'hubs',
    'mdnplus',
  ]),
  interval: faker.helpers.arrayElement([
    'daily',
    'monthly',
    'semiannually',
    'annually',
  ]),
  createdAt: faker.date.recent().getTime(),
  updatedAt: faker.date.recent().getTime(),
  amount: faker.number.int(10000),
  ...override,
});
