/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, inherits, now, Token, crypto) {

  var LIFETIME = 1000 * 60 * 15

  function ForgotPasswordToken(keys, details) {
    Token.call(this, keys, details)
    this.email = details.email || null
    this.created = details.created || null
    this.passcode = details.passcode || null
    this.tries = details.tries || null
  }
  inherits(ForgotPasswordToken, Token)

  ForgotPasswordToken.tokenTypeID = 'forgotPasswordToken'

  ForgotPasswordToken.create = function (details) {
    details = details || {}
    log.trace({
      op: 'ForgotPasswordToken.create',
      uid: details.uid,
      email: details.email
    })
    details.passcode = crypto.randomBytes(4).readUInt32BE(0) % 100000000
    details.created = now()
    details.tries = 3
    return Token.createNewToken(ForgotPasswordToken, details)
  }

  ForgotPasswordToken.fromHex = function (string, details) {
    log.trace({ op: 'ForgotPasswordToken.fromHex' })
    details = details || {}
    return Token.createTokenFromHexData(ForgotPasswordToken, string, details)
  }

  ForgotPasswordToken.prototype.ttl = function () {
    var ttl = (LIFETIME - (now() - this.created)) / 1000
    return Math.max(Math.ceil(ttl), 0)
  }

  ForgotPasswordToken.prototype.failAttempt = function () {
    this.tries--
    return this.tries < 1
  }

  return ForgotPasswordToken
}
