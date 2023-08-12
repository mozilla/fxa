/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { NewCart, CartUpdate } from '../../../../shared/db/mysql/account/src';

export interface TaxAmount {
  title: string;
  amount: number;
}

export interface Invoice {
  totalAmount: number;
  taxAmounts: TaxAmount[];
}

// Externally visible cart which has id/uid switched to strings if present.
export type Cart = Readonly<
  Omit<NewCart, 'id' | 'uid'> & { id: string; uid?: string }
>;

export type SetupCart = Readonly<
  Pick<
    Omit<NewCart, 'id' | 'uid'>,
    | 'errorReasonId'
    | 'offeringConfigId'
    | 'experiment'
    | 'taxAddress'
    | 'couponCode'
    | 'stripeCustomerId'
    | 'email'
  > & { uid?: string; interval?: string }
>;

export type UpdateCart = Readonly<
  Pick<CartUpdate, 'id' | 'taxAddress' | 'couponCode' | 'email'> & {
    version: number;
  }
>;
