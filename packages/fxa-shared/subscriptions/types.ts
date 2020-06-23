export type PlanInterval = 'day' | 'week' | 'month' | 'year';

export interface RawMetadata {
  [propName: string]: any;
}

export interface Plan {
  plan_id: string;
  plan_metadata?: RawMetadata;
  product_id: string;
  product_name: string;
  product_metadata?: RawMetadata;
  currency: string;
  amount: number;
  interval: PlanInterval;
  interval_count: number;
}

// https://mana.mozilla.org/wiki/pages/viewpage.action?spaceKey=COPS&title=SP+Tiered+Product+Support#SPTieredProductSupport-MetadataAgreements
export interface PlanMetadata {
  // note: empty for now, but may be expanded in the future
}

// https://mana.mozilla.org/wiki/pages/viewpage.action?spaceKey=COPS&title=SP+Tiered+Product+Support#SPTieredProductSupport-MetadataAgreements
export interface ProductMetadata {
  productSet?: string | null;
  productOrder?: number | null;
  emailIconURL?: string | null;
  webIconURL?: string | null;
  upgradeCTA?: string | null;
  downloadURL?: string | null;
  // capabilities:{clientID}: string // filtered out or ignored for now
}

// The ProductDetails type is exploded out into enums describing keys to
// make Stripe metadata parsing & validation easier.
export enum ProductDetailsStringProperties {
  'subtitle',
  'termsOfServiceURL',
  'privacyNoticeURL',
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
