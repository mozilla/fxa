import { Plan } from './types';
import { State } from './state';

export const selectors = {
  profile: (state: State) => state.profile,
  token: (state: State) => state.token,
  subscriptions: (state: State) => state.subscriptions,
  plans: (state: State) => state.plans,
  customer: (state: State) => state.customer,

  createSubscriptionStatus: (state: State) => state.createSubscription,
  updateSubscriptionPlanStatus: (state: State) => state.updateSubscriptionPlan,
  cancelSubscriptionStatus: (state: State) => state.cancelSubscription,
  reactivateSubscriptionStatus: (state: State) => state.reactivateSubscription,
  updatePaymentStatus: (state: State) => state.updatePayment,

  plansByProductId: (state: State) => (productId: string): Array<Plan> => {
    const fetchedPlans = selectors.plans(state).result || [];
    return fetchedPlans.filter((plan) => plan.product_id === productId);
  },

  customerSubscriptions: (state: State) => {
    const fetchedCustomer = selectors.customer(state);
    if (
      fetchedCustomer &&
      fetchedCustomer.result &&
      fetchedCustomer.result.subscriptions
    ) {
      return fetchedCustomer.result.subscriptions;
    }
    return null;
  },
};

export type SelectorsCollection = typeof selectors;
export type SelectorsKey = keyof SelectorsCollection;
export type SelectorReturns = {
  [key in SelectorsKey]: ReturnType<SelectorsCollection[key]>;
};

export default selectors;
