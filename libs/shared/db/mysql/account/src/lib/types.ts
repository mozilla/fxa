/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Cart } from './cart';

export type CartFields = Pick<
  Cart,
  | 'id'
  | 'uid'
  | 'state'
  | 'errorReasonId'
  | 'offeringConfigId'
  | 'interval'
  | 'experiment'
  | 'taxAddress'
  | 'createdAt'
  | 'updatedAt'
  | 'couponCode'
  | 'stripeCustomerId'
  | 'email'
  | 'amount'
>;

export enum CartState {
  START = 'start',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAIL = 'fail',
}

export interface TaxAddress {
  countryCode: string;
  postalCode: string;
}
