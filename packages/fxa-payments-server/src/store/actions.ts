// import { Action, ActionCreator, ActionCreators } from './types'

import {
  apiFetchProfile,
  apiFetchPlans,
  apiFetchSubscriptions,
  apiFetchToken,
  apiFetchCustomer,
  apiCreateSubscription,
  apiUpdateSubscriptionPlan,
  apiCancelSubscription,
  apiReactivateSubscription,
  apiUpdatePayment,
} from '../lib/apiClient';

import { Payload, Action, Plan } from './types';

function makeActionCreator(type: string, payload?: Function) {
  return () => ({ type, payload } as const);
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

export const createSubscription = (
  paymentToken: string,
  plan: Plan,
  displayName: string
) => ({
  type: 'createSubscription',
  meta: { plan },
  payload: apiCreateSubscription({
    paymentToken,
    displayName,
    planId: plan.plan_id,
  }),
});
createSubscription.toString = () => 'createSubscription';

export const updateSubscriptionPlan = (subscriptionId: string, plan: Plan) => ({
  type: 'updateSubscriptionPlan',
  meta: { subscriptionId, plan },
  payload: apiUpdateSubscriptionPlan({
    subscriptionId,
    planId: plan.plan_id,
  }),
});
updateSubscriptionPlan.toString = () => 'updateSubscriptionPlan';

export const cancelSubscription = (subscriptionId: string, plan: Plan) => ({
  type: 'cancelSubscription',
  meta: { plan },
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

export const updatePayment = (paymentToken: string, plan: Plan) => ({
  type: 'updatePayment',
  meta: { plan },
  payload: apiUpdatePayment(paymentToken),
});
updatePayment.toString = () => 'updatePayment';

export const resetCreateSubscription = () =>
  makeActionObject('resetCreateSubscription');
resetCreateSubscription.toString = () => 'resetCreateSubscription';

export const resetUpdateSubscriptionPlan = () =>
  makeActionObject('resetUpdateSubscriptionPlan');
resetUpdateSubscriptionPlan.toString = () => 'resetUpdateSubscriptionPlan';

export const resetCancelSubscription = () =>
  makeActionObject('resetCancelSubscription');
resetCancelSubscription.toString = () => 'resetCancelSubscription';

export const resetReactivateSubscription = () =>
  makeActionObject('resetReactivateSubscription');
resetReactivateSubscription.toString = () => 'resetReactivateSubscription';

export const resetUpdatePayment = () => makeActionObject('resetUpdatePayment');
resetUpdatePayment.toString = () => 'resetUpdatePayment';

export const createSubscriptionMounted = (plan: Plan) =>
  makeActionObject('createSubscriptionMounted', { plan });
createSubscriptionMounted.toString = () => 'createSubscriptionMounted';

export const createSubscriptionEngaged = (plan: Plan) =>
  makeActionObject('createSubscriptionEngaged', { plan });
createSubscriptionEngaged.toString = () => 'createSubscriptionEngaged';

export const manageSubscriptionsMounted = () =>
  makeActionObject('manageSubscriptionsMounted');
manageSubscriptionsMounted.toString = () => 'manageSubscriptionsMounted';

export const manageSubscriptionsEngaged = () =>
  makeActionObject('manageSubscriptionsEngaged');
manageSubscriptionsEngaged.toString = () => 'manageSubscriptionsEngaged';

export const updatePaymentMounted = (plan: Plan) =>
  makeActionObject('updatePaymentMounted', { plan });
updatePaymentMounted.toString = () => 'updatePaymentMounted';

export const updatePaymentEngaged = (plan: Plan) =>
  makeActionObject('updatePaymentEngaged', { plan });
updatePaymentEngaged.toString = () => 'updatePaymentEngaged';

export const cancelSubscriptionMounted = (plan: Plan) =>
  makeActionObject('cancelSubscriptionMounted', { plan });
cancelSubscriptionMounted.toString = () => 'cancelSubscriptionMounted';

export const cancelSubscriptionEngaged = (plan: Plan) =>
  makeActionObject('cancelSubscriptionEngaged', { plan });
cancelSubscriptionEngaged.toString = () => 'cancelSubscriptionEngaged';
