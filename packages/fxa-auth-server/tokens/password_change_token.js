/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, inherits, Token) {

  function PasswordChangeToken(keys, details) {
    Token.call(this, keys, details)
    this.verifyHash = details.verifyHash || null
    this.authSalt = details.authSalt || null
  }
  inherits(PasswordChangeToken, Token)

  PasswordChangeToken.tokenTypeID = 'passwordChangeToken'

  PasswordChangeToken.create = function (details) {
    log.trace({ op: 'PasswordChangeToken.create', uid: details && details.uid })
    return Token.createNewToken(PasswordChangeToken, details || {})
  }

  PasswordChangeToken.fromHex = function (string, details) {
    log.trace({ op: 'PasswordChangeToken.fromHex' })
    return Token.createTokenFromHexData(PasswordChangeToken, string, details || {})
  }

  return PasswordChangeToken
}
