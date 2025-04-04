/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StripePrice } from '@fxa/payments/stripe';

export type InvoicePreview = {
  currency: string;
  listAmount: number;
  totalAmount: number;
  taxAmounts: TaxAmount[];
  discountAmount: number | null;
  subtotal: number;
  discountEnd?: number | null;
  discountType?: string;
  number: string | null; // customer-facing invoice identifier
  paypalTransactionId?: string;
  oneTimeCharge?: number;
  nextInvoiceDate: number;
};

export interface Interval {
  interval: NonNullable<StripePrice['recurring']>['interval'];
  intervalCount: number;
}

export interface TaxAmount {
  title: string;
  inclusive: boolean;
  amount: number;
}

export enum STRIPE_CUSTOMER_METADATA {
  PaypalAgreement = 'paypalAgreementId',
}

export enum STRIPE_PRICE_METADATA {
  AppStoreProductIds = 'appStoreProductIds',
  PlaySkuIds = 'playSkuIds',
  PromotionCodes = 'promotionCodes',
}

export enum STRIPE_PRODUCT_METADATA {
  PromotionCodes = 'promotionCodes',
}

export enum STRIPE_SUBSCRIPTION_METADATA {
  Currency = 'currency',
  Amount = 'amount',
  SubscriptionPromotionCode = 'appliedPromotionCode',
}

export enum STRIPE_INVOICE_METADATA {
  RetryAttempts = 'paymentAttempts',
  PaypalTransactionId = 'paypalTransactionId',
}

export enum SubplatInterval {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
  HalfYearly = 'halfyearly',
  Yearly = 'yearly',
}

export interface TaxAddress {
  countryCode: string;
  postalCode: string;
}
