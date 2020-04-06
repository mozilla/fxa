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

export interface Plan {
  plan_id: string;
  plan_name: string;
  plan_metadata?: PlanMetadata;
  product_id: string;
  product_name: string;
  product_metadata?: ProductMetadata;
  currency: string;
  amount: number;
  interval: string;
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
  nickname: string;
  plan_id: string;
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
