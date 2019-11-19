import { State } from '../types';
import { Action } from '../actions';
import defaultState from '../state';
import { reduceReducers } from './index';

describe('reduceReducers', () => {
  const identityReducer = (state: State, action: Action): State => state;

  it('accepts an undefined state and uses initialState', () => {
    const combinedReducer = reduceReducers(
      defaultState,
      identityReducer,
      identityReducer,
      identityReducer
    );
    const result = combinedReducer(undefined, { type: 'resetUpdatePayment' });
    expect(result).toEqual(defaultState);
  });

  it('accepts a defined state', () => {
    const currentState: State = {
      ...defaultState,
      customer: { error: null, loading: true, result: null },
    };
    const combinedReducer = reduceReducers(
      defaultState,
      identityReducer,
      identityReducer,
      identityReducer
    );
    const result = combinedReducer(currentState, {
      type: 'resetUpdatePayment',
    });
    expect(result).toEqual(currentState);
  });
});
