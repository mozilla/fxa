/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { faker } from '@faker-js/faker';
import {
  CreatePaypalCustomer,
  ResultPaypalCustomer,
  UpdatePaypalCustomer,
} from './paypalCustomer.types';

export const ResultPaypalCustomerFactory = (
  override?: Partial<ResultPaypalCustomer>
): ResultPaypalCustomer => ({
  ...override,
  uid: faker.string.hexadecimal({
    length: 32,
    prefix: '',
    casing: 'lower',
  }),
  billingAgreementId: faker.string.hexadecimal({
    length: 10,
    prefix: '',
  }),
  status: 'active',
  createdAt: faker.date.recent().getTime(),
  endedAt: null,
});

export const CreatePaypalCustomerFactory = (
  override?: Partial<CreatePaypalCustomer>
): CreatePaypalCustomer => ({
  uid: faker.string.hexadecimal({
    length: 32,
    prefix: '',
    casing: 'lower',
  }),
  billingAgreementId: faker.string.hexadecimal({
    length: 10,
    prefix: '',
  }),
  status: 'active',
  endedAt: null,
  ...override,
});

export const UpdatePaypalCustomerFactory = (
  override?: Partial<UpdatePaypalCustomer>
): UpdatePaypalCustomer => ({
  ...override,
  billingAgreementId: faker.string.hexadecimal({
    length: 10,
    prefix: '',
  }),
  status: 'active',
  endedAt: null,
});
