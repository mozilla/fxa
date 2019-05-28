import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import { createActions } from 'redux-actions';
import ReduxThunk from 'redux-thunk';
import { createPromise as promiseMiddleware } from 'redux-promise-middleware';
import typeToReducer from 'type-to-reducer';

import config from '../lib/config';

import {
  apiGet,
  apiDelete,
  apiPost,
  fetchDefault,
  fetchReducer,
  setStatic,
  mapToObject,
} from './utils';

import {
  State,
  Selectors,
  ActionCreators,
  Plan,
} from './types';

const RESET_PAYMENT_DELAY = 2000;

export const defaultState: State = {
  api: {
    cancelSubscription: fetchDefault(false),
    createSubscription: fetchDefault(false),
    customer: fetchDefault({}),
    plans: fetchDefault([]),
    profile: fetchDefault({}),
    updatePayment: fetchDefault(false),
    subscriptions: fetchDefault([]),
    token: fetchDefault({}),  
  }
};

export const selectors: Selectors = {
  profile: state => state.api.profile,
  token: state => state.api.token,
  subscriptions: state => state.api.subscriptions,
  plans: state => state.api.plans,
  customer: state => state.api.customer,
  createSubscriptionStatus: state => state.api.createSubscription,
  cancelSubscriptionStatus: state => state.api.cancelSubscription,
  updatePaymentStatus: state => state.api.updatePayment,

  lastError: state => Object
    .entries(state.api)
    .filter(([k, v]) => v && !! v.error)
    .map(([k, v]) => [k, v.error])[0],

  isLoading: state => Object
    .values(state.api)
    .some(v => v && !! v.loading),

  plansByProductId: state => (productId: string) => {
    const plans = selectors.plans(state).result || [];
    return productId
      ? plans.filter((plan: Plan) => plan.product_id === productId)
      : plans;
  },

  customerSubscriptions: state => {
    const customer = selectors.customer(state);
    return ! customer || ! customer.result
      ? []
      : customer.result.subscriptions;
  },
};

export const actions: ActionCreators = {
  ...createActions(
    {
      fetchProfile: accessToken =>
        apiGet(accessToken, `${config.PROFILE_API_ROOT}/profile`),
      fetchPlans: accessToken =>
        apiGet(accessToken, `${config.AUTH_API_ROOT}/oauth/subscriptions/plans`),
      fetchSubscriptions: accessToken =>
        apiGet(accessToken, `${config.AUTH_API_ROOT}/oauth/subscriptions/active`),
      fetchToken: accessToken =>
        apiPost(accessToken, `${config.OAUTH_API_ROOT}/introspect`, { token: accessToken }),
      fetchCustomer: accessToken =>
        apiGet(accessToken, `${config.AUTH_API_ROOT}/oauth/subscriptions/customer`),
      createSubscription: (accessToken, params) =>
        apiPost(
          accessToken,
          `${config.AUTH_API_ROOT}/oauth/subscriptions/active`,
          params
        ),
      cancelSubscription: (accessToken, subscriptionId) =>
        apiDelete(
          accessToken,
          `${config.AUTH_API_ROOT}/oauth/subscriptions/active/${subscriptionId}`
        ),
      updatePayment: (accessToken, { paymentToken }) =>
        apiPost(
          accessToken,
          `${config.AUTH_API_ROOT}/oauth/subscriptions/updatePayment`,
          { paymentToken }
        ),
    },
    'updateApiData',
    'resetCreateSubscription',
    'resetCancelSubscription',
    'resetUpdatePayment',
  ),

  // Convenience functions to produce action sequences via react-thunk functions

  fetchCustomerAndSubscriptions: (accessToken: string) =>
    async (dispatch: Function, getState: Function) => {
      await Promise.all([
        dispatch(actions.fetchCustomer(accessToken)),
        dispatch(actions.fetchSubscriptions(accessToken))  
      ])
    },
  
  fetchPlansAndSubscriptions: (accessToken: string) =>
    async (dispatch: Function, getState: Function) => {
      await Promise.all([
        dispatch(actions.fetchPlans(accessToken)),
        dispatch(actions.fetchCustomer(accessToken)),
        dispatch(actions.fetchSubscriptions(accessToken))  
      ])
    },

  createSubscriptionAndRefresh: (accessToken: string, params: object) =>
    async (dispatch: Function, getState: Function) => {
      await dispatch(actions.createSubscription(accessToken, params));
      await dispatch(actions.fetchCustomerAndSubscriptions(accessToken));
    },

  cancelSubscriptionAndRefresh: (accessToken: string, subscriptionId: object) => 
    async (dispatch: Function, getState: Function) => {
      await dispatch(actions.cancelSubscription(accessToken, subscriptionId));
      await dispatch(actions.fetchCustomerAndSubscriptions(accessToken));
    },
  
  updatePaymentAndRefresh: (accessToken: string, params: object) =>
    async (dispatch: Function, getState: Function) => {
      await dispatch(actions.updatePayment(accessToken, params));
      await dispatch(actions.fetchCustomerAndSubscriptions(accessToken));
      setTimeout(
        () => dispatch(actions.resetUpdatePayment()),
        RESET_PAYMENT_DELAY
      );
    },
};

export const reducers = {
  api: typeToReducer(
    {
      [actions.fetchProfile.toString()]:
        fetchReducer('profile'),
      [actions.fetchPlans.toString()]: 
        fetchReducer('plans'),
      [actions.fetchSubscriptions.toString()]: 
        fetchReducer('subscriptions'),
      [actions.fetchToken.toString()]:
        fetchReducer('token'),
      [actions.fetchCustomer.toString()]:
        fetchReducer('customer'),
      [actions.createSubscription.toString()]:
        fetchReducer('createSubscription'),
      [actions.cancelSubscription.toString()]:
        fetchReducer('cancelSubscription'),
      [actions.updatePayment.toString()]:
        fetchReducer('updatePayment'),
      [actions.updateApiData.toString()]:
        (state, { payload }) => ({ ...state, ...payload }),
      [actions.resetCreateSubscription.toString()]:
        setStatic({ createSubscription: fetchDefault(false) }),
      [actions.resetCancelSubscription.toString()]:
        setStatic({ cancelSubscription: fetchDefault(false) }),
      [actions.resetUpdatePayment.toString()]:
        setStatic({ updatePayment: fetchDefault(false) }),
    },
    defaultState.api
  ),
};

export const selectorsFromState = 
  (...names: Array<string>) =>
    (state: State) =>
      mapToObject(names, (name: string) => selectors[name](state));

export const pickActions =
  (...names: Array<string>) =>
    mapToObject(names, (name: string) => actions[name]);

const composeEnhancers =
  // @ts-ignore declare this property __REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__)
  || compose;

export const createAppStore = (initialState?: State, enhancers: Array<any> = []) =>
  createStore(
    combineReducers(reducers),
    // @ts-ignore TODO: This produces a very obscure error, but the code works properly.
    initialState,
    composeEnhancers(
      applyMiddleware(ReduxThunk, promiseMiddleware()),
      ...enhancers
    )
  );
