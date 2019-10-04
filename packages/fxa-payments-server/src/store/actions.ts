// import { Action, ActionCreator, ActionCreators } from './types'

import {
  apiFetchProfile,
  apiFetchPlans,
  apiFetchSubscriptions,
  apiFetchToken,
  apiFetchCustomer,
  apiCreateSubscription,
  apiCancelSubscription,
  apiReactivateSubscription,
  apiUpdatePayment,
} from '../lib/apiClient';

import { Payload, Action } from './types';

function makeActionCreator(type: string, payload: Function): Function {
  return (): Action => ({ type, payload });
}

function makeActionObject(type: string, payload?: Payload): Action {
  return { type, payload };
}

export const fetchProfile = makeActionCreator('fetchProfile', apiFetchProfile);
fetchProfile.toString = () => 'fetchProfile';

export const fetchToken = makeActionCreator('fetchToken', apiFetchToken);
fetchToken.toString = () => 'fetchToken';

export const fetchPlans = makeActionCreator('fetchPlans', apiFetchPlans);
fetchPlans.toString = () => 'fetchPlans';

export const fetchSubscriptions = makeActionCreator(
  'fetchSubscriptions',
  apiFetchSubscriptions
);
fetchSubscriptions.toString = () => 'fetchSubscriptions';

export const fetchCustomer = makeActionCreator(
  'fetchCustomer',
  apiFetchCustomer
);
fetchCustomer.toString = () => 'fetchCustomer';

export const createSubscription = (params: {
  paymentToken: string;
  planId: string;
  displayName: string;
}) => ({
  type: 'createSubscription',
  payload: apiCreateSubscription(params),
});
createSubscription.toString = () => 'createSubscription';

export const cancelSubscription = (subscriptionId: string) => ({
  type: 'cancelSubscription',
  payload: async () => {
    const result = await apiCancelSubscription(subscriptionId);
    // Cancellation response does not include subscriptionId, but we want it.
    return { ...result, subscriptionId };
  },
});
cancelSubscription.toString = () => 'cancelSubscription';

export const reactivateSubscription = (subscriptionId: string) => ({
  type: 'reactivateSubscription',
  payload: apiReactivateSubscription(subscriptionId),
});
reactivateSubscription.toString = () => 'reactivateSubscription';

export const updatePayment = (paymentToken: string) => ({
  type: 'updatePayment',
  payload: apiUpdatePayment(paymentToken),
});
updatePayment.toString = () => 'updatePayment';

export const resetCreateSubscription = (payload?: Payload) =>
  makeActionObject('resetCreateSubscription', payload);
resetCreateSubscription.toString = () => 'resetCreateSubscription';

export const resetCancelSubscription = (payload: Payload) =>
  makeActionObject('resetCancelSubscription', payload);
resetCancelSubscription.toString = () => 'resetCancelSubscription';

export const resetReactivateSubscription = (payload: Payload) =>
  makeActionObject('resetReactivateSubscription', payload);
resetReactivateSubscription.toString = () => 'resetReactivateSubscription';

export const resetUpdatePayment = (payload?: Payload) =>
  makeActionObject('resetUpdatePayment', payload);
resetUpdatePayment.toString = () => 'resetUpdatePayment';
