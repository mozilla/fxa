/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AccountCustomer } from '@fxa/shared/db/mysql/account';

export type ResultAccountCustomer = Readonly<Omit<AccountCustomer, 'uid'>> & {
  readonly uid: string;
};

export interface CreateAccountCustomer {
  uid: string;
  stripeCustomerId: string | null;
  updatedAt: number;
}

export interface UpdateAccountCustomer {
  stripeCustomerId: string | null;
  updatedAt: number;
}
