/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Account } from '../../../models';
import { mockEmail } from '../../../models/mocks';

export const MOCK_NO_SEC_EMAIL: Account['emails'] = [mockEmail()];

export const MOCK_ONE_UNVERIFIED_SEC_EMAIL: Account['emails'] = [
  mockEmail(),
  mockEmail('johndope2@example.com', false, false),
];

export const MOCK_ONE_VERIFIED_SEC_EMAIL = [
  mockEmail(),
  mockEmail('johndope2@example.com', false),
];

export const MOCK_MANY_VERIFIED_SEC_EMAILS = [
  mockEmail(),
  mockEmail('johndope2@example.com', false),
  mockEmail('johndope3@example.com', false),
  mockEmail('johndope4@example.com', false),
];

export const MOCK_MANY_SEC_EMAILS_ONE_UNVERIFIED = [
  mockEmail(),
  mockEmail('johndope2@example.com', false),
  mockEmail('johndope3@example.com', false, false),
  mockEmail('johndope4@example.com', false),
];

export const MOCK_MANY_SEC_EMAILS_MANY_UNVERIFIED = [
  mockEmail(),
  mockEmail('johndope2@example.com', false),
  mockEmail('johndope3@example.com', false, false),
  mockEmail('johndope4@example.com', false, false),
];

/**
 * Creates a mock account to provide to the AppContext. Gives strong typing
 * and avoids the need to use `as unknown as Account` in tests.
 * @param overrides
 * @returns
 */
export const createMockAccount = (overrides: Partial<Account> = {}) => {
  const base: Partial<Account> = {
    emails: [mockEmail(), mockEmail('johndope2@example.com', false, false)],
  };
  return { ...base, ...overrides } as Account;
};
