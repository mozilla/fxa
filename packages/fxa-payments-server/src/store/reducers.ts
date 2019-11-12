import typeToReducer from 'type-to-reducer';
import { fetchReducer, setStatic, fetchDefault } from './utils';
import { State } from './types';

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

export const defaultState: State = {
  api: {
    cancelSubscription: fetchDefault(null),
    reactivateSubscription: fetchDefault(null),
    createSubscription: fetchDefault(null),
    updateSubscriptionPlan: fetchDefault(null),
    customer: fetchDefault(null),
    plans: fetchDefault(null),
    profile: fetchDefault(null),
    updatePayment: fetchDefault(null),
    subscriptions: fetchDefault(null),
    token: fetchDefault(null),
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
        createSubscription: fetchDefault(null),
      }),
      [resetUpdateSubscriptionPlan.toString()]: setStatic({
        updateSubscriptionPlan: fetchDefault(null),
      }),
      [resetCancelSubscription.toString()]: setStatic({
        cancelSubscription: fetchDefault(null),
      }),
      [resetReactivateSubscription.toString()]: setStatic({
        reactivateSubscription: fetchDefault(null),
      }),
      [resetUpdatePayment.toString()]: setStatic({
        updatePayment: fetchDefault(null),
      }),
    },
    defaultState.api
  ),
};
