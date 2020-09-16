import { Stripe } from 'stripe';

export type PlanInterval = Stripe.Plan['interval'];

export interface RawMetadata {
  [propName: string]: any;
}

export interface Plan {
  amount: number | null;
  currency: string;
  interval_count: number;
  interval: PlanInterval;
  plan_id: string;
  plan_metadata?: RawMetadata;
  plan_name?: string;
  product_id: string;
  product_metadata?: RawMetadata;
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
  downloadURL?: string | null;
  emailIconURL?: string | null;
  playStoreLink?: string;
  productOrder?: string | null;
  productSet?: string | null;
  upgradeCTA?: string | null;
  webIconBackground?: string | null;
  webIconURL?: string | null;
  // capabilities:{clientID}: string // filtered out or ignored for now
}

// The ProductDetails type is exploded out into enums describing keys to
// make Stripe metadata parsing & validation easier.
export enum ProductDetailsStringProperties {
  'subtitle',
  'termsOfServiceURL',
  'termsOfServiceDownloadURL',
  'privacyNoticeURL',
  'privacyNoticeDownloadURL',
}
export enum ProductDetailsListProperties {
  'details',
}
export type ProductDetailsStringProperty = keyof typeof ProductDetailsStringProperties;
export type ProductDetailsListProperty = keyof typeof ProductDetailsListProperties;
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

// The GET /account endpoint on the auth server includes a list of
// subscriptions.  This type represents one of those subscriptions.
export type AccountSubscription = Pick<
  Stripe.Subscription,
  | 'created'
  | 'current_period_end'
  | 'current_period_start'
  | 'cancel_at_period_end'
> &
  Partial<Pick<Stripe.Charge, 'failure_code' | 'failure_message'>> & {
    end_at: Stripe.Subscription['ended_at'];
    latest_invoice: Stripe.Invoice['number'];
    plan_id: Stripe.Plan['id'];
    product_name: Stripe.Product['name'];
    product_id: Stripe.Product['id'];
    status: Omit<
      Stripe.Subscription.Status,
      'incomplete' | 'incomplete_expired'
    >;
    subscription_id: Stripe.Subscription['id'];
  };
