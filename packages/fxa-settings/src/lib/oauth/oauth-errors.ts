/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { interpolate } from '../error-utils';
import { OAUTH_ERRNO, OAUTH_ERROR_MESSAGES } from '@fxa/accounts/errors';

export type AuthError = {
  errno: number;
  message: string;
  response_error_code?: string;
  interpolate?: boolean;
  version?: number;
};

export const UNEXPECTED_ERROR = 'Unexpected error';

const sharedError = <K extends keyof typeof OAUTH_ERROR_MESSAGES>(
  key: K,
  extra?: Partial<AuthError>
): AuthError => ({
  errno: OAUTH_ERRNO[key],
  message: OAUTH_ERROR_MESSAGES[key],
  ...extra,
});

export const OAUTH_ERRORS: Record<string, AuthError> = {
  UNKNOWN_CLIENT: sharedError('UNKNOWN_CLIENT'),
  INCORRECT_REDIRECT: sharedError('INCORRECT_REDIRECT'),
  INVALID_ASSERTION: sharedError('INVALID_ASSERTION'),
  UNKNOWN_CODE: sharedError('UNKNOWN_CODE'),
  INCORRECT_CODE: sharedError('INCORRECT_CODE'),
  EXPIRED_CODE: sharedError('EXPIRED_CODE'),
  INVALID_TOKEN: sharedError('INVALID_TOKEN'),
  INVALID_PARAMETER: sharedError('INVALID_PARAMETER', {
    message: 'Invalid OAuth parameter: %(param)s',
    interpolate: true,
  }),
  INVALID_RESPONSE_TYPE: sharedError('INVALID_RESPONSE_TYPE', {
    message: UNEXPECTED_ERROR,
  }),
  UNAUTHORIZED: sharedError('UNAUTHORIZED', { message: 'Unauthorized' }),
  FORBIDDEN: sharedError('FORBIDDEN'),
  INVALID_CONTENT_TYPE: sharedError('INVALID_CONTENT_TYPE', {
    message: UNEXPECTED_ERROR,
  }),
  INVALID_SCOPES: sharedError('INVALID_SCOPES', {
    message: 'Invalid OAuth parameter: %(param)s',
    interpolate: true,
  }),
  EXPIRED_TOKEN: sharedError('EXPIRED_TOKEN'),
  NOT_PUBLIC_CLIENT: sharedError('NOT_PUBLIC_CLIENT'),
  INCORRECT_CODE_CHALLENGE: sharedError('INCORRECT_CODE_CHALLENGE'),
  MISSING_PKCE_PARAMETERS: sharedError('MISSING_PKCE_PARAMETERS', {
    message: 'PKCE parameters missing',
  }),
  STALE_AUTHENTICATION_TIMESTAMP: sharedError('STALE_AUTH_AT'),
  MISMATCH_ACR_VALUES: sharedError('MISMATCH_ACR_VALUES', {
    message: 'Mismatch acr values',
  }),
  INVALID_GRANT_TYPE: sharedError('INVALID_GRANT_TYPE'),
  SERVER_UNAVAILABLE: sharedError('SERVER_UNAVAILABLE'),
  DISABLED_CLIENT_ID: sharedError('DISABLED_CLIENT_ID'),
  SERVICE_UNAVAILABLE: {
    errno: 998,
    message: 'System unavailable, try again soon',
  },
  UNEXPECTED_ERROR: {
    errno: 999,
    message: UNEXPECTED_ERROR,
  },
  TRY_AGAIN: {
    errno: 1000,
    message: 'Something went wrong. Please close this tab and try again.',
  },
  INVALID_RESULT: {
    errno: 1001,
    message: UNEXPECTED_ERROR,
  },
  /*
  Removed in PR #6017
  INVALID_RESULT_REDIRECT: {
    errno: 1002,
    message: UNEXPECTED_ERROR
  },
  INVALID_RESULT_CODE: {
    errno: 1003,
    message: UNEXPECTED_ERROR
  },
  */
  USER_CANCELED_OAUTH_LOGIN: {
    errno: 1004,
    message: 'no message',
  },
  MISSING_PARAMETER: {
    errno: 1005,
    message: 'Missing OAuth parameter: %(params)',
    response_error_code: 'invalid_request',
  },
  INVALID_PAIRING_CLIENT: {
    errno: 1006,
    message: 'Invalid pairing client',
  },
  PROMPT_NONE_NOT_ENABLED: {
    errno: 1007,
    message: 'prompt=none is not enabled',
    response_error_code: 'invalid_request',
  },
  PROMPT_NONE_NOT_ENABLED_FOR_CLIENT: {
    errno: 1008,
    message: 'prompt=none is not enabled for this client',
    response_error_code: 'unauthorized_client',
  },
  PROMPT_NONE_WITH_KEYS: {
    errno: 1009,
    message: 'prompt=none cannot be used when requesting keys',
    response_error_code: 'invalid_request',
  },
  PROMPT_NONE_NOT_SIGNED_IN: {
    errno: 1010,
    message: 'User is not signed in',
    response_error_code: 'login_required',
  },
  PROMPT_NONE_DIFFERENT_USER_SIGNED_IN: {
    errno: 1011,
    message: 'A different user is signed in',
    response_error_code: 'account_selection_required',
  },
  PROMPT_NONE_UNVERIFIED: {
    errno: 1012,
    message: 'Unverified user or session',
    response_error_code: 'interaction_required',
  },
  PROMPT_NONE_INVALID_ID_TOKEN_HINT: {
    errno: 1013,
    message: 'Invalid id_token_hint',
    response_error_code: 'invalid_request',
  },
};

export class OAuthError extends Error {
  public errno: number;
  public response_error_code?: string;

  constructor(
    public readonly error: string | number,
    public readonly params?: Record<string, string>
  ) {
    const err =
      typeof error === 'string'
        ? OAUTH_ERRORS[error]
        : typeof error === 'number'
          ? Object.values(OAUTH_ERRORS).find((x) => x.errno === error)
          : null;
    let msg = err != null ? err.message : UNEXPECTED_ERROR;
    if (err?.interpolate) {
      msg = interpolate(msg, params || {});
    }

    super(msg);
    this.name = 'OAuthError';
    this.errno = err?.errno || OAUTH_ERRORS.UNEXPECTED_ERROR.errno;
    this.response_error_code = err?.response_error_code;
  }
}

export function normalizeXHRError(response: Response) {
  // TODO: Implement Auth Error Handling
  throw new Error('NOT YET IMPLEMENTED');
}
