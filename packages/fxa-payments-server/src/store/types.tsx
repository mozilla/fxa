export interface Profile {
  amrValues: Array<string>;
  avatar: string;
  avatarDefault: boolean;
  displayName: string;
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
  product_id: string;
  product_name: string;
  currency: string;
  amount: number;
  interval: string;
}

export interface Subscription {
  subscriptionId: string;
  // TODO: Rename `productName` column to `productId`
  // https://github.com/mozilla/fxa/issues/1187
  productName: string;
  createdAt: number;
  cancelledAt: number | null;
}

export interface CustomerSubscription {
  current_period_end: string;
  current_period_start:  string;
  ended_at: string | null,
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

export interface FetchState<T> {
  error: any;
  loading: boolean;
  result: T | null;
}

export interface CreateSubscriptionResult {
  subscriptionId: string;
}

export type CustomerFetchState = FetchState<Customer>;
export type CreateSubscriptionFetchState = FetchState<CreateSubscriptionResult>;
export type CancelSubscriptionFetchState = FetchState<any>;
export type UpdatePaymentFetchState = FetchState<any>;
export type ProfileFetchState = FetchState<Profile>;
export type TokenFetchState = FetchState<Token>;
export type PlansFetchState = FetchState<Array<Plan>>;
export type SubscriptionsFetchState = FetchState<Array<Subscription>>;

export interface State {
  api: {
    cancelSubscription: CreateSubscriptionFetchState;
    createSubscription: CancelSubscriptionFetchState;
    customer: CustomerFetchState;
    plans: PlansFetchState;
    profile: ProfileFetchState;
    subscriptions: SubscriptionsFetchState;
    token: TokenFetchState;
    updatePayment: UpdatePaymentFetchState;
  }
}

export interface Selector {
  (state: State): any;
}

export interface Selectors {
  [propName: string]: Selector;
}

export type Payload = any; 

export interface Action {
  type: string;
  payload: Payload;
  meta?: any;
}

export interface ActionCreator {
  (...args: any): Action;
}

export interface AsyncThunk {
  (dispatch: Function, getState: Function): Promise<void>;
}

export interface AsyncThunkCreator {
  (...args: any): AsyncThunk;
}

export interface ActionCreators {
  [propName: string]: ActionCreator | AsyncThunkCreator;
}