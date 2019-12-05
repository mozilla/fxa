export interface QueryParams {
  plan?: string;
  activated?: string;
  device_id?: string;
  flow_id?: string;
  flow_begin_time?: number;
}

export interface GenericObject {
  [propName: string]: any;
}

// https://stackoverflow.com/questions/48215950/exclude-property-from-type
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Relaxed type derived from a Function where we ignore the return value
// in actual use. Makes it easier to write mocks.
export type FunctionWithIgnoredReturn<T extends (...args: any) => any> = (
  ...args: Parameters<T>
) => unknown;

export type PromiseResolved<T> = T extends Promise<infer U> ? U : T;

export type Values<X> = X[keyof X];

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
  nickname: string;
  plan_id: string;
  status: string;
  subscription_id: string;
}

export interface Customer {
  payment_type: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  subscriptions: Array<CustomerSubscription>;
}
