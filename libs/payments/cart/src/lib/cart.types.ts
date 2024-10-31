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
}

export type ResultCart = Readonly<Omit<Cart, 'id' | 'uid'>> & {
  readonly id: string;
  readonly uid?: string;
};

export type WithContextCart = ResultCart & {
  metricsOptedOut: boolean;
  upcomingInvoicePreview: Invoice;
  latestInvoicePreview?: Invoice;
  paymentInfo?: PaymentInfo;
};

export type SuccessCart = WithContextCart & {
  latestInvoicePreview: Invoice;
  paymentInfo: PaymentInfo;
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

export type PollCartResponse = {
  cartState: CartState;
  stripeClientSecret?: string;
};
