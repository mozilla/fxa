import { createStore, combineReducers, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import ReduxThunk, { ThunkMiddleware } from 'redux-thunk';
import { createPromise as promiseMiddleware } from 'redux-promise-middleware';
import { reducers } from './reducers';
import { State, Action } from './types';
import { AmplitudeMiddleware } from './amplitude-middleware';

export const createAppStore = (initialState?: State, enhancers?: Array<any>) =>
  createStore<State, Action, unknown, unknown>(
    // @ts-ignore
    combineReducers(reducers),
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
