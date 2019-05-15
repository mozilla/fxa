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
  product_id: string;
  currency: string;
  amount: number;
  interval: string;
}

export interface Subscription {
  subscriptionId: string;
  productName: string;
  createdAt: number;
}

export interface FetchState<T> {
  error: any;
  loading: boolean;
  result: T;
}

export interface CreateSubscriptionResult {
  subscriptionId: string;
}

export type CreateSubscriptionFetchState = FetchState<CreateSubscriptionResult>;
export type CancelSubscriptionFetchState = FetchState<any>;
export type ProfileFetchState = FetchState<Profile>;
export type TokenFetchState = FetchState<Token>;
export type PlansFetchState = FetchState<Array<Plan>>;
export type SubscriptionsFetchState = FetchState<Array<Subscription>>;

export interface State {
  api: {
    cancelSubscription: CreateSubscriptionFetchState;
    createSubscription: CancelSubscriptionFetchState;
    plans: PlansFetchState;
    profile: ProfileFetchState;
    subscriptions: SubscriptionsFetchState;
    token: TokenFetchState;
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