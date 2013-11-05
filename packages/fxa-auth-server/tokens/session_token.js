/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, inherits, Token) {

  function SessionToken(keys, details) {
    Token.call(this, keys, details)
    this.email = details.email || null
    this.emailCode = details.emailCode || null
    this.verified = !!details.verified
  }
  inherits(SessionToken, Token)

  SessionToken.tokenTypeID = 'session'

  SessionToken.create = function (details) {
    log.trace({ op: 'SessionToken.create', uid: details && details.uid })
    return Token.createNewToken(SessionToken, details || {})
  }

  SessionToken.fromHex = function (string, details) {
    log.trace({ op: 'SessionToken.fromHex' })
    return Token.createTokenFromHexData(SessionToken, string, details || {})
  }

  return SessionToken
}
