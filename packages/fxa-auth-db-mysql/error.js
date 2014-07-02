/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var inherits = require('util').inherits

function AppError(options) {
  this.message = options.message
  this.errno = options.errno
  this.error = options.error
  this.code = options.code
  if (options.stack) this.stack = options.stack
}
inherits(AppError, Error)

AppError.prototype.toString = function () {
  return 'Error: ' + this.message
}

AppError.duplicate = function () {
  return new AppError(
    {
      code: 409,
      error: 'Conflict',
      errno: 101,
      message: 'Record already exists'
    }
  )
}

AppError.notFound = function () {
  return new AppError(
    {
      code: 404,
      error: 'Not Found',
      errno: 116,
      message: 'Not Found'
    }
  )
}

AppError.wrap = function (err) {
  return new AppError(
    {
      code: 500,
      error: 'Internal Server Error',
      errno: err.errno,
      message: err.code,
      stack: err.stack
    }
  )
}

module.exports = AppError
