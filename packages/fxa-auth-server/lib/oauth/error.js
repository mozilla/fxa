/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const util = require('util');
const hex = require('buf').to.hex;

const DEFAULTS = {
  code: 500,
  error: 'Internal Server Error',
  errno: 999,
  info:
    'https://github.com/mozilla/fxa-oauth-server/blob/master/docs/api.md#errors',
  message: 'Unspecified error',
};

function merge(target, other) {
  var keys = Object.keys(other || {});
  for (var i = 0; i < keys.length; i++) {
    target[keys[i]] = other[keys[i]];
  }
}

function AppError(options, extra, headers) {
  this.message = options.message || DEFAULTS.message;
  this.isBoom = true;
  if (options.stack) {
    this.stack = options.stack;
  } else {
    Error.captureStackTrace(this, AppError);
  }
  this.errno = options.errno || DEFAULTS.errno;
  this.output = {
    statusCode: options.code || DEFAULTS.code,
    payload: {
      code: options.code || DEFAULTS.code,
      errno: this.errno,
      error: options.error || DEFAULTS.error,
      message: this.message,
      info: options.info || DEFAULTS.info,
    },
    headers: headers || {},
  };
  merge(this.output.payload, extra);
}
util.inherits(AppError, Error);

AppError.prototype.toString = function() {
  return 'Error: ' + this.message;
};

AppError.prototype.header = function(name, value) {
  this.output.headers[name] = value;
};

AppError.isOauthRoute = function isOauthRoute(path) {
  const routes = require('./routes').routes;
  return routes.findIndex(r => r.path === path) > -1;
};

AppError.translate = function translate(response) {
  if (response instanceof AppError) {
    return response;
  }

  var error;
  var payload = response.output.payload;
  if (payload.validation) {
    error = AppError.invalidRequestParameter(payload.validation);
  } else if (payload.statusCode === 415) {
    error = AppError.invalidContentType();
  } else {
    error = new AppError({
      message: payload.message,
      code: payload.statusCode,
      error: payload.error,
      errno: payload.errno,
      stack: response.stack,
    });
  }

  return error;
};

AppError.prototype.backtrace = function(traced) {
  this.output.payload.log = traced;
};

AppError.unexpectedError = function unexpectedError() {
  return new AppError({});
};

AppError.unknownClient = function unknownClient(clientId) {
  return new AppError(
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
};

AppError.incorrectSecret = function incorrectSecret(clientId) {
  return new AppError(
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
};

AppError.incorrectRedirect = function incorrectRedirect(uri) {
  return new AppError(
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
};

AppError.invalidAssertion = function invalidAssertion() {
  return new AppError({
    code: 401,
    error: 'Bad Request',
    errno: 104,
    message: 'Invalid assertion',
  });
};

AppError.unknownCode = function unknownCode(code) {
  return new AppError(
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
};

AppError.mismatchCode = function mismatchCode(code, clientId) {
  return new AppError(
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
};

AppError.expiredCode = function expiredCode(code, expiredAt) {
  return new AppError(
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
};

AppError.invalidToken = function invalidToken() {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: 108,
    message: 'Invalid token',
  });
};

AppError.invalidRequestParameter = function invalidRequestParameter(val) {
  return new AppError(
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
};

AppError.invalidResponseType = function invalidResponseType() {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: 110,
    message: 'Invalid response_type',
  });
};

AppError.unauthorized = function unauthorized(reason) {
  return new AppError(
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
};

AppError.forbidden = function forbidden() {
  return new AppError({
    code: 403,
    error: 'Forbidden',
    errno: 112,
    message: 'Forbidden',
  });
};

AppError.invalidContentType = function invalidContentType() {
  return new AppError({
    code: 415,
    error: 'Unsupported Media Type',
    errno: 113,
    message:
      'Content-Type must be either application/json or ' +
      'application/x-www-form-urlencoded',
  });
};

AppError.invalidScopes = function invalidScopes(scopes) {
  return new AppError(
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
};

AppError.expiredToken = function expiredToken(expiredAt) {
  return new AppError(
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
};

AppError.notPublicClient = function notPublicClient(clientId) {
  return new AppError(
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
};

AppError.mismatchCodeChallenge = function mismatchCodeChallenge(pkceHashValue) {
  return new AppError(
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
};

AppError.missingPkceParameters = function missingPkceParameters() {
  return new AppError({
    code: 400,
    error: 'PKCE parameters missing',
    errno: 118,
    message: 'Public clients require PKCE OAuth parameters',
  });
};

AppError.staleAuthAt = function staleAuthAt(authAt) {
  return new AppError(
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
};

AppError.mismatchAcr = function mismatchAcr(foundValue) {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: 120,
      message: 'Mismatch acr value',
    },
    { foundValue }
  );
};

AppError.invalidGrantType = function invalidGrantType() {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: 121,
    message: 'Invalid grant_type',
  });
};

AppError.unknownToken = function unknownToken() {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: 122,
    message: 'Unknown token',
  });
};

// N.B. `errno: 201` is traditionally our generic "service unavailable" error,
// so let's reserve it for that purpose here as well.

AppError.disabledClient = function disabledClient(clientId) {
  return new AppError(
    {
      code: 503,
      error: 'Client Disabled',
      errno: 202,
      message: 'This client has been temporarily disabled',
    },
    { clientId }
  );
};

module.exports = AppError;
