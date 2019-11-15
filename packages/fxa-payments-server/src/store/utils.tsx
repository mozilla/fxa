import { ActionType as PromiseActionType } from 'redux-promise-middleware';
import { Action, FetchState, Plan, ProductMetadata } from './types';

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

export function fetchDefault<T = any, E = any>(
  defaultResult: T | null = null
): FetchState<T, E> {
  // HACK: Typescript seems to hate `result: defaultResult` when it's null,
  // even though that results in a valid FetchResult type
  return defaultResult === null
    ? {
        error: null,
        loading: false,
        result: null,
      }
    : {
        error: null,
        loading: false,
        result: defaultResult,
      };
}

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

// Support some default null values for product / plan metadata and
// allow plan metadata to override product metadata
export const metadataFromPlan = (plan: Plan): ProductMetadata => ({
  productSet: null,
  productOrder: null,
  emailIconURL: null,
  webIconURL: null,
  upgradeCTA: null,
  downloadURL: null,
  ...plan.product_metadata,
  ...plan.plan_metadata,
});
