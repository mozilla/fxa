/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import { AccountCustomer, NewCart, PaypalCustomer } from './associated-types';
import { CartState } from './keysley-types';

export const CartFactory = (override?: Partial<NewCart>): NewCart => ({
  id: Buffer.from(
    faker.string.hexadecimal({
      length: 32,
      prefix: '',
      casing: 'lower',
    }),
    'hex'
  ),
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
  version: 0,
  ...override,
});

export const AccountCustomerFactory = (
  override?: Partial<AccountCustomer>
): AccountCustomer => ({
  uid: Buffer.from(
    faker.string.hexadecimal({
      length: 32,
      prefix: '',
      casing: 'lower',
    }),
    'hex'
  ),
  stripeCustomerId: faker.string.uuid(),
  createdAt: faker.date.recent().getTime(),
  updatedAt: faker.date.recent().getTime(),
  ...override,
});

export const PaypalCustomerFactory = (
  override?: Partial<PaypalCustomer>
): PaypalCustomer => ({
  uid: Buffer.from(
    faker.string.hexadecimal({
      length: 32,
      prefix: '',
      casing: 'lower',
    }),
    'hex'
  ),
  billingAgreementId: faker.string.hexadecimal({
    length: 10,
    prefix: '',
  }),
  status: 'active',
  createdAt: faker.date.recent().getTime(),
  endedAt: null,
  ...override,
});
