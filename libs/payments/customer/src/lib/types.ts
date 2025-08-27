/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StripePrice } from '@fxa/payments/stripe';
import { Stripe } from 'stripe';

export type InvoicePreview = {
  currency: string;
  totalAmount: number;
  taxAmounts: TaxAmount[];
  discountAmount: number | null;
  subtotal: number;
  discountEnd?: number | null;
  discountType?: string;
  number: string | null; // customer-facing invoice identifier
  paypalTransactionId?: string;
  nextInvoiceDate: number;
  amountDue: number;
  creditApplied: number | null;
  promotionName?: string | null;
  remainingAmountTotal?: number;
  startingBalance: number;
  totalExcludingTax?: number | null;
  unusedAmountTotal?: number;
  subsequentAmount?: number;
  subsequentAmountExcludingTax?: number | null;
  subsequentTax?: TaxAmount[];
};

export enum SubPlatPaymentMethodType {
  PayPal = 'external_paypal',
  Stripe = 'stripe',
  Card = 'card',
  ApplePay = 'apple_pay',
  GooglePay = 'google_pay',
  Link = 'link',
}

export interface StripePaymentMethod {
  type: SubPlatPaymentMethodType.Card
    | SubPlatPaymentMethodType.ApplePay
    | SubPlatPaymentMethodType.GooglePay
    | SubPlatPaymentMethodType.Link
    | SubPlatPaymentMethodType.Stripe
  paymentMethodId: string;
}

export interface PayPalPaymentMethod {
  type: SubPlatPaymentMethodType.PayPal;
}

export interface Interval {
  interval: NonNullable<StripePrice['recurring']>['interval'];
  intervalCount: number;
}

export interface AccountCreditBalance {
  balance: number;
  currency: string | null;
}

export type PaymentProvidersType =
  | Stripe.PaymentMethod.Type
  | 'google_iap'
  | 'apple_iap'
  | 'external_paypal';

export interface DefaultPaymentMethod {
  type: PaymentProvidersType;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  billingAgreementId?: string;
  walletType?: string;
}

export interface PricingForCurrency {
  price: StripePrice;
  unitAmountForCurrency: number | null;
  currencyOptionForCurrency: Stripe.Price.CurrencyOptions;
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
  PreviousPlanId = 'previous_plan_id',
  PlanChangeDate = 'plan_change_date',
  AutoCancelledRedundantFor = 'autoCancelledRedundantFor',
  RedundantCancellation = 'redundantCancellation',
  CancelledForCustomerAt = 'cancelled_for_customer_at',
  UtmCampaign = 'utm_campaign',
  UtmContent = 'utm_content',
  UtmMedium = 'utm_medium',
  UtmSource = 'utm_source',
  UtmTerm = 'utm_term',
  SessionFlowId = 'session_flow_id',
  SessionEntrypoint = 'session_entrypoint',
  SessionEntrypointExperiment = 'session_entrypoint_experiment',
  SessionEntrypointVariation = 'session_entrypoint_variation',
  LastUpdated = 'last_updated', // TODO - No longer required. Remove once subscription metadata update logic is updated
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
