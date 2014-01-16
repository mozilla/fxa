/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, inherits, Token, crypto, lifetime) {

  function PasswordForgotToken(keys, details) {
    details.lifetime = lifetime
    Token.call(this, keys, details)
    this.email = details.email || null
    this.passCode = details.passCode || null
    this.tries = details.tries || null
  }
  inherits(PasswordForgotToken, Token)

  PasswordForgotToken.tokenTypeID = 'passwordForgotToken'

  PasswordForgotToken.create = function (details) {
    details = details || {}
    log.trace({
      op: 'PasswordForgotToken.create',
      uid: details.uid,
      email: details.email
    })
    details.passCode = crypto.randomBytes(16)
    details.tries = 3
    return Token.createNewToken(PasswordForgotToken, details)
  }

  PasswordForgotToken.fromHex = function (string, details) {
    log.trace({ op: 'PasswordForgotToken.fromHex' })
    details = details || {}
    return Token.createTokenFromHexData(PasswordForgotToken, string, details)
  }

  PasswordForgotToken.prototype.failAttempt = function () {
    this.tries--
    return this.tries < 1
  }

  return PasswordForgotToken
}
