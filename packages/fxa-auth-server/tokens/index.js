/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var crypto = require('crypto')
var inherits = require('util').inherits

var P = require('p-promise')
var srp = require('srp')
var uuid = require('uuid')
var hkdf = require('../hkdf')

var error = require('./error')

module.exports = function (log) {

  var Bundle = require('./bundle')(crypto, P, hkdf, error)
  var Token = require('./token')(log, crypto, P, hkdf, Bundle, error)

  var KeyFetchToken = require('./key_fetch_token')(log, inherits, Token, error)
  var AccountResetToken = require('./account_reset_token')(
    log,
    inherits,
    Token,
    crypto
  )
  var SessionToken = require('./session_token')(log, inherits, Token)
  var AuthToken = require('./auth_token')(log, inherits, Token, error)
  var ForgotPasswordToken = require('./forgot_password_token')(
    log,
    inherits,
    Date.now,
    Token,
    crypto
  )
  var SrpToken = require('./srp_token')(
    log,
    inherits,
    P,
    uuid,
    srp,
    Bundle,
    Token,
    error
  )

  Token.error = error
  Token.Bundle = Bundle
  Token.AccountResetToken = AccountResetToken
  Token.KeyFetchToken = KeyFetchToken
  Token.SessionToken = SessionToken
  Token.AuthToken = AuthToken
  Token.ForgotPasswordToken = ForgotPasswordToken
  Token.SrpToken = SrpToken

  return Token
}
