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
  invoiceDate: number;
  invoiceUrl?: string | null;
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
  type:
    | SubPlatPaymentMethodType.Card
    | SubPlatPaymentMethodType.ApplePay
    | SubPlatPaymentMethodType.GooglePay
    | SubPlatPaymentMethodType.Link
    | SubPlatPaymentMethodType.Stripe;
  paymentMethodId: string;
}

export interface PayPalPaymentMethod {
  type: SubPlatPaymentMethodType.PayPal;
}

export type PaymentMethodTypeResponse =
  | StripePaymentMethod
  | PayPalPaymentMethod
  | null;

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

export enum PaymentMethodErrorType {
  CardExpired,
  CardExpiringInOneMonth,
  GenericIssue,
}

export enum BannerVariant {
  Error = 'error',
  Info = 'info',
  SignedIn = 'signed_in',
  Success = 'success',
  Warning = 'warning',
}

export interface DefaultPaymentMethodError {
  paymentMethodType: SubPlatPaymentMethodType;
  bannerType: BannerVariant;
  bannerTitle: string;
  bannerTitleFtl: string;
  bannerMessage: string;
  bannerMessageFtl: string;
  bannerLinkLabel: string;
  bannerLinkLabelFtl: string;
  message: string;
  messageFtl: string;
}

export interface DefaultPaymentMethod {
  type: SubPlatPaymentMethodType;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  billingAgreementId?: string;
  hasPaymentMethodError: DefaultPaymentMethodError | undefined;
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

/*
 * Metadata from Stripe is an object of strings (even if you pass a number or other type)
 * where values may or may not be present (represented as undefined)
 */
type StripeMetadata<T extends string> = {
  [key in T]?: string;
};
/**
 * Stripe metadata input allows null to "unset" a value.
 */
type StripeMetadataInput<T extends string> = {
  [key in T]?: string | number | null;
};

export enum STRIPE_CUSTOMER_METADATA {
  PaypalAgreement = 'paypalAgreementId',
  Userid = 'userid',
  GeoIpDate = 'geoip_date',
}
export type StripeCustomerMetadata = StripeMetadata<STRIPE_CUSTOMER_METADATA>;
export type StripeCustomerMetadataInput =
  StripeMetadataInput<STRIPE_CUSTOMER_METADATA>;

export enum STRIPE_PRICE_METADATA {
  AppStoreProductIds = 'appStoreProductIds',
  PlaySkuIds = 'playSkuIds',
  PromotionCodes = 'promotionCodes',
}
export type StripePriceMetadata = StripeMetadata<STRIPE_PRICE_METADATA>;
export type StripePriceMetadataInput =
  StripeMetadataInput<STRIPE_PRICE_METADATA>;

export enum STRIPE_PRODUCT_METADATA {
  PromotionCodes = 'promotionCodes',
}
export type StripeProductMetadata = StripeMetadata<STRIPE_PRODUCT_METADATA>;
export type StripeProductMetadataInput =
  StripeMetadataInput<STRIPE_PRODUCT_METADATA>;

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
}
export type StripeSubscriptionMetadata =
  StripeMetadata<STRIPE_SUBSCRIPTION_METADATA>;
export type StripeSubscriptionMetadataInput =
  StripeMetadataInput<STRIPE_SUBSCRIPTION_METADATA>;

export enum STRIPE_INVOICE_METADATA {
  RetryAttempts = 'paymentAttempts',
  PaypalTransactionId = 'paypalTransactionId',
}
export type StripeInvoiceMetadata = StripeMetadata<STRIPE_INVOICE_METADATA>;
export type StripeInvoiceMetadataInput =
  StripeMetadataInput<STRIPE_INVOICE_METADATA>;

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

export interface ChurnInterventionEntry {
  customerId: string;
  churnInterventionId: string;
  redemptionCount: number;
}

export interface ChurnInterventionEntryFirestoreRecord {
  customerId: string;
  churnInterventionId: string;
  redemptionCount: number;
}
