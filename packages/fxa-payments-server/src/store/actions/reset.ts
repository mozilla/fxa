export default {
  resetCreateSubscription: () => ({ type: 'resetCreateSubscription' } as const),
  resetUpdateSubscriptionPlan: () =>
    ({ type: 'resetUpdateSubscriptionPlan' } as const),
  resetCancelSubscription: () => ({ type: 'resetCancelSubscription' } as const),
  resetReactivateSubscription: () =>
    ({ type: 'resetReactivateSubscription' } as const),
  resetUpdatePayment: () => ({ type: 'resetUpdatePayment' } as const),
} as const;
