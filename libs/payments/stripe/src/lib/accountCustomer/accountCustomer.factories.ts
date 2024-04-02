/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import {
  CreateAccountCustomer,
  ResultAccountCustomer,
  UpdateAccountCustomer,
} from './accountCustomer.types';

export const ResultAccountCustomerFactory = (
  override?: Partial<ResultAccountCustomer>
): ResultAccountCustomer => ({
  uid: faker.string.hexadecimal({
    length: 32,
    prefix: '',
    casing: 'lower',
  }),
  stripeCustomerId: faker.string.alphanumeric({
    length: 14,
  }),
  createdAt: faker.date.recent().getTime(),
  updatedAt: faker.date.recent().getTime(),
  ...override,
});

export const CreateAccountCustomerFactory = (
  override?: Partial<CreateAccountCustomer>
): CreateAccountCustomer => ({
  uid: faker.string.hexadecimal({
    length: 32,
    prefix: '',
    casing: 'lower',
  }),
  stripeCustomerId: faker.string.alphanumeric({
    length: 14,
  }),
  updatedAt: faker.date.recent().getTime(),
  ...override,
});

export const UpdateAccountCustomerFactory = (
  override?: Partial<UpdateAccountCustomer>
): UpdateAccountCustomer => ({
  stripeCustomerId: faker.string.alphanumeric({
    length: 14,
  }),
  updatedAt: faker.date.recent().getTime(),
  ...override,
});
