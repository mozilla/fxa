/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  Cart,
  CartEligibilityStatus,
  CartErrorReasonId,
  CartState,
} from '@fxa/shared/db/mysql/account';

export interface TaxAddress {
  countryCode: string;
  postalCode: string;
}

export type FinishCart = {
  uid?: string;
  amount?: number;
  stripeCustomerId?: string;
};

export type FinishErrorCart = {
  uid?: string;
  errorReasonId: CartErrorReasonId;
  amount?: number;
  stripeCustomerId?: string;
};

export interface Invoice {
  currency: string;
  listAmount: number;
  totalAmount: number;
  taxAmounts: TaxAmount[];
  discountAmount: number;
}

export type ResultCart = Readonly<Omit<Cart, 'id' | 'uid'>> & {
  readonly id: string;
  readonly uid?: string;
};

export type SetupCart = {
  uid?: string;
  interval: string;
  offeringConfigId: string;
  experiment?: string;
  taxAddress?: TaxAddress;
  couponCode?: string;
  stripeCustomerId?: string;
  email?: string;
  amount: number;
  eligibilityStatus: CartEligibilityStatus;
};

export interface TaxAmount {
  title: string;
  inclusive: boolean;
  amount: number;
}

export type UpdateCart = {
  uid?: string;
  taxAddress?: TaxAddress;
  couponCode?: string;
  email?: string;
};

export type CartEligibilityDetails = {
  eligibilityStatus: CartEligibilityStatus;
  state: CartState;
  errorReasonId?: CartErrorReasonId;
};
