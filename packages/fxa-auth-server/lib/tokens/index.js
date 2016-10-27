/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const crypto = require('crypto')
const inherits = require('util').inherits

const P = require('../promise')
const hkdf = require('../crypto/hkdf')
const butil = require('../crypto/butil')
const random = require('../crypto/random')

const error = require('../error')

module.exports = (log, config) => {
  config = config || {}
  const lifetimes = config.tokenLifetimes || {
    accountResetToken: 1000 * 60 * 15,
    passwordChangeToken: 1000 * 60 * 15,
    passwordForgotToken: 1000 * 60 * 15
  }
  const Bundle = require('./bundle')(crypto, P, hkdf, butil, error)
  const Token = require('./token')(log, random, P, hkdf, Bundle, error)

  const KeyFetchToken = require('./key_fetch_token')(log, inherits, Token, P, error)
  const AccountResetToken = require('./account_reset_token')(
    log,
    inherits,
    Token,
    lifetimes.accountResetToken
  )
  const SessionToken = require('./session_token')(log, inherits, Token, config)
  const PasswordForgotToken = require('./password_forgot_token')(
    log,
    inherits,
    Token,
    random,
    lifetimes.passwordForgotToken
  )

  const PasswordChangeToken = require('./password_change_token')(
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
