/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { type AccountCreditBalance } from '../types';

export const AccountCreditBalanceFactory = (
  override?: Partial<AccountCreditBalance>
): AccountCreditBalance => ({
  balance: faker.number.int({ min: 0 }),
  currency: faker.finance.currencyCode().toLowerCase(),
  ...override,
});
