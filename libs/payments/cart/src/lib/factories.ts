/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { faker } from '@faker-js/faker';
import {
  Cart,
  CartIdInput,
  Invoice,
  SetupCartInput,
  Subscription,
  TaxAddress,
  TaxAmount,
  UpdateCartInput,
} from '../gql';
import { SetupCart } from './types';
import { CartState } from '../../../../shared/db/mysql/account/src';

const OFFERING_CONFIG_IDS = [
  'vpn',
  'relay-phone',
  'relay-email',
  'hubs',
  'mdnplus',
];

export const CartFactory = (override?: Partial<Cart>): Cart => ({
  id: faker.string.uuid(),
  state: CartState.START,
  offeringConfigId: faker.helpers.arrayElement(OFFERING_CONFIG_IDS),
  interval: faker.helpers.arrayElement([
    'daily',
    'monthly',
    'semiannually',
    'annually',
  ]),
  nextInvoice: InvoiceFactory(),
  createdAt: faker.date.recent().getTime(),
  updatedAt: faker.date.recent().getTime(),
  amount: faker.number.int(10000),
  ...override,
});

export const TaxAmountFactory = (override?: Partial<TaxAmount>): TaxAmount => ({
  title: faker.location.state({ abbreviated: true }),
  amount: faker.number.int(10000),
  ...override,
});

export const InvoiceFactory = (override?: Partial<Invoice>): Invoice => ({
  totalAmount: faker.number.int(10000),
  taxAmounts: [TaxAmountFactory()],
  ...override,
});

export const SubscriptionFactory = (
  override?: Partial<Subscription>
): Subscription => ({
  pageConfigId: faker.helpers.arrayElement(['default', 'alternate-pricing']),
  previousInvoice: InvoiceFactory(),
  nextInvoice: InvoiceFactory(),
  ...override,
});

export const TaxAddressFactory = (
  override?: Partial<TaxAddress>
): TaxAddress => ({
  countryCode: faker.location.countryCode(),
  postalCode: faker.location.zipCode(),
  ...override,
});

export const CartIdInputFactory = (
  override?: Partial<CartIdInput>
): CartIdInput => ({
  id: faker.string.uuid(),
  ...override,
});

export const SetupCartInputFactory = (
  override?: Partial<SetupCartInput>
): SetupCartInput => ({
  offeringConfigId: faker.helpers.arrayElement(OFFERING_CONFIG_IDS),
  ...override,
});

export const UpdateCartInputFactory = (
  override?: Partial<UpdateCartInput>
): UpdateCartInput => ({
  id: faker.string.uuid(),
  offeringConfigId: faker.helpers.arrayElement(OFFERING_CONFIG_IDS),
  ...override,
});

export const SetupCartFactory = (override?: Partial<SetupCart>): SetupCart => ({
  offeringConfigId: faker.helpers.arrayElement(OFFERING_CONFIG_IDS),
  ...override,
});
