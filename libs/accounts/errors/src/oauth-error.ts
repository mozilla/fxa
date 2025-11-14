/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { DEFAULT_ERRROR } from './constants';

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
        errno: 101,
        message: 'Unknown client',
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
        errno: 102,
        message: 'Incorrect secret',
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
        errno: 103,
        message: 'Incorrect redirect_uri',
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
      errno: 104,
      message: 'Invalid assertion',
    });
  }

  static unknownCode(code: string) {
    return new OauthError(
      {
        code: 400,
        error: 'Bad Request',
        errno: 105,
        message: 'Unknown code',
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
        errno: 106,
        message: 'Incorrect code',
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
        errno: 107,
        message: 'Expired code',
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
      errno: 108,
      message: 'Invalid token',
    });
  }

  static invalidRequestParameter(val: string) {
    return new OauthError(
      {
        code: 400,
        error: 'Bad Request',
        errno: 109,
        message: 'Invalid request parameter',
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
      errno: 110,
      message: 'Invalid response_type',
    });
  }

  static unauthorized(reason: string) {
    return new OauthError(
      {
        code: 401,
        error: 'Unauthorized',
        errno: 111,
        message: 'Unauthorized for route',
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
      errno: 112,
      message: 'Forbidden',
    });
  }

  static invalidContentType() {
    return new OauthError({
      code: 415,
      error: 'Unsupported Media Type',
      errno: 113,
      message:
        'Content-Type must be either application/json or ' +
        'application/x-www-form-urlencoded',
    });
  }

  static invalidScopes(scopes: string) {
    return new OauthError(
      {
        code: 400,
        error: 'Invalid scopes',
        errno: 114,
        message: 'Requested scopes are not allowed',
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
        errno: 115,
        message: 'Expired token',
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
        errno: 116,
        message: 'Not a public client',
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
        errno: 117,
        message: 'Incorrect code_challenge',
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
      errno: 118,
      message: 'Public clients require PKCE OAuth parameters',
    });
  }

  static staleAuthAt(authAt: number) {
    return new OauthError(
      {
        code: 401,
        error: 'Bad Request',
        errno: 119,
        message: 'Stale authentication timestamp',
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
        errno: 120,
        message: 'Mismatch acr value',
      },
      { foundValue }
    );
  }

  static invalidGrantType() {
    return new OauthError({
      code: 400,
      error: 'Bad Request',
      errno: 121,
      message: 'Invalid grant_type',
    });
  }

  static unknownToken() {
    return new OauthError({
      code: 400,
      error: 'Bad Request',
      errno: 122,
      message: 'Unknown token',
    });
  }

  // N.B. `errno: 201` is traditionally our generic "service unavailable" error,
  // so let's reserve it for that purpose here as well.

  static disabledClient(clientId: string) {
    return new OauthError(
      {
        code: 503,
        error: 'Client Disabled',
        errno: 202, // TODO reconcile this with the auth-server version
        message: 'This client has been temporarily disabled',
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
