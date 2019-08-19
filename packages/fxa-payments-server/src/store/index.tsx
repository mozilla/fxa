import { createStore, combineReducers, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createActions } from 'redux-actions';
import ReduxThunk, { ThunkMiddleware } from 'redux-thunk';
import { createPromise as promiseMiddleware } from 'redux-promise-middleware';
import typeToReducer from 'type-to-reducer';

import { config } from '../lib/config';

import {
  apiGet,
  apiDelete,
  apiPost,
  fetchDefault,
  fetchReducer,
  setStatic,
  mapToObject,
} from './utils';

import { State, Action, Selectors, Plan } from './types';

const RESET_PAYMENT_DELAY = 2000;

export const defaultState: State = {
  api: {
    cancelSubscription: fetchDefault(null),
    reactivateSubscription: fetchDefault(null),
    createSubscription: fetchDefault(null),
    customer: fetchDefault(null),
    plans: fetchDefault(null),
    profile: fetchDefault(null),
    updatePayment: fetchDefault(null),
    subscriptions: fetchDefault(null),
    token: fetchDefault(null),
  },
};

export const selectors: Selectors = {
  profile: state => state.api.profile,
  token: state => state.api.token,
  subscriptions: state => state.api.subscriptions,
  plans: state => state.api.plans,
  customer: state => state.api.customer,
  createSubscriptionStatus: state => state.api.createSubscription,
  cancelSubscriptionStatus: state => state.api.cancelSubscription,
  reactivateSubscriptionStatus: state => state.api.reactivateSubscription,
  updatePaymentStatus: state => state.api.updatePayment,

  lastError: state =>
    Object.entries(state.api)
      .filter(([k, v]) => v && !!v.error)
      .map(([k, v]) => [k, v.error])[0],

  isLoading: state => Object.values(state.api).some(v => v && !!v.loading),

  plansByProductId: state => (productId: string): Array<Plan> => {
    const plans = selectors.plans(state).result || [];
    return productId
      ? plans.filter((plan: Plan) => plan.product_id === productId)
      : plans;
  },

  customerSubscriptions: state => {
    const customer = selectors.customer(state);
    if (customer && customer.result && customer.result.subscriptions) {
      return customer.result.subscriptions;
    }
    return [];
  },
};

export const actions = createActions(
  {
    fetchProfile: (accessToken: string) =>
      apiGet(accessToken, `${config.servers.profile.url}/v1/profile`),
    fetchPlans: (accessToken: string) =>
      apiGet(
        accessToken,
        `${config.servers.auth.url}/v1/oauth/subscriptions/plans`
      ),
    fetchSubscriptions: (accessToken: string) =>
      apiGet(
        accessToken,
        `${config.servers.auth.url}/v1/oauth/subscriptions/active`
      ),
    fetchToken: (accessToken: string) =>
      apiPost(accessToken, `${config.servers.oauth.url}/v1/introspect`, {
        token: accessToken,
      }),
    fetchCustomer: (accessToken: string) =>
      apiGet(
        accessToken,
        `${config.servers.auth.url}/v1/oauth/subscriptions/customer`
      ),
    createSubscription: (
      accessToken: string,
      params: {
        paymentToken: string;
        planId: string;
        displayName: string;
      }
    ) =>
      apiPost(
        accessToken,
        `${config.servers.auth.url}/v1/oauth/subscriptions/active`,
        params
      ),
    cancelSubscription: (accessToken: string, subscriptionId: string) =>
      apiDelete(
        accessToken,
        `${config.servers.auth.url}/v1/oauth/subscriptions/active/${subscriptionId}`
      ).then(result => {
        // HACK: cancellation response does not include subscriptionId, but we want it.
        return { ...result, subscriptionId };
      }),
    reactivateSubscription: async (
      accessToken: string,
      subscriptionId: string
    ) =>
      apiPost(
        accessToken,
        `${config.servers.auth.url}/v1/oauth/subscriptions/reactivate`,
        { subscriptionId }
      ),
    updatePayment: (
      accessToken: string,
      { paymentToken }: { paymentToken: string }
    ) =>
      apiPost(
        accessToken,
        `${config.servers.auth.url}/v1/oauth/subscriptions/updatePayment`,
        { paymentToken }
      ),
  },
  'updateApiData',
  'resetCreateSubscription',
  'resetCancelSubscription',
  'resetReactivateSubscription',
  'resetUpdatePayment'
);

// TODO: Find another way to handle these errors? Rejected promises result
// in Redux actions dispatched *and* exceptions thrown. We handle the
// actions in the UI, but the exceptions bubble and get caught by dev server
// and testing handlers unless we swallow them.
// See also: https://github.com/pburtchaell/redux-promise-middleware/blob/master/docs/guides/rejected-promises.md
const handleThunkError = (err: any) => {
  // console.warn(err);
};

// Convenience functions to produce action sequences via react-thunk functions
export const thunks = {
  fetchProductRouteResources: (accessToken: string) => async (
    dispatch: Function
  ) => {
    await Promise.all([
      dispatch(actions.fetchPlans(accessToken)),
      dispatch(actions.fetchProfile(accessToken)),
      dispatch(actions.fetchCustomer(accessToken)),
      dispatch(actions.fetchSubscriptions(accessToken)),
    ]).catch(handleThunkError);
  },

  fetchSubscriptionsRouteResources: (accessToken: string) => async (
    dispatch: Function
  ) => {
    await Promise.all([
      dispatch(actions.fetchPlans(accessToken)),
      dispatch(actions.fetchProfile(accessToken)),
      dispatch(actions.fetchCustomer(accessToken)),
      dispatch(actions.fetchSubscriptions(accessToken)),
    ]).catch(handleThunkError);
  },

  fetchCustomerAndSubscriptions: (accessToken: string) => async (
    dispatch: Function
  ) => {
    await Promise.all([
      dispatch(actions.fetchCustomer(accessToken)),
      dispatch(actions.fetchSubscriptions(accessToken)),
    ]).catch(handleThunkError);
  },

  createSubscriptionAndRefresh: (
    accessToken: string,
    params: {
      paymentToken: string;
      planId: string;
      displayName: string;
    }
  ) => async (dispatch: Function) => {
    try {
      await dispatch(actions.createSubscription(accessToken, params));
      await dispatch(thunks.fetchCustomerAndSubscriptions(accessToken));
    } catch (err) {
      handleThunkError(err);
    }
  },

  cancelSubscriptionAndRefresh: (
    accessToken: string,
    subscriptionId: object
  ) => async (dispatch: Function, getState: Function) => {
    try {
      await dispatch(actions.cancelSubscription(accessToken, subscriptionId));
      await dispatch(thunks.fetchCustomerAndSubscriptions(accessToken));
    } catch (err) {
      handleThunkError(err);
    }
  },

  reactivateSubscriptionAndRefresh: (
    accessToken: string,
    subscriptionId: object
  ) => async (dispatch: Function, getState: Function) => {
    try {
      await dispatch(
        actions.reactivateSubscription(accessToken, subscriptionId)
      );
      await dispatch(thunks.fetchCustomerAndSubscriptions(accessToken));
    } catch (err) {
      handleThunkError(err);
    }
  },

  updatePaymentAndRefresh: (accessToken: string, params: object) => async (
    dispatch: Function
  ) => {
    try {
      await dispatch(actions.updatePayment(accessToken, params));
      await dispatch(thunks.fetchCustomerAndSubscriptions(accessToken));
      setTimeout(
        () => dispatch(actions.resetUpdatePayment()),
        RESET_PAYMENT_DELAY
      );
    } catch (err) {
      handleThunkError(err);
    }
  },
};

export const reducers = {
  api: typeToReducer(
    {
      [actions.fetchProfile.toString()]: fetchReducer('profile'),
      [actions.fetchPlans.toString()]: fetchReducer('plans'),
      [actions.fetchSubscriptions.toString()]: fetchReducer('subscriptions'),
      [actions.fetchToken.toString()]: fetchReducer('token'),
      [actions.fetchCustomer.toString()]: fetchReducer('customer'),
      [actions.createSubscription.toString()]: fetchReducer(
        'createSubscription'
      ),
      [actions.cancelSubscription.toString()]: fetchReducer(
        'cancelSubscription'
      ),
      [actions.reactivateSubscription.toString()]: fetchReducer(
        'reactivateSubscription'
      ),
      [actions.updatePayment.toString()]: fetchReducer('updatePayment'),
      [actions.updateApiData.toString()]: (state, { payload }) => ({
        ...state,
        ...payload,
      }),
      [actions.resetCreateSubscription.toString()]: setStatic({
        createSubscription: fetchDefault(null),
      }),
      [actions.resetCancelSubscription.toString()]: setStatic({
        cancelSubscription: fetchDefault(null),
      }),
      [actions.resetReactivateSubscription.toString()]: setStatic({
        reactivateSubscription: fetchDefault(null),
      }),
      [actions.resetUpdatePayment.toString()]: setStatic({
        updatePayment: fetchDefault(null),
      }),
    },
    defaultState.api
  ),
};

export const selectorsFromState = (...names: Array<string>) => (state: State) =>
  mapToObject(names, (name: string) => selectors[name](state));

export const pickActions = (...names: Array<string>) =>
  mapToObject(names, (name: string) => actions[name]);

export const createAppStore = (initialState?: State, enhancers?: Array<any>) =>
  createStore<State, Action, unknown, unknown>(
    combineReducers(reducers),
    initialState,
    composeWithDevTools(
      applyMiddleware(
        ReduxThunk as ThunkMiddleware<State, Action>,
        promiseMiddleware()
      ),
      ...(enhancers || [])
    )
  );
