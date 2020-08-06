import { actions } from './actions';
import { Plan } from './types';
import { FunctionWithIgnoredReturn } from '../lib/types';

const {
  fetchProfile,
  fetchPlans,
  fetchCustomer,
  createSubscription,
  updateSubscriptionPlan,
  cancelSubscription,
  reactivateSubscription,
  updatePayment,
  resetUpdatePayment,
} = actions;

// This is the length fo time that alert bar is displayed before
// auto-dismissing, in milliseconds. It should be long enough for the user to
// read the message.
const RESET_PAYMENT_DELAY = 5000;

// TODO: Find another way to handle these errors? Rejected promises result
// in Redux actions dispatched *and* exceptions thrown. We handle the
// actions in the UI, but the exceptions bubble and get caught by dev server
// and testing handlers unless we swallow them.
// See also: https://github.com/pburtchaell/redux-promise-middleware/blob/master/docs/guides/rejected-promises.md
const handleThunkError = (err: any) => {
  // console.warn(err);
};

// Convenience functions to produce action sequences via react-thunk functions
export const fetchProductRouteResources = () => async (dispatch: Function) => {
  await Promise.all([
    dispatch(fetchPlans()),
    dispatch(fetchProfile()),
    dispatch(fetchCustomer()),
  ]).catch(handleThunkError);
};

export const fetchSubscriptionsRouteResources = () => async (
  dispatch: Function
) => {
  await Promise.all([
    dispatch(fetchPlans()),
    dispatch(fetchProfile()),
    dispatch(fetchCustomer()),
  ]).catch(handleThunkError);
};

export const fetchCustomerAndSubscriptions = () => async (
  dispatch: Function
) => {
  await Promise.all([dispatch(fetchCustomer())]).catch(handleThunkError);
};

export const createSubscriptionAndRefresh = (
  paymentToken: string,
  plan: Plan,
  displayName: string,
  nonce: string
) => async (dispatch: Function) => {
  try {
    await dispatch(createSubscription(paymentToken, plan, displayName, nonce));
    await dispatch(fetchCustomerAndSubscriptions());
  } catch (err) {
    handleThunkError(err);
  }
};

export const updateSubscriptionPlanAndRefresh = (
  subscriptionId: string,
  plan: Plan
) => async (dispatch: Function) => {
  try {
    await dispatch(updateSubscriptionPlan(subscriptionId, plan));
    await dispatch(fetchCustomerAndSubscriptions());
  } catch (err) {
    handleThunkError(err);
  }
};

export const cancelSubscriptionAndRefresh = (
  subscriptionId: string,
  plan: Plan
) => async (dispatch: Function, getState: Function) => {
  try {
    await dispatch(cancelSubscription(subscriptionId, plan));
    await dispatch(fetchCustomerAndSubscriptions());
  } catch (err) {
    handleThunkError(err);
  }
};

export const reactivateSubscriptionAndRefresh = (
  subscriptionId: string,
  plan: Plan
) => async (dispatch: Function, getState: Function) => {
  try {
    await dispatch(reactivateSubscription(subscriptionId, plan));
    await dispatch(fetchCustomerAndSubscriptions());
  } catch (err) {
    handleThunkError(err);
  }
};

export const updatePaymentAndRefresh = (paymentToken: string) => async (
  dispatch: Function
) => {
  try {
    await dispatch(updatePayment(paymentToken));
    await dispatch(fetchCustomerAndSubscriptions());
    setTimeout(() => dispatch(resetUpdatePayment()), RESET_PAYMENT_DELAY);
  } catch (err) {
    handleThunkError(err);
  }
};

export const sequences = {
  fetchProductRouteResources,
  fetchSubscriptionsRouteResources,
  fetchCustomerAndSubscriptions,
  createSubscriptionAndRefresh,
  updateSubscriptionPlanAndRefresh,
  cancelSubscriptionAndRefresh,
  reactivateSubscriptionAndRefresh,
  updatePaymentAndRefresh,
};

export type SequencesCollection = typeof sequences;
export type SequencesKey = keyof SequencesCollection;

// Slightly relaxed type for sequences that expects the return value to be
// ignored, which should help for easier mocking in tests & stories.
export type SequenceFunctions = {
  [key in SequencesKey]: FunctionWithIgnoredReturn<SequencesCollection[key]>;
};

export default sequences;
