import { Plan } from '../types';

export default {
  createSubscriptionMounted: (plan: Plan) =>
    ({ type: 'createSubscriptionMounted', payload: { plan } } as const),
  createSubscriptionEngaged: (plan: Plan) =>
    ({ type: 'createSubscriptionEngaged', payload: { plan } } as const),
  updateSubscriptionPlanMounted: (plan: Plan) =>
    ({ type: 'createSubscriptionMounted', payload: { plan } } as const),
  updateSubscriptionPlanEngaged: (plan: Plan) =>
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
