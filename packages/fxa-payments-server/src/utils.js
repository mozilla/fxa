import { ActionType as PromiseActionType } from 'redux-promise-middleware';
const { assign } = Object;

export const parseParams = params => params
  .substr(1)
  .split('&')
  .reduce((acc, curr) => {
    const parts = curr.split('=').map(decodeURIComponent);
    acc[parts[0]] = parts[1];
    return acc;
  }, {});

export const mapToObject = (list, mapFn) => {
  const out = {};
  for (const item of list) {
    out[item] = mapFn(item);
  }
  return out;
};

export const apiGet = (...args) => apiFetch('GET', ...args);

export const apiDelete = (...args) => apiFetch('DELETE', ...args);

export const apiPost = (accessToken, path, body) =>
  apiFetch('POST', accessToken, path, { body: JSON.stringify(body) });

export const apiFetch = (method, accessToken, path, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers || {}
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return fetch(path, {
    mode: 'cors',
    credentials: 'omit',
    method,
    ...options,
    headers,
  }).then(response => {
    if (response.status >= 400) {
      throw new APIError(response, 'status ' + response.status);
    }
    return response.json();
  });
};

export class APIError extends Error {
  constructor(response, ...params) {
    super(...params);
    this.response = response;
  }
}

export const setStatic = newState => state => assign({}, state, newState);

export const setAsPayload = (state, { payload }) => payload;

export const setFromPayload = (name, defval) => (state, { payload }) =>
  ({ ...state, [name]: payload || defval });

export const setFromPayloadFn = fn => (state, { payload }) =>
  ({ ...state, ...fn(payload) });

export const fetchDefault = defaultResult =>
  ({ loading: false, error: null, result: defaultResult });

export const fetchReducer = name => ({
  [PromiseActionType.Pending]: state =>
    ({ ...state, [name]: { loading: true, error: null, result: null } }),
  [PromiseActionType.Fulfilled]: (state, { payload }) =>
    ({ ...state, [name]: { loading: false, error: null, result: payload } }),
  [PromiseActionType.Rejected]: (state, { payload }) =>
    ({ ...state, [name]: { loading: false, error: payload, result: null } }),
});
