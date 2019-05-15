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

export const defaultState: State = {
  api: {
    cancelSubscription: fetchDefault(false),
    createSubscription: fetchDefault(false),
    plans: fetchDefault([]),
    profile: fetchDefault({}),
    subscriptions: fetchDefault([]),
    token: fetchDefault({}),  
  }
};

export const selectors: Selectors = {
  profile: state => state.api.profile,
  token: state => state.api.token,
  subscriptions: state => state.api.subscriptions,
  plans: state => state.api.plans,
  createSubscriptionStatus: state => state.api.createSubscription,
  cancelSubscriptionStatus: state => state.api.cancelSubscription,

  lastError: state => Object
    .entries(state.api)
    .filter(([k, v]) => v && !! v.error)
    .map(([k, v]) => [k, v.error])[0],

  isLoading: state => Object
    .values(state.api)
    .some(v => v && !! v.loading),

  products: state => {
    const plans = selectors.plans(state).result || [];
    return Array.from(
      new Set(
        plans.map((plan: Plan) => plan.product_id)
      )
    );
  },

  plansByProductId: state => (productId: string) => {
    const plans = selectors.plans(state).result || [];
    return productId
      ? plans.filter((plan: Plan) => plan.product_id === productId)
      : plans;
  }
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
    'updateApiData',
    'resetCreateSubscription',
    'resetCancelSubscription',
  ),

  // Convenience functions to produce action sequences via react-thunk functions

  createSubscriptionAndRefresh: (accessToken: string, params: object) =>
    async (dispatch: Function, getState: Function) => {
      await dispatch(actions.createSubscription(accessToken, params));
      dispatch(actions.fetchSubscriptions(accessToken));
    },

  cancelSubscriptionAndRefresh: (accessToken: string, subscriptionId:object) => 
    async (dispatch: Function, getState: Function) => {
      await dispatch(actions.cancelSubscription(accessToken, subscriptionId));
      dispatch(actions.fetchSubscriptions(accessToken));
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
      [actions.createSubscription.toString()]:
        fetchReducer('createSubscription'),
      [actions.cancelSubscription.toString()]:
        fetchReducer('cancelSubscription'),
      [actions.updateApiData.toString()]:
        (state, { payload }) => ({ ...state, ...payload }),
      [actions.resetCreateSubscription.toString()]:
        setStatic({ createSubscription: fetchDefault(false) }),
      [actions.resetCancelSubscription.toString()]:
        setStatic({ cancelSubscription: fetchDefault(false) }),
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
