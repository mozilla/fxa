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

module.exports = function (config, dbs, mailer) {

  var Token = require('./token')(inherits, Bundle)

  var KeyFetchToken = require('./key_fetch_token')(
    inherits,
    Token,
    dbs.store
  )
  var AccountResetToken = require('./account_reset_token')(
    inherits,
    Token,
    crypto,
    dbs.store
  )
  var SessionToken = require('./session_token')(
    inherits,
    Token,
    dbs.store
  )
  var tokens = {
    AccountResetToken: AccountResetToken,
    KeyFetchToken: KeyFetchToken,
    SessionToken: SessionToken
  }

  var RecoveryMethod = require('./recovery_method')(
    crypto,
    P,
    dbs.store,
    mailer
  )
  var Account = require('./account')(
    P,
    tokens,
    RecoveryMethod,
    dbs.store,
    config,
    error
  )
  var SrpSession = require('./srp_session')(
    P,
    uuid,
    srp,
    dbs.cache,
    error
  )
  var AuthBundle = require('./auth_bundle')(
    inherits,
    Bundle,
    Account,
    tokens
  )

  return {
    dbs: dbs,
    Account: Account,
    AuthBundle: AuthBundle,
    RecoveryMethod: RecoveryMethod,
    SrpSession: SrpSession,
    tokens: tokens
  }
}
