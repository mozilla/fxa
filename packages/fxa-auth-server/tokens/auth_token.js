/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, inherits, Token, error) {

  function AuthToken(keys, details) {
    Token.call(this, keys, details)
    this.verified = !!details.verified
  }
  inherits(AuthToken, Token)

  AuthToken.tokenTypeID = 'authToken'

  AuthToken.create = function (details) {
    log.trace({ op: 'AuthToken.create', uid: details && details.uid })
    return Token.createNewToken(AuthToken, details || {})
  }

  AuthToken.fromHex = function (string, details) {
    log.trace({ op: 'AuthToken.fromHex' })
    return Token.createTokenFromHexData(AuthToken, string, details || {})
  }

  AuthToken.prototype.bundleSession = function (keyFetchToken, sessionToken) {
    log.trace({ op: 'authToken.bundleSession', id: this.id })
    var plaintext = Buffer.concat([
      Buffer(keyFetchToken, 'hex'),
      Buffer(sessionToken, 'hex')
    ])
    return this.bundle('session/create', plaintext)
  }

  AuthToken.prototype.unbundleSession = function (bundle) {
    log.trace({ op: 'authToken.unbundleSession', id: this.id })
    return this.unbundle('session/create', bundle)
      .then(
        function (plaintext) {
          return {
            keyFetchToken: plaintext.slice(0, 32).toString('hex'),
            sessionToken: plaintext.slice(32, 64).toString('hex')
          }
        }
      )
  }

  AuthToken.prototype.bundleAccountReset = function (keyFetchToken, resetToken) {
    log.trace({ op: 'authToken.bundleAccountReset', id: this.id })
    var plaintext = Buffer.concat([
      Buffer(keyFetchToken, 'hex'),
      Buffer(resetToken, 'hex')
    ])
    return this.bundle('password/change', plaintext)
  }

  AuthToken.prototype.unbundleAccountReset = function (bundle) {
    log.trace({ op: 'authToken.unbundleAccountReset', id: this.id })
    return this.unbundle('password/change', bundle)
      .then(
        function (plaintext) {
          return {
            keyFetchToken: plaintext.slice(0, 32).toString('hex'),
            accountResetToken: plaintext.slice(32, 64).toString('hex')
          }
        }
      )
  }

  return AuthToken
}
