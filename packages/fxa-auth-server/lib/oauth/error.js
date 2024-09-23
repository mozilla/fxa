/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import util from 'util';

import hexModule from "buf";
const hex = hexModule.to.hex;

const DEFAULTS = {
  code: 500,
  error: 'Internal Server Error',
  errno: 999,
  info: 'https://mozilla.github.io/ecosystem-platform/api#section/Errors',
  message: 'Unspecified error',
};

function merge(target, other) {
  var keys = Object.keys(other || {});
  for (var i = 0; i < keys.length; i++) {
    target[keys[i]] = other[keys[i]];
  }
}

// Deprecated. New error types should be defined in lib/error.js
function OauthError(options, extra, headers) {
  this.message = options.message || DEFAULTS.message;
  this.isBoom = true;
  if (options.stack) {
    this.stack = options.stack;
  } else {
    Error.captureStackTrace(this, OauthError);
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
util.inherits(OauthError, Error);

OauthError.prototype.toString = function () {
  return 'Error: ' + this.message;
};

OauthError.prototype.header = function (name, value) {
  this.output.headers[name] = value;
};

OauthError.isOauthRoute = function isOauthRoute(path) {
  const routes = require('../routes/oauth')();
  // ironically, routes that include "oauth" are considered auth-server routes
  return (
    // For now we use a fragile heuristic that all oauth routes set cors config
    // TODO: when we merge oauth errors into auth, rethink this.
    (routes.findIndex((r) => `/v1${r.path}` === path && r.config.cors) > -1)
  );
};

OauthError.translate = function translate(response) {
  if (response instanceof OauthError) {
    return response;
  }

  var error;
  var payload = response.output.payload;
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
};

OauthError.prototype.backtrace = function (traced) {
  this.output.payload.log = traced;
};

OauthError.unexpectedError = function unexpectedError() {
  return new OauthError({});
};

OauthError.unknownClient = function unknownClient(clientId) {
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
};

OauthError.incorrectSecret = function incorrectSecret(clientId) {
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
};

OauthError.incorrectRedirect = function incorrectRedirect(uri) {
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
};

OauthError.invalidAssertion = function invalidAssertion() {
  return new OauthError({
    code: 401,
    error: 'Bad Request',
    errno: 104,
    message: 'Invalid assertion',
  });
};

OauthError.unknownCode = function unknownCode(code) {
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
};

OauthError.mismatchCode = function mismatchCode(code, clientId) {
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
};

OauthError.expiredCode = function expiredCode(code, expiredAt) {
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
};

OauthError.invalidToken = function invalidToken() {
  return new OauthError({
    code: 400,
    error: 'Bad Request',
    errno: 108,
    message: 'Invalid token',
  });
};

OauthError.invalidRequestParameter = function invalidRequestParameter(val) {
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
};

OauthError.invalidResponseType = function invalidResponseType() {
  return new OauthError({
    code: 400,
    error: 'Bad Request',
    errno: 110,
    message: 'Invalid response_type',
  });
};

OauthError.unauthorized = function unauthorized(reason) {
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
};

OauthError.forbidden = function forbidden() {
  return new OauthError({
    code: 403,
    error: 'Forbidden',
    errno: 112,
    message: 'Forbidden',
  });
};

OauthError.invalidContentType = function invalidContentType() {
  return new OauthError({
    code: 415,
    error: 'Unsupported Media Type',
    errno: 113,
    message:
      'Content-Type must be either application/json or ' +
      'application/x-www-form-urlencoded',
  });
};

OauthError.invalidScopes = function invalidScopes(scopes) {
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
};

OauthError.expiredToken = function expiredToken(expiredAt) {
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
};

OauthError.notPublicClient = function notPublicClient(clientId) {
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
};

OauthError.mismatchCodeChallenge = function mismatchCodeChallenge(
  pkceHashValue
) {
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
};

OauthError.missingPkceParameters = function missingPkceParameters() {
  return new OauthError({
    code: 400,
    error: 'PKCE parameters missing',
    errno: 118,
    message: 'Public clients require PKCE OAuth parameters',
  });
};

OauthError.staleAuthAt = function staleAuthAt(authAt) {
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
};

OauthError.mismatchAcr = function mismatchAcr(foundValue) {
  return new OauthError(
    {
      code: 400,
      error: 'Bad Request',
      errno: 120,
      message: 'Mismatch acr value',
    },
    { foundValue }
  );
};

OauthError.invalidGrantType = function invalidGrantType() {
  return new OauthError({
    code: 400,
    error: 'Bad Request',
    errno: 121,
    message: 'Invalid grant_type',
  });
};

OauthError.unknownToken = function unknownToken() {
  return new OauthError({
    code: 400,
    error: 'Bad Request',
    errno: 122,
    message: 'Unknown token',
  });
};

// N.B. `errno: 201` is traditionally our generic "service unavailable" error,
// so let's reserve it for that purpose here as well.

OauthError.disabledClient = function disabledClient(clientId) {
  return new OauthError(
    {
      code: 503,
      error: 'Client Disabled',
      errno: 202, // TODO reconcile this with the auth-server version
      message: 'This client has been temporarily disabled',
    },
    { clientId }
  );
};

// Deprecated. New error types should be defined in lib/error.js

export default OauthError;
