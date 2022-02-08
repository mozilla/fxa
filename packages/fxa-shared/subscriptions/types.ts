import { Stripe } from 'stripe';

export type PlanInterval = Stripe.Plan['interval'];

export interface RawMetadata {
  [propName: string]: any;
}

// A mapping of OAuth client ids to their corresponding capabilities.
export type ClientIdCapabilityMap = Record<string, string[]>;

export interface Plan {
  amount: number | null;
  currency: string;
  interval_count: number;
  interval: PlanInterval;
  plan_id: string;
  plan_metadata: RawMetadata | null;
  plan_name?: string;
  product_id: string;
  product_metadata: RawMetadata | null;
  product_name: string;
}

// https://mozilla.github.io/ecosystem-platform/docs/fxa-engineering/fxa-sub-platform#product-metadata
export interface PlanMetadata {
  // note: empty for now, but may be expanded in the future
}

// https://mozilla.github.io/ecosystem-platform/docs/fxa-engineering/fxa-sub-platform#product-metadata
export interface ProductMetadata {
  appStoreLink?: string;
  capabilities?: string;
  downloadURL: string | null;
  emailIconURL?: string | null;
  playStoreLink?: string;
  productOrder?: string | null;
  productSet?: string | null;
  upgradeCTA?: string | null;
  webIconBackground?: string | null;
  webIconURL: string | null;
  'product:termsOfServiceDownloadURL': string;
  'product:termsOfServiceURL': string;
  'product:privacyNoticeDownloadURL'?: string;
  'product:privacyNoticeURL': string;
  // capabilities:{clientID}: string // filtered out or ignored for now
}

// The ProductDetails type is exploded out into enums describing keys to
// make Stripe metadata parsing & validation easier.
export enum ProductDetailsStringProperties {
  'subtitle',
  'successActionButtonLabel',
  'termsOfServiceURL',
  'termsOfServiceDownloadURL',
  'privacyNoticeURL',
  'privacyNoticeDownloadURL',
}
export enum ProductDetailsListProperties {
  'details',
}
export type ProductDetailsStringProperty =
  keyof typeof ProductDetailsStringProperties;
export type ProductDetailsListProperty =
  keyof typeof ProductDetailsListProperties;
export type ProductDetails = {
  [key in ProductDetailsStringProperty]?: string;
} &
  { [key in ProductDetailsListProperty]?: string[] };

export type AbbrevProduct = {
  product_id: string;
  product_metadata: Stripe.Product['metadata'];
  product_name: string;
};

export type AbbrevPlan = {
  amount: Stripe.Plan['amount'];
  currency: Stripe.Plan['currency'];
  interval_count: Stripe.Plan['interval_count'];
  interval: Stripe.Plan['interval'];
  plan_id: string;
  plan_metadata: Stripe.Plan['metadata'];
  plan_name: string;
  product_id: string;
  product_metadata: Stripe.Product['metadata'];
  product_name: string;
};

// Do not re-order the list items without updating their references.
export const SUBSCRIPTION_TYPES = ['web', 'iap_google', 'iap_apple'] as const;
export type SubscriptionTypes = typeof SUBSCRIPTION_TYPES;
export type SubscriptionType = SubscriptionTypes[number];
export const MozillaSubscriptionTypes = {
  WEB: SUBSCRIPTION_TYPES[0],
  IAP_GOOGLE: SUBSCRIPTION_TYPES[1],
  IAP_APPLE: SUBSCRIPTION_TYPES[2],
} as const;
export type WebSubscription = Pick<
  Stripe.Subscription,
  | 'created'
  | 'current_period_end'
  | 'current_period_start'
  | 'cancel_at_period_end'
> &
  Partial<Pick<Stripe.Charge, 'failure_code' | 'failure_message'>> & {
    _subscription_type: SubscriptionTypes[0];
    end_at: Stripe.Subscription['ended_at'];
    latest_invoice: string;
    plan_id: Stripe.Plan['id'];
    product_name: Stripe.Product['name'];
    product_id: Stripe.Product['id'];
    status: Omit<
      Stripe.Subscription.Status,
      'incomplete' | 'incomplete_expired'
    >;
    subscription_id: Stripe.Subscription['id'];
    promotion_code?: string;
    next_invoice_total?: number | null;
    next_invoice_period_start?: number | null;
  };

export interface AbbrevPlayPurchase {
  auto_renewing: boolean;
  cancel_reason?: number;
  expiry_time_millis: number;
  package_name: string;
  sku: string;
}
export interface GooglePlaySubscription extends AbbrevPlayPurchase {
  _subscription_type: SubscriptionTypes[1];
  product_id: Stripe.Product['id'];
  product_name: Stripe.Product['name'];
}
export type AppleSubscription = {
  _subscription_type: SubscriptionTypes[2];
  product_id: Stripe.Product['id'];
  product_name: Stripe.Product['name'];
};
export type IapSubscription = GooglePlaySubscription | AppleSubscription;
export type MozillaSubscription = WebSubscription | IapSubscription;

export const PAYPAL_PAYMENT_ERROR_MISSING_AGREEMENT = 'missing_agreement';
export const PAYPAL_PAYMENT_ERROR_FUNDING_SOURCE = 'funding_source';
export type PaypalPaymentError =
  | typeof PAYPAL_PAYMENT_ERROR_MISSING_AGREEMENT
  | typeof PAYPAL_PAYMENT_ERROR_FUNDING_SOURCE;

export type SentEmailParams = {
  subscriptionId: string;
};

export const SubscriptionUpdateEligibility = {
  UPGRADE: 'upgrade',
  DOWNGRADE: 'downgrade',
  INVALID: 'invalid',
} as const;

export type SubscriptionUpdateEligibility =
  typeof SubscriptionUpdateEligibility[keyof typeof SubscriptionUpdateEligibility];

export enum SubscriptionStripeErrorType {
  NO_MIN_CHARGE_AMOUNT = 'Currency does not have a minimum charge amount available.',
}

export class SubscriptionStripeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubscriptionStripeError';
  }
}
