/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { PaypalCustomer } from '@fxa/shared/db/mysql/account';

export type ResultPaypalCustomer = Readonly<Omit<PaypalCustomer, 'uid'>> & {
  readonly uid: string;
};

export interface CreatePaypalCustomer {
  uid: string;
  billingAgreementId: string;
  status: string;
  endedAt: number | null;
}

export interface UpdatePaypalCustomer {
  billingAgreementId: string;
  status: string;
  endedAt: number | null;
}
