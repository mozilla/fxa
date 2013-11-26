/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, inherits, Token, error) {

  function KeyFetchToken(keys, details) {
    Token.call(this, keys, details)
    this.kA = details.kA || null
    this.wrapKb = details.wrapKb || null
    this.verified = !!details.verified
  }
  inherits(KeyFetchToken, Token)

  KeyFetchToken.tokenTypeID = 'keyFetchToken'

  KeyFetchToken.create = function (details) {
    log.trace({ op: 'KeyFetchToken.create', uid: details && details.uid })
    return Token.createNewToken(KeyFetchToken, details || {})
  }

  KeyFetchToken.fromHex = function (string, details) {
    log.trace({ op: 'KeyFetchToken.fromHex' })
    return Token.createTokenFromHexData(KeyFetchToken, string, details || {})
  }

  KeyFetchToken.prototype.bundleKeys = function (kA, wrapKb) {
    log.trace({ op: 'keyFetchToken.bundleKeys', id: this.id })
    return this.bundle('account/keys', Buffer.concat([kA, wrapKb]))
  }

  KeyFetchToken.prototype.unbundleKeys = function (bundle) {
    log.trace({ op: 'keyFetchToken.unbundleKeys', id: this.id })
    return this.unbundle('account/keys', bundle)
      .then(
        function (plaintext) {
          return {
            kA: plaintext.slice(0, 32),
            wrapKb: plaintext.slice(32, 64)
          }
        }
      )
  }

  return KeyFetchToken
}
