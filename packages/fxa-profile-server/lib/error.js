/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const util = require('util');

const DEFAULTS = {
  code: 500,
  error: 'Internal Server Error',
  errno: 999,
  message: 'Unspecified error',
};

function AppError(options, extra, headers) {
  this.message = options.message || DEFAULTS.message;
  this.isBoom = true;
  this.stack = options.stack;
  if (!this.stack) {
    Error.captureStackTrace(this, AppError);
  }
  this.errno = options.errno || DEFAULTS.errno;
  var code = options.code || DEFAULTS.code;
  this.output = {
    statusCode: code,
    payload: {
      code: code,
      errno: this.errno,
      error: options.error || DEFAULTS.error,
      message: this.message,
      info: options.info || DEFAULTS.info,
    },
    headers: headers || {},
  };
  var keys = Object.keys(extra || {});
  for (var i = 0; i < keys.length; i++) {
    this.output.payload[keys[i]] = extra[keys[i]];
  }
}
util.inherits(AppError, Error);

AppError.prototype.toString = function () {
  return 'Error: ' + this.message;
};

AppError.prototype.header = function (name, value) {
  this.output.headers[name] = value;
};

AppError.from = function from(obj) {
  var err = new AppError(obj);
  err.cause = obj.cause;
  return err;
};

AppError.translate = function translate(response) {
  if (response instanceof AppError) {
    return response;
  }

  var error;
  var payload = response.output.payload;
  if (payload.validation) {
    error = AppError.invalidRequestParameter(payload.validation);
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

AppError.notFound = function notFound() {
  return new AppError({
    code: 404,
    error: 'Bad Request',
    message: 'Not Found',
  });
};

AppError.unauthorized = function unauthorized(msg) {
  return new AppError(
    {
      code: 401,
      error: 'Bad Request',
      errno: 100,
      message: 'Unauthorized',
    },
    {
      reason: msg,
    }
  );
};

AppError.deprecated = function unauthorized(msg) {
  return new AppError({
    code: 410,
    error: 'Gone',
    message: 'This endpoint is no longer supported',
  });
};

AppError.invalidRequestParameter = function invalidRequestParameter(val) {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: 101,
      message: 'Invalid request parameter',
    },
    {
      validation: val,
    }
  );
};

AppError.unsupportedProvider = function unsupportedProvider(url) {
  return new AppError(
    {
      code: 400,
      error: 'Bad Request',
      errno: 102,
      message: 'Unsupported image provider',
    },
    {
      url: url,
    }
  );
};

AppError.requestBlocked = function () {
  return new AppError({
    code: 400,
    error: 'Request blocked',
    errno: 125,
    message: 'The request was blocked for security reasons',
  });
};

AppError.tooManyRequests = function (retryAfter) {
  if (!retryAfter) {
    retryAfter = 30;
  }
  return new AppError(
    {
      code: 429,
      error: 'Too Many Requests',
      errno: 114,
      message: 'Client has sent too many requests',
    },
    {
      retryAfter: retryAfter,
    },
    {
      'retry-after': retryAfter,
    }
  );
};

AppError.processingError = function processingError(res) {
  return new AppError(
    {
      code: 500,
      error: 'Internal Server Error',
      errno: 103,
      message: 'Image processing error',
    },
    {
      _res: res,
    }
  );
};

AppError.oauthError = function oauthError(err) {
  return new AppError(
    {
      code: 503,
      error: 'Service Unavailable',
      errno: 104,
      message: 'OAuth server error',
    },
    {
      cause: err,
    }
  );
};

AppError.authError = function authError(err) {
  return new AppError(
    {
      code: 503,
      error: 'Service Unavailable',
      errno: 105,
      message: 'Auth server error',
    },
    {
      cause: err,
    }
  );
};

AppError.anonIdExists = function anonIdExists(err) {
  return new AppError(
    {
      code: 412,
      error: 'Precondition Failed',
      errno: 106,
      message: 'Attempted to update non-null Ecosystem Anon ID',
    },
    {
      cause: err,
    }
  );
};

module.exports = AppError;
