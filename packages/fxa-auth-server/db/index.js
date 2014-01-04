/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
