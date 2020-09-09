export default {
  resetUpdateSubscriptionPlan: () =>
    ({ type: 'resetUpdateSubscriptionPlan' } as const),
  resetCancelSubscription: () => ({ type: 'resetCancelSubscription' } as const),
  resetReactivateSubscription: () =>
    ({ type: 'resetReactivateSubscription' } as const),
} as const;
