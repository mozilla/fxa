import { Action } from '../actions';
import { State, defaultState } from '../state';

import apiReducer from './api';
import resetReducer from './reset';

export type Reducer = (state: State | undefined, action: Action) => State;
export type ReducerWithDefinedState = (state: State, action: Action) => State;

export function reduceReducers(
  initialState: State,
  ...reducers: ReducerWithDefinedState[]
): Reducer {
  return (prevState: State | undefined = initialState, action: Action) => {
    const startingState = prevState;
    return reducers.reduce(
      (newState, reducer) => reducer(newState, action),
      startingState
    );
  };
}

export default reduceReducers(defaultState, resetReducer, apiReducer);
