import { State } from '../state';
import { ActionType as PromiseActionType } from 'redux-promise-middleware';
import { Action, ApiAction } from '../actions';

// This maps action types (and promise middleware type prefixes) to store
// keys where respective fetch state will be managed. Add new APIs here.
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

/*
  For quick access in the reducer, build a flat map of all promise states
  for all API action types to corresponding state keys, e.g.
  {
    fetchProfile_PENDING:
      { storeKey: 'profile', promiseType: 'PENDING' },
    fetchProfile_FULFILLED:
      { storeKey: 'profile', promiseType: 'FULFILLED' },
    fetchProfile_REJECTED:
      { storeKey: 'profile', promiseType: 'REJECTED' },
    ...
  }
*/
type ApiPromiseTypeToStoreMap = Record<
  string,
  { promiseType: PromiseActionType; stateKey: keyof State }
>;
const apiPromiseTypeToStoreMap: ApiPromiseTypeToStoreMap = {};
for (const apiType in apiTypeToStoreMap) {
  for (const promiseType of [
    PromiseActionType.Pending,
    PromiseActionType.Fulfilled,
    PromiseActionType.Rejected,
  ]) {
    const stateKey = apiTypeToStoreMap[apiType as keyof ApiTypeToStoreMap];
    apiPromiseTypeToStoreMap[`${apiType}_${promiseType}`] = {
      promiseType,
      stateKey,
    };
  }
}

export default (state: State, action: Action): State => {
  if (action.type in apiPromiseTypeToStoreMap) {
    // promise-middleware actions are close enough to ApiAction type
    const payload = (action as ApiAction).payload;
    const { promiseType, stateKey } = apiPromiseTypeToStoreMap[action.type];
    switch (promiseType) {
      case PromiseActionType.Pending:
        return {
          ...state,
          [stateKey]: { error: null, loading: true, result: null },
        };
      case PromiseActionType.Fulfilled:
        return {
          ...state,
          [stateKey]: { error: null, loading: false, result: payload },
        };
      case PromiseActionType.Rejected:
        return {
          ...state,
          [stateKey]: { error: payload, loading: false, result: null },
        };
    }
  }
  return state;
};
