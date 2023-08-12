/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Insertable, Selectable, Updateable } from 'kysely';
import { CartState } from './types';

export interface CartTable {
  id: Buffer;
  uid: Buffer | null;
  state: CartState;

  errorReasonId: string | null;
  offeringConfigId: string;
  interval: string;
  experiment: string | null;
  taxAddress: string | null;
  createdAt: number;
  updatedAt: number;
  couponCode: string | null;
  stripeCustomerId: string | null;
  email: string | null;
  amount: number;
  version: number;
}

export type Cart = Selectable<CartTable>;
export type NewCart = Insertable<CartTable>;
export type CartUpdate = Updateable<CartTable>;
