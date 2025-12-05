/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { DEFAULT_ERRROR, OAUTH_ERRNO, OAUTH_ERROR_MESSAGES } from './constants';

const hex = (v: Buffer | string): string =>
  Buffer.isBuffer(v) ? v.toString('hex') : v;

// Deprecated. New error types should be defined in lib/error.js
export class OauthError extends Error {
  isBoom: boolean;
  errno: number;
  output: {
    statusCode: number;
    payload: {
      code: number;
      errno: number;
      error: any;
      message: string;
      info: Record<string, any>;
      log?: unknown;
    };
    headers: Record<string, string | number>;
  };

  constructor(options: any, extra?: any, headers?: any) {
    super(options.message || DEFAULT_ERRROR.message);
    this.message = options.message || DEFAULT_ERRROR.message;
    this.isBoom = true;
    if (options.stack) {
      this.stack = options.stack;
    } else {
      Error.captureStackTrace(this, OauthError);
    }
    this.errno = options.errno || DEFAULT_ERRROR.errno;
    this.output = {
      statusCode: options.code || DEFAULT_ERRROR.code,
      payload: {
        code: options.code || DEFAULT_ERRROR.code,
        errno: this.errno,
        error: options.error || DEFAULT_ERRROR.error,
        message: this.message,
        info: options.info || DEFAULT_ERRROR.info,
      },
      headers: headers || {},
    };
    merge(this.output.payload, extra);
  }

  override toString() {
    return 'Error: ' + this.message;
  }

  header(name: string, value: string | number) {
    this.output.headers[name] = value;
  }

  translate(response: { output: { payload: any }; stack: string }) {
    if (response instanceof OauthError) {
      return response;
    }

    let error;
    const payload = response.output.payload;
    if (payload.validation) {
      error = OauthError.invalidRequestParameter(payload.validation);
    } else if (payload.statusCode === 415) {
      error = OauthError.invalidContentType();
    } else {
      error = new OauthError({
        message: payload.message,
        code: payload.statusCode,
        error: payload.error,
        errno: payload.errno,
        stack: response.stack,
      });
    }

    return error;
  }

  static isOauthRoute(
    path: string,
    routes?: Array<{ path: string; config: { cors: any } }>
  ) {
    if (!routes) {
      return false;
    }

    return (
      // For now we use a fragile heuristic that all oauth routes set cors config
      // TODO: when we merge oauth errors into auth, rethink this.
      routes.findIndex((r) => `/v1${r.path}` === path && r.config.cors) > -1
    );
  }

  static translate(
    response:
      | {
          output: {
            payload?: any;
          };
          stack?: string;
        }
      | OauthError
  ): OauthError {
    if (response instanceof OauthError) {
      return response;
    }

    const payload = response.output.payload;

    if (payload?.validation) {
      return OauthError.invalidRequestParameter(payload.validation);
    }

    if (payload?.statusCode === 415) {
      return OauthError.invalidContentType();
    }

    return new OauthError({
      message: payload?.message,
      code: payload?.statusCode,
      error: payload?.error,
      errno: payload?.errno,
      stack: response.stack,
    });
  }

  backtrace(traced: unknown) {
    this.output.payload.log = traced;
  }

  static unexpectedError() {
    return new OauthError({});
  }

  static unknownClient(clientId: string | Buffer) {
    return new OauthError(
      {
        code: 400,
        error: 'Bad Request',
        errno: OAUTH_ERRNO.UNKNOWN_CLIENT,
        message: OAUTH_ERROR_MESSAGES.UNKNOWN_CLIENT,
      },
      {
        clientId: hex(clientId),
      }
    );
  }

  static incorrectSecret(clientId: string) {
    return new OauthError(
      {
        code: 400,
        error: 'Bad Request',
        errno: OAUTH_ERRNO.INCORRECT_SECRET,
        message: OAUTH_ERROR_MESSAGES.INCORRECT_SECRET,
      },
      {
        clientId: hex(clientId),
      }
    );
  }

  static incorrectRedirect(uri: string) {
    return new OauthError(
      {
        code: 400,
        error: 'Bad Request',
        errno: OAUTH_ERRNO.INCORRECT_REDIRECT,
        message: OAUTH_ERROR_MESSAGES.INCORRECT_REDIRECT,
      },
      {
        redirectUri: uri,
      }
    );
  }

  static invalidAssertion() {
    return new OauthError({
      code: 401,
      error: 'Bad Request',
      errno: OAUTH_ERRNO.INVALID_ASSERTION,
      message: OAUTH_ERROR_MESSAGES.INVALID_ASSERTION,
    });
  }

  static unknownCode(code: string) {
    return new OauthError(
      {
        code: 400,
        error: 'Bad Request',
        errno: OAUTH_ERRNO.UNKNOWN_CODE,
        message: OAUTH_ERROR_MESSAGES.UNKNOWN_CODE,
      },
      {
        requestCode: code,
      }
    );
  }

  static mismatchCode(code: string, clientId: string) {
    return new OauthError(
      {
        code: 400,
        error: 'Bad Request',
        errno: OAUTH_ERRNO.INCORRECT_CODE,
        message: OAUTH_ERROR_MESSAGES.INCORRECT_CODE,
      },
      {
        requestCode: hex(code),
        client: hex(clientId),
      }
    );
  }

  static expiredCode(code: string, expiredAt: string) {
    return new OauthError(
      {
        code: 400,
        error: 'Bad Request',
        errno: OAUTH_ERRNO.EXPIRED_CODE,
        message: OAUTH_ERROR_MESSAGES.EXPIRED_CODE,
      },
      {
        requestCode: hex(code),
        expiredAt: expiredAt,
      }
    );
  }

  static invalidToken() {
    return new OauthError({
      code: 400,
      error: 'Bad Request',
      errno: OAUTH_ERRNO.INVALID_TOKEN,
      message: OAUTH_ERROR_MESSAGES.INVALID_TOKEN,
    });
  }

  static invalidRequestParameter(val: string) {
    return new OauthError(
      {
        code: 400,
        error: 'Bad Request',
        errno: OAUTH_ERRNO.INVALID_PARAMETER,
        message: OAUTH_ERROR_MESSAGES.INVALID_PARAMETER,
      },
      {
        validation: val,
      }
    );
  }

  static invalidResponseType() {
    return new OauthError({
      code: 400,
      error: 'Bad Request',
      errno: OAUTH_ERRNO.INVALID_RESPONSE_TYPE,
      message: OAUTH_ERROR_MESSAGES.INVALID_RESPONSE_TYPE,
    });
  }

  static unauthorized(reason: string) {
    return new OauthError(
      {
        code: 401,
        error: 'Unauthorized',
        errno: OAUTH_ERRNO.UNAUTHORIZED,
        message: OAUTH_ERROR_MESSAGES.UNAUTHORIZED,
      },
      {
        detail: reason,
      }
    );
  }

  static forbidden() {
    return new OauthError({
      code: 403,
      error: 'Forbidden',
      errno: OAUTH_ERRNO.FORBIDDEN,
      message: OAUTH_ERROR_MESSAGES.FORBIDDEN,
    });
  }

  static invalidContentType() {
    return new OauthError({
      code: 415,
      error: 'Unsupported Media Type',
      errno: OAUTH_ERRNO.INVALID_CONTENT_TYPE,
      message: OAUTH_ERROR_MESSAGES.INVALID_CONTENT_TYPE,
    });
  }

  static invalidScopes(scopes: string) {
    return new OauthError(
      {
        code: 400,
        error: 'Invalid scopes',
        errno: OAUTH_ERRNO.INVALID_SCOPES,
        message: OAUTH_ERROR_MESSAGES.INVALID_SCOPES,
      },
      {
        invalidScopes: scopes,
      }
    );
  }

  static expiredToken(expiredAt: number) {
    return new OauthError(
      {
        code: 400,
        error: 'Bad Request',
        errno: OAUTH_ERRNO.EXPIRED_TOKEN,
        message: OAUTH_ERROR_MESSAGES.EXPIRED_TOKEN,
      },
      {
        expiredAt: expiredAt,
      }
    );
  }

  static notPublicClient(clientId: string) {
    return new OauthError(
      {
        code: 400,
        error: 'Bad Request',
        errno: OAUTH_ERRNO.NOT_PUBLIC_CLIENT,
        message: OAUTH_ERROR_MESSAGES.NOT_PUBLIC_CLIENT,
      },
      {
        clientId: hex(clientId),
      }
    );
  }

  static mismatchCodeChallenge(pkceHashValue: string) {
    return new OauthError(
      {
        code: 400,
        error: 'Bad Request',
        errno: OAUTH_ERRNO.INCORRECT_CODE_CHALLENGE,
        message: OAUTH_ERROR_MESSAGES.INCORRECT_CODE_CHALLENGE,
      },
      {
        requestCodeChallenge: pkceHashValue,
      }
    );
  }

  static missingPkceParameters() {
    return new OauthError({
      code: 400,
      error: 'PKCE parameters missing',
      errno: OAUTH_ERRNO.MISSING_PKCE_PARAMETERS,
      message: OAUTH_ERROR_MESSAGES.MISSING_PKCE_PARAMETERS,
    });
  }

  static staleAuthAt(authAt: number) {
    return new OauthError(
      {
        code: 401,
        error: 'Bad Request',
        errno: OAUTH_ERRNO.STALE_AUTH_AT,
        message: OAUTH_ERROR_MESSAGES.STALE_AUTH_AT,
      },
      {
        authAt: authAt,
      }
    );
  }

  static mismatchAcr(foundValue: boolean) {
    return new OauthError(
      {
        code: 400,
        error: 'Bad Request',
        errno: OAUTH_ERRNO.MISMATCH_ACR_VALUES,
        message: OAUTH_ERROR_MESSAGES.MISMATCH_ACR_VALUES,
      },
      { foundValue }
    );
  }

  static invalidGrantType() {
    return new OauthError({
      code: 400,
      error: 'Bad Request',
      errno: OAUTH_ERRNO.INVALID_GRANT_TYPE,
      message: OAUTH_ERROR_MESSAGES.INVALID_GRANT_TYPE,
    });
  }

  static unknownToken() {
    return new OauthError({
      code: 400,
      error: 'Bad Request',
      errno: OAUTH_ERRNO.UNKNOWN_TOKEN,
      message: OAUTH_ERROR_MESSAGES.UNKNOWN_TOKEN,
    });
  }

  // N.B. `errno: 201` is traditionally our generic "service unavailable" error,
  // so let's reserve it for that purpose here as well.

  static disabledClient(clientId: string) {
    return new OauthError(
      {
        code: 503,
        error: 'Client Disabled',
        errno: OAUTH_ERRNO.DISABLED_CLIENT_ID,
        message: OAUTH_ERROR_MESSAGES.DISABLED_CLIENT_ID,
      },
      { clientId }
    );
  }
}

/**
 * Utility function to merge one object into an other.
 * @param target The main object
 * @param other The object being merged into the main object.
 */
function merge(target: any, other: any) {
  const keys = Object.keys(other || {});
  for (let i = 0; i < keys.length; i++) {
    target[keys[i]] = other[keys[i]];
  }
}
