import { ActionType as PromiseActionType } from 'redux-promise-middleware';
import { Action, FetchState } from './types';

type MappedObject = { [propName: string]: any };
export const mapToObject = (
  list: Array<string>,
  mapFn: Function
): MappedObject => {
  const out: MappedObject = {};
  for (const item of list) {
    out[item] = mapFn(item);
  }
  return out;
};

export const setStatic = (newState: object) => (state: object): object => ({
  ...state,
  ...newState,
});

export const fetchDefault = (defaultResult: any): FetchState<any> => ({
  error: null,
  loading: false,
  result: defaultResult,
});

export interface FetchReducer {
  [propName: string]: (state: object, action: Action) => object;
}

export const fetchReducer = (name: string): FetchReducer => ({
  [PromiseActionType.Pending]: (state: object) => ({
    ...state,
    [name]: { error: null, loading: true, result: null },
  }),
  [PromiseActionType.Fulfilled]: (state: object, { payload }: Action) => ({
    ...state,
    [name]: { error: null, loading: false, result: payload },
  }),
  [PromiseActionType.Rejected]: (state: object, { payload }: Action) => ({
    ...state,
    [name]: { error: payload, loading: false, result: null },
  }),
});
