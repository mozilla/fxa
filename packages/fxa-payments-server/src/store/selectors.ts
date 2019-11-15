import { Plan, State } from './types';

export const profile = (state: State) => state.api.profile;
export const token = (state: State) => state.api.token;
export const subscriptions = (state: State) => state.api.subscriptions;
export const plans = (state: State) => state.api.plans;
export const customer = (state: State) => state.api.customer;

export const createSubscriptionStatus = (state: State) =>
  state.api.createSubscription;
export const updateSubscriptionPlanStatus = (state: State) =>
  state.api.updateSubscriptionPlan;
export const cancelSubscriptionStatus = (state: State) =>
  state.api.cancelSubscription;
export const reactivateSubscriptionStatus = (state: State) =>
  state.api.reactivateSubscription;
export const updatePaymentStatus = (state: State) => state.api.updatePayment;

export const plansByProductId = (state: State) => (
  productId: string
): Array<Plan> => {
  const fetchedPlans = plans(state).result || [];
  return fetchedPlans.filter(plan => plan.product_id === productId);
};

export const customerSubscriptions = (state: State) => {
  const fetchedCustomer = customer(state);
  if (
    fetchedCustomer &&
    fetchedCustomer.result &&
    fetchedCustomer.result.subscriptions
  ) {
    return fetchedCustomer.result.subscriptions;
  }
  return null;
};
