/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('../promise')

module.exports = function (
  backend,
  log,
  error,
  SessionToken,
  KeyFetchToken,
  AccountResetToken,
  PasswordForgotToken,
  PasswordChangeToken) {

  if (backend === 'mysql') {
    return require('./mysql')(
      P,
      log,
      error,
      SessionToken,
      KeyFetchToken,
      AccountResetToken,
      PasswordForgotToken,
      PasswordChangeToken
    )
  }
  else {
    return require('./heap')(
      P,
      log,
      error,
      SessionToken,
      KeyFetchToken,
      AccountResetToken,
      PasswordForgotToken,
      PasswordChangeToken
    )
  }
}
