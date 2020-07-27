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
  plan_name: string;
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
