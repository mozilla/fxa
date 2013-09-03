/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var crypto = require('crypto')
var inherits = require('util').inherits

var P = require('p-promise')
var srp = require('srp')
var uuid = require('uuid')

var Bundle = require('../bundle')
var error = require('../error')

module.exports = function (log, config, dbs, mailer) {

  var Token = require('./token')(log, inherits, Bundle)

  var KeyFetchToken = require('./key_fetch_token')(
    log,
    inherits,
    Token,
    dbs.cache
  )
  var AccountResetToken = require('./account_reset_token')(
    log,
    inherits,
    Token,
    crypto,
    dbs.store
  )
  var SessionToken = require('./session_token')(
    log,
    inherits,
    Token,
    dbs.store
  )
  var AuthToken = require('./auth_token')(
    log,
    inherits,
    Token,
    dbs.cache
  )
  var ForgotPasswordToken = require('./forgot_password_token')(
    log,
    inherits,
    Token,
    crypto,
    dbs.cache,
    mailer
  )
  var tokens = {
    AccountResetToken: AccountResetToken,
    KeyFetchToken: KeyFetchToken,
    SessionToken: SessionToken,
    AuthToken: AuthToken,
    ForgotPasswordToken: ForgotPasswordToken
  }

  var RecoveryEmail = require('./recovery_email')(
    log,
    crypto,
    P,
    dbs.store,
    mailer
  )
  var Account = require('./account')(
    log,
    P,
    tokens,
    RecoveryEmail,
    dbs.store,
    config,
    error
  )
  var SrpSession = require('./srp_session')(
    log,
    P,
    uuid,
    srp,
    dbs.cache,
    error
  )
  var AuthBundle = require('./auth_bundle')(
    log,
    inherits,
    Bundle,
    Account,
    tokens
  )

  return {
    dbs: dbs,
    Account: Account,
    AuthBundle: AuthBundle,
    RecoveryEmail: RecoveryEmail,
    SrpSession: SrpSession,
    tokens: tokens
  }
}
