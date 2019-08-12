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

type ErrorResponseBody = {
  code?: string;
  statusCode?: number;
  errno?: number;
  error?: string;
  message?: string;
  info?: string;
};

export class APIError extends Error {
  body: ErrorResponseBody | null;
  response: Response | null | undefined;
  code: string | null;
  statusCode: number | null;
  errno: number | null;
  error: string | null;

  constructor(
    body?: ErrorResponseBody,
    response?: Response,
    code?: string,
    errno?: number,
    error?: string,
    statusCode?: number,
    ...params: Array<any>
  ) {
    super(...params);
    this.response = response;
    this.body = body || null;
    this.code = code || null;
    this.statusCode = statusCode || null;
    this.errno = errno || null;
    this.error = error || null;

    if (this.body) {
      const { code, errno, error, message, statusCode } = this.body;
      Object.assign(this, { code, errno, error, message, statusCode });
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
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
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

export const apiGet = (...args: [string, string, object?]) =>
  apiFetch('GET', ...args);

export const apiDelete = (...args: [string, string, object?]) =>
  apiFetch('DELETE', ...args);

export const apiPost = (accessToken: string, path: string, body: object) =>
  apiFetch('POST', accessToken, path, { body: JSON.stringify(body) });

export const setStatic = (newState: object) => (state: object): object => ({
  ...state,
  ...newState,
});

export const setAsPayload = (state: object, { payload }: Action): object =>
  payload;

export const setFromPayload = (name: string, defval: any) => (
  state: object,
  { payload }: Action
): object => ({ ...state, [name]: payload || defval });

export const setFromPayloadFn = (fn: Function) => (
  state: object,
  { payload }: Action
) => ({ ...state, ...fn(payload) });

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
