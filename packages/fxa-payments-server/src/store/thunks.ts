import {
  fetchProfile,
  fetchPlans,
  fetchSubscriptions,
  fetchCustomer,
  createSubscription,
  cancelSubscription,
  reactivateSubscription,
  updatePayment,
  resetUpdatePayment,
} from './actions';
import { Plan } from './types';

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
    dispatch(fetchSubscriptions()),
  ]).catch(handleThunkError);
};

export const fetchSubscriptionsRouteResources = () => async (
  dispatch: Function
) => {
  await Promise.all([
    dispatch(fetchPlans()),
    dispatch(fetchProfile()),
    dispatch(fetchCustomer()),
    dispatch(fetchSubscriptions()),
  ]).catch(handleThunkError);
};

export const fetchCustomerAndSubscriptions = () => async (
  dispatch: Function
) => {
  await Promise.all([
    dispatch(fetchCustomer()),
    dispatch(fetchSubscriptions()),
  ]).catch(handleThunkError);
};

export const createSubscriptionAndRefresh = (
  paymentToken: string,
  plan: Plan,
  displayName: string
) => async (dispatch: Function) => {
  try {
    await dispatch(createSubscription(paymentToken, plan, displayName));
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
  subscriptionId: string
) => async (dispatch: Function, getState: Function) => {
  try {
    await dispatch(reactivateSubscription(subscriptionId));
    await dispatch(fetchCustomerAndSubscriptions());
  } catch (err) {
    handleThunkError(err);
  }
};

export const updatePaymentAndRefresh = (
  paymentToken: string,
  plan: Plan
) => async (dispatch: Function) => {
  try {
    await dispatch(updatePayment(paymentToken, plan));
    await dispatch(fetchCustomerAndSubscriptions());
    setTimeout(() => dispatch(resetUpdatePayment()), RESET_PAYMENT_DELAY);
  } catch (err) {
    handleThunkError(err);
  }
};
