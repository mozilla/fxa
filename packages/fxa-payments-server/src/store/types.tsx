import { Store as ReduxStore } from 'redux';
import { APIError } from '../lib/apiClient';

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
  product_id: string;
  product_name: string;
  currency: string;
  amount: number;
  interval: string;
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

export interface FetchState<T, E = any> {
  error: E | null;
  loading: boolean;
  result: T | null;
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
export type CreateSubscriptionFetchState = FetchState<
  CreateSubscriptionResult,
  CreateSubscriptionError
>;

export type PlansFetchState = FetchState<Array<Plan>, APIError>;
export type CustomerFetchState = FetchState<Customer, APIError>;
export type ProfileFetchState = FetchState<Profile, APIError>;

export type CancelSubscriptionFetchState = FetchState<Subscription>;
export type ReactivateSubscriptionFetchState = FetchState<any>;
export type UpdatePaymentFetchState = FetchState<any>;
export type TokenFetchState = FetchState<Token>;
export type SubscriptionsFetchState = FetchState<Array<Subscription>>;

export interface State {
  api: {
    cancelSubscription: CreateSubscriptionFetchState;
    reactivateSubscription: ReactivateSubscriptionFetchState;
    createSubscription: CancelSubscriptionFetchState;
    customer: CustomerFetchState;
    plans: PlansFetchState;
    profile: ProfileFetchState;
    subscriptions: SubscriptionsFetchState;
    token: TokenFetchState;
    updatePayment: UpdatePaymentFetchState;
  };
}

export interface Selector {
  (state: State): any;
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
  [propName: string]: ActionCreator;
}

export type Store = ReduxStore<State, Action>;
