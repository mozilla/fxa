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

import { Plan } from './types';

// https://gist.github.com/schettino/c8bf5062ef99993ce32514807ffae849#gistcomment-2906407
export type ActionType<
  TActions extends { [key: string]: (...args: any) => any }
> = ReturnType<TActions[keyof TActions]>;

export const apiActions = {
  fetchProfile: () =>
    ({ type: 'fetchProfile', payload: apiFetchProfile() } as const),
  fetchToken: () => ({ type: 'fetchToken', payload: apiFetchToken() } as const),
  fetchPlans: () => ({ type: 'fetchPlans', payload: apiFetchPlans() } as const),
  fetchSubscriptions: () =>
    ({ type: 'fetchSubscriptions', payload: apiFetchSubscriptions() } as const),
  fetchCustomer: () =>
    ({ type: 'fetchCustomer', payload: apiFetchCustomer() } as const),
  createSubscription: (paymentToken: string, plan: Plan, displayName: string) =>
    ({
      type: 'createSubscription',
      meta: { plan },
      payload: apiCreateSubscription({
        paymentToken,
        displayName,
        planId: plan.plan_id,
      }),
    } as const),
  updateSubscriptionPlan: (subscriptionId: string, plan: Plan) =>
    ({
      type: 'updateSubscriptionPlan',
      meta: { subscriptionId, plan },
      payload: apiUpdateSubscriptionPlan({
        subscriptionId,
        planId: plan.plan_id,
      }),
    } as const),
  cancelSubscription: (subscriptionId: string, plan: Plan) =>
    ({
      type: 'cancelSubscription',
      meta: { plan },
      payload: async () => {
        const result = await apiCancelSubscription(subscriptionId);
        // Cancellation response does not include subscriptionId, but we want it.
        return { ...result, subscriptionId };
      },
    } as const),
  reactivateSubscription: (subscriptionId: string) =>
    ({
      type: 'reactivateSubscription',
      payload: apiReactivateSubscription(subscriptionId),
    } as const),
  updatePayment: (paymentToken: string, plan: Plan) =>
    ({
      type: 'updatePayment',
      meta: { plan },
      payload: apiUpdatePayment(paymentToken),
    } as const),
} as const;

export type ApiAction = ActionType<typeof apiActions>;

export const resetActions = {
  resetCreateSubscription: () => ({ type: 'resetCreateSubscription' } as const),
  resetUpdateSubscriptionPlan: () =>
    ({ type: 'resetUpdateSubscriptionPlan' } as const),
  resetCancelSubscription: () => ({ type: 'resetCancelSubscription' } as const),
  resetReactivateSubscription: () =>
    ({ type: 'resetReactivateSubscription' } as const),
  resetUpdatePayment: () => ({ type: 'resetUpdatePayment' } as const),
} as const;

export type ResetAction = ActionType<typeof resetActions>;

export const metricsActions = {
  createSubscriptionMounted: (plan: Plan) =>
    ({ type: 'createSubscriptionMounted', payload: { plan } } as const),
  createSubscriptionEngaged: (plan: Plan) =>
    ({ type: 'createSubscriptionEngaged', payload: { plan } } as const),
  manageSubscriptionsMounted: () =>
    ({ type: 'manageSubscriptionsMounted' } as const),
  manageSubscriptionsEngaged: () =>
    ({ type: 'manageSubscriptionsEngaged' } as const),
  updatePaymentMounted: (plan: Plan) =>
    ({ type: 'updatePaymentMounted', payload: { plan } } as const),
  updatePaymentEngaged: (plan: Plan) =>
    ({ type: 'updatePaymentEngaged', payload: { plan } } as const),
  cancelSubscriptionMounted: (plan: Plan) =>
    ({ type: 'cancelSubscriptionMounted', payload: { plan } } as const),
  cancelSubscriptionEngaged: (plan: Plan) =>
    ({ type: 'cancelSubscriptionEngaged', payload: { plan } } as const),
} as const;

export type MetricsAction = ActionType<typeof metricsActions>;

export type Action = (ApiAction | ResetAction | MetricsAction) & {
  payload?: any;
};

export const actions = {
  ...apiActions,
  ...resetActions,
  ...metricsActions,
};

export default actions;
