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

type ErrorResponseBody = {
  code?: number;
  errno?: number;
  error?: string;
  message?: string;
  info?: string;
};

export class APIError extends Error {
  body: ErrorResponseBody;
  response: Response;

  constructor(
    body: ErrorResponseBody,
    response: Response,
    ...params: Array<any>
  ) {
    super(...params);
    this.response = response;
    this.body = body;
    if (this.body && this.body.message) {
      this.message = this.body.message;
    }
  }
}

// TODO: Use a better type here
interface APIFetchOptions {
  [propName: string]: any;
}

export const apiFetch = async (
  method: string,
  accessToken: string,
  path: string,
  options: APIFetchOptions = {}
) => {
  const response = await fetch(path, {
    mode: 'cors',
    credentials: 'omit',
    method,
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers || {}
    },
  });
  if (response.status >= 400) {
    let body = {};
    try {
      // Parse the body as JSON, but will fail if things have really gone wrong
      body = await response.json();
    } catch (_) {
      // No-op
    }
    throw new APIError(body, response);
  }
  return response.json();
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
  [PromiseActionType.Rejected]: (state: State, { payload }: Action) =>
    ({
      ...state,
      [name]: { error: payload, loading: false, result: null }
    }),
});
