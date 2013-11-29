/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, inherits, Token, crypto) {

  function AccountResetToken(keys, details) {
    Token.call(this, keys, details)
  }
  inherits(AccountResetToken, Token)

  AccountResetToken.tokenTypeID = 'accountResetToken'

  AccountResetToken.create = function (details) {
    log.trace({ op: 'AccountResetToken.create', uid: details && details.uid })
    return Token.createNewToken(AccountResetToken, details || {})
  }

  AccountResetToken.fromHex = function (string, details) {
    log.trace({ op: 'AccountResetToken.fromHex' })
    details = details || {}
    return Token.createTokenFromHexData(AccountResetToken, string, details)
  }

  AccountResetToken.prototype.bundleAccountData = function (wrapKb, verifier) {
    log.trace({ op: 'accountResetToken.bundleAccountData', id: this.id })
    return this.bundle('account/reset', Buffer.concat([wrapKb, Buffer(verifier, 'hex')]))
  }

  AccountResetToken.prototype.unbundleAccountData = function (hex) {
    log.trace({ op: 'accountResetToken.unbundleAccountData', id: this.id })
    return this.unbundle('account/reset', hex)
      .then(
        function (plaintext) {
          var wrapKb = plaintext.slice(0, 32)
          var verifier = plaintext.slice(32, 288).toString('hex')
          if (bufferIsNull(wrapKb)) {
           wrapKb = crypto.randomBytes(32)
          }
          return {
            wrapKb: wrapKb,
            verifier: verifier
          }
        }.bind(this)
      )
  }

  function bufferIsNull(buffer) {
    for (var i = 0; i < buffer.length; i++) {
      if (buffer[i] !== 0) return false
    }
    return true
  }

  return AccountResetToken
}
