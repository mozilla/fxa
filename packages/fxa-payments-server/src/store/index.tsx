import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import ReduxThunk, { ThunkMiddleware } from 'redux-thunk';
import { createPromise as promiseMiddleware } from 'redux-promise-middleware';
import combinedReducer from './reducers';
import { Action } from './actions';
import { State } from './types';
import { AmplitudeMiddleware } from './amplitude-middleware';

export const createAppStore = (initialState?: State, enhancers?: Array<any>) =>
  createStore<State, Action, unknown, unknown>(
    combinedReducer,
    initialState,
    composeWithDevTools(
      applyMiddleware(
        ReduxThunk as ThunkMiddleware<State, Action>,
        promiseMiddleware(),
        AmplitudeMiddleware
      ),
      ...(enhancers || [])
    )
  );
