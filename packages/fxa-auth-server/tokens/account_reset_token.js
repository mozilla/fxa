/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, inherits, Token, crypto) {

  var NULL = '0000000000000000000000000000000000000000000000000000000000000000'

  function AccountResetToken(keys, details) {
    Token.call(this, keys, details)
  }
  inherits(AccountResetToken, Token)

  AccountResetToken.tokenTypeID = 'account/reset'

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
    var plaintext = Buffer.concat([
      Buffer(wrapKb, 'hex'),
      Buffer(verifier, 'hex')
    ])
    return this.bundle('account/reset', plaintext)
  }

  AccountResetToken.prototype.unbundleAccountData = function (hex) {
    log.trace({ op: 'accountResetToken.unbundleAccountData', id: this.id })
    return this.unbundle('account/reset', hex)
      .then(
        function (plaintext) {
          var wrapKb = plaintext.slice(0, 32).toString('hex')
          var verifier = plaintext.slice(32, 288).toString('hex')
          if (wrapKb === NULL) {
           wrapKb = crypto.randomBytes(32).toString('hex')
          }
          return {
            wrapKb: wrapKb,
            verifier: verifier
          }
        }.bind(this)
      )
  }

  return AccountResetToken
}
