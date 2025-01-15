/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { InvoicePreview, TaxAddress } from '@fxa/payments/customer';
import {
  Cart,
  CartEligibilityStatus,
  CartErrorReasonId,
  CartState,
} from '@fxa/shared/db/mysql/account';
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

type RecurringIntervalType = Stripe.Price.Recurring.Interval;

export interface CurrentPrice {
  currency: string;
  interval: RecurringIntervalType;
  listAmount: number;
}

export type GetCartResult = WithContextCart | SuccessCart | UpgradeCart;

export type WithContextCart = ResultCart & {
  metricsOptedOut: boolean;
  upcomingInvoicePreview: InvoicePreview;
  latestInvoicePreview?: InvoicePreview;
  paymentInfo?: PaymentInfo;
  fromOfferingConfigId?: string;
  upgradeFromPrice?: CurrentPrice;
};

export type SuccessCart = ResultCart & {
  state: CartState.SUCCESS;
  metricsOptedOut: boolean;
  upcomingInvoicePreview: InvoicePreview;
  latestInvoicePreview: InvoicePreview;
  paymentInfo: PaymentInfo;
};

export type UpgradeCart = ResultCart & {
  eligibilityStatus: CartEligibilityStatus.UPGRADE;
  metricsOptedOut: boolean;
  upcomingInvoicePreview: InvoicePreview;
  fromOfferingConfigId: string;
  upgradeFromPrice: CurrentPrice;
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
