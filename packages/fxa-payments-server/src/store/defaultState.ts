import { APIError } from '../lib/apiClient';

import {
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

export default {
  customer: uninitializedFetch<Customer, APIError>(),
  plans: uninitializedFetch<Array<Plan>, APIError>(),
  profile: uninitializedFetch<Profile, APIError>(),
  subscriptions: uninitializedFetch<Array<Subscription>>(),
  token: uninitializedFetch<Token>(),
  cancelSubscription: uninitializedFetch<Subscription>(),
  reactivateSubscription: uninitializedFetch<any>(),
  createSubscription: uninitializedFetch<
    CreateSubscriptionResult,
    CreateSubscriptionError
  >(),
  updateSubscriptionPlan: uninitializedFetch<
    UpdateSubscriptionPlanResult,
    APIError
  >(),
  updatePayment: uninitializedFetch<any>(),
};

// Utility to construct an uninitialized FetchState with type annotations
// for future fetches
function uninitializedFetch<T = any, E = any>(): FetchState<T, E> {
  return {
    error: null,
    loading: false,
    result: null,
  };
}
