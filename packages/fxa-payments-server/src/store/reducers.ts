import typeToReducer from 'type-to-reducer';
import { fetchReducer, setStatic, fetchDefault } from './utils';
import { ReducersMapObject } from 'redux';

import { APIError } from '../lib/apiClient';
import {
  Subscription,
  Plan,
  Profile,
  Token,
  Customer,
  CreateSubscriptionResult,
  CreateSubscriptionError,
  UpdateSubscriptionPlanResult,
} from './types';

import {
  fetchProfile,
  fetchToken,
  fetchPlans,
  fetchSubscriptions,
  fetchCustomer,
  createSubscription,
  updateSubscriptionPlan,
  cancelSubscription,
  reactivateSubscription,
  updatePayment,
  resetCreateSubscription,
  resetUpdateSubscriptionPlan,
  resetCancelSubscription,
  resetReactivateSubscription,
  resetUpdatePayment,
} from './actions';

export const defaultState = {
  api: {
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
    updateSubscriptionPlan:  fetchDefault<
      UpdateSubscriptionPlanResult,
      APIError
    >(),
    updatePayment: fetchDefault<any>(),
  },
};

export const reducers = {
  api: typeToReducer(
    {
      [fetchProfile.toString()]: fetchReducer('profile'),
      [fetchPlans.toString()]: fetchReducer('plans'),
      [fetchSubscriptions.toString()]: fetchReducer('subscriptions'),
      [fetchToken.toString()]: fetchReducer('token'),
      [fetchCustomer.toString()]: fetchReducer('customer'),
      [createSubscription.toString()]: fetchReducer('createSubscription'),
      [updateSubscriptionPlan.toString()]: fetchReducer(
        'updateSubscriptionPlan'
      ),
      [cancelSubscription.toString()]: fetchReducer('cancelSubscription'),
      [reactivateSubscription.toString()]: fetchReducer(
        'reactivateSubscription'
      ),
      [updatePayment.toString()]: fetchReducer('updatePayment'),
      [resetCreateSubscription.toString()]: setStatic({
        createSubscription: defaultState.api.createSubscription,
      }),
      [resetUpdateSubscriptionPlan.toString()]: setStatic({
        updateSubscriptionPlan: defaultState.api.updateSubscriptionPlan,
      }),
      [resetCancelSubscription.toString()]: setStatic({
        cancelSubscription: defaultState.api.cancelSubscription,
      }),
      [resetReactivateSubscription.toString()]: setStatic({
        reactivateSubscription: defaultState.api.reactivateSubscription,
      }),
      [resetUpdatePayment.toString()]: setStatic({
        updatePayment: defaultState.api.updatePayment,
      }),
    },
    defaultState.api
  ),
} as ReducersMapObject<typeof defaultState, any>;
