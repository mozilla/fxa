/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (
  config,
  log,
  error,
  AuthToken,
  SessionToken,
  KeyFetchToken,
  AccountResetToken,
  SrpToken,
  ForgotPasswordToken) {

  var backend = config.kvstore.backend
  if (backend === 'mysql') {
    return require('./mysql')(
      config.mysql,
      log,
      error,
      AuthToken,
      SessionToken,
      KeyFetchToken,
      AccountResetToken,
      SrpToken,
      ForgotPasswordToken
    )
  }
  else {
    return require('./heap')(
      log,
      error,
      AuthToken,
      SessionToken,
      KeyFetchToken,
      AccountResetToken,
      SrpToken,
      ForgotPasswordToken
    )
  }
}
