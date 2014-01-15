/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var crypto = require('crypto')
var inherits = require('util').inherits

var P = require('../promise')
var hkdf = require('../crypto/hkdf')
var butil = require('../crypto/butil')

var error = require('./error')

module.exports = function (log, lifetimes) {
  lifetimes = lifetimes || {
    accountResetToken: 1000 * 60 * 15,
    passwordChangeToken: 1000 * 60 * 15,
    passwordForgotToken: 1000 * 60 * 15
  }
  var Bundle = require('./bundle')(crypto, P, hkdf, butil, error)
  var Token = require('./token')(log, crypto, P, hkdf, Bundle, error)

  var KeyFetchToken = require('./key_fetch_token')(log, inherits, Token, P, error)
  var AccountResetToken = require('./account_reset_token')(
    log,
    inherits,
    Token,
    crypto,
    lifetimes.accountResetToken
  )
  var SessionToken = require('./session_token')(log, inherits, Token)
  var PasswordForgotToken = require('./password_forgot_token')(
    log,
    inherits,
    Token,
    crypto,
    lifetimes.passwordForgotToken
  )

  var PasswordChangeToken = require('./password_change_token')(
    log,
    inherits,
    Token,
    lifetimes.passwordChangeToken
  )

  Token.error = error
  Token.Bundle = Bundle
  Token.AccountResetToken = AccountResetToken
  Token.KeyFetchToken = KeyFetchToken
  Token.SessionToken = SessionToken
  Token.PasswordForgotToken = PasswordForgotToken
  Token.PasswordChangeToken = PasswordChangeToken

  return Token
}
