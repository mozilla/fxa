import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import { createActions } from 'redux-actions';
import ReduxThunk from 'redux-thunk';
import { createPromise as promiseMiddleware } from 'redux-promise-middleware';
import typeToReducer from 'type-to-reducer';

import config from "./config";
import {
  apiGet,
  apiDelete,
  apiPost,
  setFromPayload,
  fetchDefault,
  fetchReducer,
} from "./utils.js";

export const defaultState = {
  api: {
    accessToken: null,
    token: fetchDefault({}),
    profile: fetchDefault({}),
    plans: fetchDefault([]),
    subscriptions: fetchDefault([]),
  },
  ui: {
    productId: null,
  },
};

export const selectors = {
  productId: state => state.ui.productId,

  accessToken: state => state.api.accessToken,
  profile: state => state.api.profile,
  token: state => state.api.token,
  subscriptions: state => state.api.subscriptions,
  plans: state => state.api.plans,

  lastError: state => Object
    .entries(state.api)
    .filter(([k, v]) => v && !!v.error)
    .map(([k, v]) => [k, v.error])[0],
  
  isLoading: state => Object
    .values(state.api)
    .some(v => v && !!v.loading),
  
  plansByProductId: state => {
    const plans = selectors.plans(state).result || [];
    const productId = selectors.productId(state) || null;
    return productId
      ? plans.filter(plan => plan.product_id === productId)
      : plans;
  }
};

export const actions = {
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
        )
    },
    "setAccessToken",
    "setProductId",
    "updateApiData",
  ),

  // Convenience methods to produce thunks for action sequences.
  createSubscriptionAndRefresh: params => (dispatch, getState) => {
    const accessToken = selectors.accessToken(getState());
    dispatch(actions.createSubscription(accessToken, params))
      .then(() => dispatch(actions.fetchSubscriptions(accessToken)));
  },
  cancelSubscriptionAndRefresh: subscriptionId => (dispatch, getState) => {
    const accessToken = selectors.accessToken(getState());
    dispatch(actions.cancelSubscription(accessToken, subscriptionId))
      .then(() => dispatch(actions.fetchSubscriptions(accessToken)));
  },
};

export const reducers = {
  api: typeToReducer(
    {
      [actions.fetchProfile]: fetchReducer("profile"),
      [actions.fetchPlans]: fetchReducer("plans"),
      [actions.fetchSubscriptions]: fetchReducer("subscriptions"),
      [actions.fetchToken]: fetchReducer("token"),
      [actions.createSubscription]: fetchReducer("created"),
      [actions.cancelSubscription]: fetchReducer("canceled"),
      [actions.setAccessToken]: setFromPayload("accessToken"),
      [actions.updateApiData]: (state, { payload }) => ({ ...state, ...payload }),
    },
    defaultState.api
  ),
  ui: typeToReducer(
    {
      [actions.setProductId]: setFromPayload("productId"),
    },
    defaultState.ui
  ),
};

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const createAppStore = (initialState, enhancers = []) =>
  createStore(
    combineReducers(reducers),
    initialState,
    composeEnhancers(
      applyMiddleware(ReduxThunk, promiseMiddleware()),
      ...enhancers
    )
  );
