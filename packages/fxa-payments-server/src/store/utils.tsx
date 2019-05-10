import { ActionType as PromiseActionType } from 'redux-promise-middleware';
import { Action, State, FetchState } from './types';

type MappedObject = { [propName: string]: any };
export const mapToObject = (list: Array<string>, mapFn: Function): MappedObject => {
  const out: MappedObject = {};
  for (const item of list) {
    out[item] = mapFn(item);
  }
  return out;
};

export class APIError extends Error {
  constructor(response: object, ...params: Array<any>) {
    super(...params);
    // @ts-ignore not catching .response from Error
    this.response = response;
  }
}

// TODO: Use a better type here
interface APIFetchOptions {
  [propName: string]: any;
}

export const apiFetch = (
  method: string,
  accessToken: string,
  path: string,
  options: APIFetchOptions = {}
) => {
  return fetch(path, {
    mode: 'cors',
    credentials: 'omit',
    method,
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers || {}
    },
  }).then(response => {
    if (response.status >= 400) {
      throw new APIError(response, 'status ' + response.status);
    }
    return response.json();
  });
};

export const apiGet = (...args: [string, string, object?]) => apiFetch('GET', ...args);

export const apiDelete = (...args: [string, string, object?]) => apiFetch('DELETE', ...args);

export const apiPost = (accessToken: string, path: string, body: object) =>
  apiFetch('POST', accessToken, path, { body: JSON.stringify(body) });

export const setStatic = (newState: object) =>
  (state: object): object =>
    ({ ...state, ...newState });  

export const setAsPayload =
  (state: object, { payload }: Action): object =>
    payload;

export const setFromPayload = (name: string, defval: any) =>
  (state: object, { payload }: Action): object =>
    ({ ...state, [name]: payload || defval });

export const setFromPayloadFn = (fn: Function) =>
  (state: object, { payload }: Action) =>
    ({ ...state, ...fn(payload) });

export const fetchDefault = (defaultResult: any): FetchState<any> =>
  ({ error: null, loading: false, result: defaultResult });

export interface FetchReducer {
  [propName: string]: (state: State, action: Action) => object;
}
  
export const fetchReducer = (name: string): FetchReducer => ({
  [PromiseActionType.Pending]: (state: State) =>
    ({
      ...state,
      [name]: { error: null, loading: true, result: null }
    }),
  [PromiseActionType.Fulfilled]: (state: State, { payload }: Action) =>
    ({
      ...state,
      [name]: { error: null, loading: false, result: payload }
    }),
  [PromiseActionType.Rejected]: (state:State, { payload }: Action) =>
    ({
      ...state,
      [name]: { error: payload, loading: false, result: null }
    }),
});
