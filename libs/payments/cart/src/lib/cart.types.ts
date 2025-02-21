/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TaxAddress } from '@fxa/payments/customer';
import {
  Cart,
  CartEligibilityStatus,
  CartErrorReasonId,
  CartState,
} from '@fxa/shared/db/mysql/account';
import { StripePrice } from '@fxa/payments/stripe';
import Stripe from 'stripe';

export type CheckoutCustomerData = {
  locale: string;
  displayName: string;
};

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
  discountAmount: number | null;
  subtotal: number;
  discountEnd?: number | null;
  discountType?: string;
  number: string | null; // customer-facing invoice identifier
}

export type PaymentProvidersType =
  | Stripe.PaymentMethod.Type
  | 'google_iap'
  | 'apple_iap'
  | 'external_paypal';

export interface PaymentInfo {
  type: PaymentProvidersType;
  last4?: string;
  brand?: string;
  customerSessionClientSecret?: string;
}

export type ResultCart = Readonly<Omit<Cart, 'id' | 'uid'>> & {
  readonly id: string;
  readonly uid?: string;
};

export type FromPrice = {
  currency: string;
  interval: NonNullable<StripePrice['recurring']>['interval'];
  listAmount: number;
};

export type BaseCartDTO = Omit<ResultCart, 'state'> & {
  metricsOptedOut: boolean;
  upcomingInvoicePreview: Invoice;
  latestInvoicePreview?: Invoice;
  paymentInfo?: PaymentInfo;
  fromOfferingConfigId?: string;
  fromPrice?: FromPrice;
};

export type StartCartDTO = BaseCartDTO & {
  state: CartState.START;
};

export type ProcessingCartDTO = BaseCartDTO & {
  state: CartState.PROCESSING;
};

export type SuccessCartDTO = BaseCartDTO & {
  state: CartState.SUCCESS;
  latestInvoicePreview: Invoice;
  paymentInfo: PaymentInfo;
};

export type NeedsInputCartDTO = BaseCartDTO & {
  state: CartState.NEEDS_INPUT;
};

export type FailCartDTO = BaseCartDTO & {
  state: CartState.FAIL;
};

export type CartDTO =
  | SuccessCartDTO
  | ProcessingCartDTO
  | StartCartDTO
  | NeedsInputCartDTO
  | FailCartDTO;

export type UpgradeCartDTO = ResultCart & {
  eligibilityStatus: CartEligibilityStatus.UPGRADE;
  fromOfferingConfigId: string;
  fromPrice: FromPrice;
};

export type SetupCart = {
  uid?: string;
  interval: string;
  offeringConfigId: string;
  experiment?: string;
  taxAddress?: TaxAddress;
  currency?: string;
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
  currency?: string;
  couponCode?: string;
  email?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
};

export type CartEligibilityDetails = {
  eligibilityStatus: CartEligibilityStatus;
  state: CartState;
  errorReasonId?: CartErrorReasonId;
};

export enum NeedsInputType {
  StripeHandleNextAction = 'stripeHandleNextAction',
  NotRequired = 'notRequired',
}
type StripeHandleNextActionData = {
  clientSecret: string;
};

export type GetNeedsInputResponse = {
  inputType: NeedsInputType;
  data: StripeHandleNextActionData;
};

export interface StripeHandleNextActionResponse extends GetNeedsInputResponse {
  inputType: NeedsInputType.StripeHandleNextAction;
  data: StripeHandleNextActionData;
}

export interface NoInputNeededResponse extends GetNeedsInputResponse {
  inputType: NeedsInputType.NotRequired;
}
