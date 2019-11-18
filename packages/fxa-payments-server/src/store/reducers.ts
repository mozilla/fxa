import { ActionType as PromiseActionType } from 'redux-promise-middleware';

import { APIError } from '../lib/apiClient';
import {
  State,
  FetchState,
  Subscription,
  Plan,
  Profile,
  Token,
  Customer,
  CreateSubscriptionResult,
  CreateSubscriptionError,
  UpdateSubscriptionPlanResult,
} from './types';

import { Action, ApiAction, ResetAction } from './actions';

export type Reducer = (state: State | undefined, action: Action) => State;

export const defaultState = {
  customer: fetchDefault<Customer, APIError>(),
  plans: fetchDefault<Array<Plan>, APIError>(),
  profile: fetchDefault<Profile, APIError>(),
  subscriptions: fetchDefault<Array<Subscription>>(),
  token: fetchDefault<Token>(),
  cancelSubscription: fetchDefault<Subscription>(),
  reactivateSubscription: fetchDefault<any>(),
  createSubscription: fetchDefault<
    CreateSubscriptionResult,
    CreateSubscriptionError
  >(),
  updateSubscriptionPlan: fetchDefault<
    UpdateSubscriptionPlanResult,
    APIError
  >(),
  updatePayment: fetchDefault<any>(),
};

type ResetTypeToStoreMap = Record<ResetAction['type'], keyof State>;
const resetTypeToStoreMap: ResetTypeToStoreMap = {
  resetCancelSubscription: 'cancelSubscription',
  resetUpdateSubscriptionPlan: 'updateSubscriptionPlan',
  resetCreateSubscription: 'createSubscription',
  resetReactivateSubscription: 'reactivateSubscription',
  resetUpdatePayment: 'updatePayment',
};

export const resetReducer = (
  state: State | undefined = defaultState,
  action: Action
): State => {
  if (action.type in resetTypeToStoreMap) {
    const stateKey =
      resetTypeToStoreMap[action.type as keyof ResetTypeToStoreMap];
    return {
      ...state,
      [stateKey]: defaultState[stateKey],
    };
  }
  return state;
};

type ApiTypeToStoreMap = Record<ApiAction['type'], keyof State>;
const apiTypeToStoreMap: ApiTypeToStoreMap = {
  fetchProfile: 'profile',
  fetchToken: 'token',
  fetchPlans: 'plans',
  fetchSubscriptions: 'subscriptions',
  fetchCustomer: 'customer',
  createSubscription: 'createSubscription',
  updateSubscriptionPlan: 'updateSubscriptionPlan',
  cancelSubscription: 'cancelSubscription',
  reactivateSubscription: 'reactivateSubscription',
  updatePayment: 'updatePayment',
};

const apiTypes = Object.keys(apiTypeToStoreMap);

export const apiReducer = (
  state: State | undefined = defaultState,
  action: Action
): State => {
  for (const apiType of apiTypes) {
    const typePrefix = `${apiType}_`;
    if (action.type.startsWith(typePrefix)) {
      const stateKey = apiTypeToStoreMap[apiType as keyof ApiTypeToStoreMap];
      switch (action.type as string) {
        case `${typePrefix}${PromiseActionType.Pending}`:
          return {
            ...state,
            [stateKey]: { error: null, loading: true, result: null },
          };
        case `${typePrefix}${PromiseActionType.Fulfilled}`:
          return {
            ...state,
            [stateKey]: { error: null, loading: true, result: action.payload },
          };
        case `${typePrefix}${PromiseActionType.Rejected}`:
          return {
            ...state,
            [stateKey]: { error: action.payload, loading: true, result: null },
          };
      }
    }
  }
  return state;
};

export function fetchDefault<T = any, E = any>(
  defaultResult: T | null = null
): FetchState<T, E> {
  // HACK: Typescript seems to hate `result: defaultResult` when it's null,
  // even though that results in a valid FetchResult type
  return defaultResult === null
    ? {
        error: null,
        loading: false,
        result: null,
      }
    : {
        error: null,
        loading: false,
        result: defaultResult,
      };
}

export function reduceReducers(
  initialState: State,
  ...reducers: Reducer[]
): Reducer {
  return (prevState: State | undefined = initialState, action: Action) => {
    const startingState = prevState || initialState;
    return reducers.reduce(
      (newState, reducer) => reducer(newState, action),
      startingState
    );
  };
}

export default reduceReducers(defaultState, resetReducer, apiReducer);
