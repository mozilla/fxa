/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import {
  Account,
  AccountCustomer,
  NewCart,
  PaypalCustomer,
  SessionToken,
  UnverifiedToken,
  RecoveryPhone,
} from './associated-types';
import { CartEligibilityStatus, CartState } from './kysely-types';

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
  currency: faker.finance.currencyCode(),
  createdAt: faker.date.recent().getTime(),
  updatedAt: faker.date.recent().getTime(),
  amount: faker.number.int(10000),
  version: 0,
  eligibilityStatus: faker.helpers.enumValue(CartEligibilityStatus),
  ...override,
});

const getHexBuffer = (length: number, prefix = ''): Buffer => {
  return Buffer.from(
    faker.string.hexadecimal({
      length,
      prefix,
      casing: 'lower',
    }),
    'hex'
  );
};

export const AccountFactory = (override?: Partial<Account>): Account => ({
  uid: getHexBuffer(32),
  createdAt: faker.date.recent().getTime(),
  email: faker.internet.email(),
  normalizedEmail: faker.internet.email().toLocaleLowerCase(),
  emailCode: getHexBuffer(16),
  emailVerified: 1,
  verifierVersion: 1,
  kA: getHexBuffer(32),
  wrapWrapKb: Buffer.from(
    faker.string.hexadecimal({
      length: 32,
      prefix: '',
      casing: 'lower',
    }),
    'hex'
  ),
  wrapWrapKbVersion2: getHexBuffer(32),
  authSalt: getHexBuffer(32),
  verifyHash: getHexBuffer(32),
  verifierSetAt: faker.date.recent().getTime(),
  verifyHashVersion2: getHexBuffer(32),
  locale: 'en-US',
  lockedAt: null,
  profileChangedAt: null,
  keysChangedAt: null,
  ecosystemAnonId: faker.string.numeric(),
  disabledAt: null,
  metricsOptOutAt: null,
  clientSalt: null,
  atLeast18AtReg: 1,
  ...override,
});

export const SessionTokenFactory = (override?: Partial<SessionToken>) => {
  return {
    tokenId: getHexBuffer(32),
    tokenData: getHexBuffer(32),
    uid: getHexBuffer(32),
    createdAt: faker.date.recent().getTime(),
    uaBrowser: null,
    uaBrowserVersion: null,
    uaOS: null,
    uaOSVersion: null,
    uaDeviceType: null,
    lastAccessTime: faker.date.recent().getTime(),
    uaFormFactor: null,
    authAt: null,
    verificationMethod: null,
    verifiedAt: null,
    mustVerify: 0,
    ...override,
  };
};

export const UnverifiedTokenFactory = (override?: Partial<UnverifiedToken>) => {
  return {
    tokenId: getHexBuffer(32),
    tokenVerificationId: getHexBuffer(32),
    uid: getHexBuffer(32),
    mustVerify: 0,
    tokenVerificationCodeHash: null,
    tokenVerificationCodeExpiresAt: null,
    ...override,
  };
};

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
  stripeCustomerId: faker.string.alphanumeric({
    length: 14,
  }),
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

export const RecoveryPhoneFactory = (override?: Partial<RecoveryPhone>) => ({
  uid: Buffer.from(
    faker.string.hexadecimal({
      length: 32,
      prefix: '',
      casing: 'lower',
    }),
    'hex'
  ),
  phoneNumber: faker.phone.number({ style: 'international' }),
  createdAt: Date.now(),
  lastConfirmed: Date.now(),
  lookupData: JSON.stringify({
    a: 'test',
    b: 'test2',
  }),
  ...override,
});
