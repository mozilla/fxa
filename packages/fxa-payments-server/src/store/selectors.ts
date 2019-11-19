import { Plan } from './types';
import { State } from './state';

export const profile = (state: State) => state.profile;
export const token = (state: State) => state.token;
export const subscriptions = (state: State) => state.subscriptions;
export const plans = (state: State) => state.plans;
export const customer = (state: State) => state.customer;

export const createSubscriptionStatus = (state: State) =>
  state.createSubscription;
export const updateSubscriptionPlanStatus = (state: State) =>
  state.updateSubscriptionPlan;
export const cancelSubscriptionStatus = (state: State) =>
  state.cancelSubscription;
export const reactivateSubscriptionStatus = (state: State) =>
  state.reactivateSubscription;
export const updatePaymentStatus = (state: State) => state.updatePayment;

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
