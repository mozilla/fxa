import { actions } from './actions';
import { Plan } from './types';
import { FunctionWithIgnoredReturn } from '../lib/types';
import { PaymentProvider } from '../lib/PaymentProvider';

const {
  fetchProfile,
  fetchPlans,
  fetchCustomer,
  updateSubscriptionPlan,
  cancelSubscription,
  reactivateSubscription,
  fetchSubsequentInvoices,
} = actions;

// TODO: Find another way to handle these errors? Rejected promises result
// in Redux actions dispatched *and* exceptions thrown. We handle the
// actions in the UI, but the exceptions bubble and get caught by dev server
// and testing handlers unless we swallow them.
// See also: https://github.com/pburtchaell/redux-promise-middleware/blob/master/docs/guides/rejected-promises.md
const handleThunkError = (err: any) => {
  // console.warn(err);
};

// Convenience functions to produce action sequences via react-thunk functions
export const fetchCheckoutRouteResources = () => async (dispatch: Function) => {
  await Promise.all([dispatch(fetchPlans())]).catch(handleThunkError);
};

export const fetchProductRouteResources = () => async (dispatch: Function) => {
  await Promise.all([
    dispatch(fetchPlans()),
    dispatch(fetchProfile()),
    dispatch(fetchCustomer()),
  ]).catch(handleThunkError);
};

export const fetchSubscriptionsRouteResources =
  () => async (dispatch: Function) => {
    await Promise.all([
      dispatch(fetchPlans()),
      dispatch(fetchProfile()),
      dispatch(fetchCustomer()),
      dispatch(fetchSubsequentInvoices()),
    ]).catch(handleThunkError);
  };

export const fetchCustomerAndSubscriptions =
  () => async (dispatch: Function) => {
    await Promise.all([dispatch(fetchCustomer())]).catch(handleThunkError);
  };

export const updateSubscriptionPlanAndRefresh =
  (
    subscriptionId: string,
    plan: Plan,
    paymentProvider: PaymentProvider | undefined
  ) =>
  async (dispatch: Function) => {
    try {
      await dispatch(
        updateSubscriptionPlan(subscriptionId, plan, paymentProvider)
      );
      await dispatch(fetchCustomerAndSubscriptions());
    } catch (err) {
      handleThunkError(err);
    }
  };

export const cancelSubscriptionAndRefresh =
  (
    subscriptionId: string,
    plan: Plan,
    paymentProvider: PaymentProvider | undefined,
    promotionCode: string | undefined
  ) =>
  async (dispatch: Function) => {
    try {
      await dispatch(
        cancelSubscription(subscriptionId, plan, paymentProvider, promotionCode)
      );
      await dispatch(fetchCustomerAndSubscriptions());
    } catch (err) {
      handleThunkError(err);
    }
  };

export const reactivateSubscriptionAndRefresh =
  (subscriptionId: string, plan: Plan) =>
  async (dispatch: Function, getState: Function) => {
    try {
      await dispatch(reactivateSubscription(subscriptionId, plan));
      await dispatch(fetchSubsequentInvoices());
      await dispatch(fetchCustomerAndSubscriptions());
    } catch (err) {
      handleThunkError(err);
    }
  };

export const sequences = {
  fetchCheckoutRouteResources,
  fetchProductRouteResources,
  fetchSubscriptionsRouteResources,
  fetchCustomerAndSubscriptions,
  updateSubscriptionPlanAndRefresh,
  cancelSubscriptionAndRefresh,
  reactivateSubscriptionAndRefresh,
};

export type SequencesCollection = typeof sequences;
export type SequencesKey = keyof SequencesCollection;

// Slightly relaxed type for sequences that expects the return value to be
// ignored, which should help for easier mocking in tests & stories.
export type SequenceFunctions = {
  [key in SequencesKey]: FunctionWithIgnoredReturn<SequencesCollection[key]>;
};

export default sequences;
