export type FetchStateUninitialized = {
  error: null;
  loading: false;
  result: null;
};
export type FetchStateLoading = { error: null; loading: true; result: null };
export type FetchStateError<E> = { error: E; loading: false; result: null };
export type FetchStateLoaded<T> = { error: null; loading: false; result: T };
export type FetchState<T, E = any> =
  | FetchStateUninitialized
  | FetchStateLoading
  | FetchStateError<E>
  | FetchStateLoaded<T>;

export interface Profile {
  amrValues: Array<string>;
  avatar: string;
  avatarDefault: boolean;
  displayName: string | null;
  email: string;
  locale: string;
  twoFactorAuthentication: boolean;
  uid: string;
}

export interface Token {
  active: boolean;
  scope: string;
  client_id: string;
  token_type: string;
  exp: number;
  iat: number;
  sub: string;
  jti: string;
}

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
  webIconBackground?: string | null;
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

export interface Subscription {
  subscriptionId: string;
  productId: string;
  createdAt: number;
  cancelledAt: number | null;
}

export interface CustomerSubscription {
  cancel_at_period_end: boolean;
  current_period_end: number;
  current_period_start: number;
  end_at: number | null;
  latest_invoice: string;
  plan_id: string;
  product_id: string;
  product_name: string;
  status: string;
  subscription_id: string;
}

export interface Customer {
  billing_name: string | null;
  payment_type: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  brand: string;
  subscriptions: Array<CustomerSubscription>;
}

export interface CreateSubscriptionResult {
  subscriptionId: string;
}
export type CreateSubscriptionError = {
  code: string;
  message: string;
  error?: string;
  errno?: number;
  info?: string;
  statusCode?: number;
};

export interface UpdateSubscriptionPlanResult {
  subscriptionId: string;
}

export interface CancelSubscriptionResult {
  subscriptionId: string;
}
