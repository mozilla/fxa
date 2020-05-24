/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var inherits = require('util').inherits;

function AppError(options) {
  this.message = options.message;
  this.errno = options.errno;
  this.error = options.error;
  this.code = options.code;
  if (options.stack) {
    this.stack = options.stack;
  }
}
inherits(AppError, Error);

AppError.prototype.toString = function () {
  return 'Error: ' + this.message;
};

AppError.duplicate = function () {
  return new AppError({
    code: 409,
    error: 'Conflict',
    errno: 101,
    message: 'Record already exists',
  });
};

AppError.notFound = function () {
  return new AppError({
    code: 404,
    error: 'Not Found',
    errno: 116,
    message: 'Not Found',
  });
};

AppError.incorrectPassword = function () {
  return new AppError({
    code: 400,
    error: 'Bad request',
    errno: 103,
    message: 'Incorrect password',
  });
};

AppError.cannotDeletePrimaryEmail = function () {
  return new AppError({
    code: 400,
    error: 'Bad request',
    errno: 136,
    message: 'Can not delete primary email',
  });
};

AppError.expiredTokenVerificationCode = function () {
  return new AppError({
    code: 400,
    error: 'Bad request',
    errno: 137,
    message: 'Expired token verification code',
  });
};

AppError.invalidVerificationMethod = function () {
  return new AppError({
    code: 400,
    error: 'Bad request',
    errno: 138,
    message: 'Invalid verification method',
  });
};

AppError.recoveryKeyInvalid = () => {
  return new AppError({
    code: 400,
    error: 'Bad Request',
    errno: 159,
    message: 'Recovery key is not valid',
  });
};

AppError.cannotSetUnverifiedPrimaryEmail = function () {
  return new AppError({
    code: 400,
    error: 'Bad request',
    errno: 147,
    message: 'Can not set unverified primary email',
  });
};

AppError.cannotSetUnownedPrimaryEmail = function () {
  return new AppError({
    code: 400,
    error: 'Bad request',
    errno: 148,
    message: 'Can not set primary email to email that is not owned by account',
  });
};

AppError.wrap = function (err) {
  // Don't re-wrap!
  if (err instanceof AppError) {
    return err;
  }
  return new AppError({
    code: 500,
    error: 'Internal Server Error',
    errno: err.errno,
    message: err.code,
    stack: err.stack,
  });
};

module.exports = AppError;
