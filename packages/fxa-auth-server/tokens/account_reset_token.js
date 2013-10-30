/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, inherits, Token, crypto) {

  var NULL = '0000000000000000000000000000000000000000000000000000000000000000'

  function AccountResetToken() {
    Token.call(this)
  }
  inherits(AccountResetToken, Token)

  AccountResetToken.create = function (uid) {
    log.trace({ op: 'AccountResetToken.create', uid: uid })
    return Token
      .randomTokenData('account/reset', 2 * 32 + 32 + 256)
      .then(
        function (data) {
          var key = data[1]
          var t = new AccountResetToken()
          t.uid = uid
          t.data = data[0].toString('hex')
          t.id = key.slice(0, 32).toString('hex')
          t._key = key.slice(32, 64).toString('hex')
          t.xorKey = key.slice(64, 352).toString('hex')
          return t
        }
      )
  }

  AccountResetToken.fromHex = function (string) {
    log.trace({ op: 'AccountResetToken.fromHex' })
    return Token
      .tokenDataFromBytes(
        'account/reset',
        2 * 32 + 32 + 256,
        Buffer(string, 'hex')
      )
      .then(
        function (data) {
          var key = data[1]
          var t = new AccountResetToken()
          t.data = data[0].toString('hex')
          t.id = key.slice(0, 32).toString('hex')
          t._key = key.slice(32, 64).toString('hex')
          t.xorKey = key.slice(64, 352).toString('hex')
          return t
        }
      )
  }

  AccountResetToken.prototype.bundle = function (wrapKb, verifier) {
    log.trace({ op: 'accountResetToken.bundle', id: this.id })
    return this.xor(
      Buffer.concat(
        [
          Buffer(wrapKb, 'hex'),
          Buffer(verifier, 'hex')
        ]
      )
    ).toString('hex')
  }

  AccountResetToken.prototype.unbundle = function (hex) {
    log.trace({ op: 'accountResetToken.unbundle', id: this.id })
    var plaintext = this.xor(Buffer(hex, 'hex'))
    var wrapKb = plaintext.slice(0, 32).toString('hex')
    var verifier = plaintext.slice(32, 288).toString('hex')
    if (wrapKb === NULL) {
      wrapKb = crypto.randomBytes(32).toString('hex')
    }
    return {
      wrapKb: wrapKb,
      verifier: verifier
    }
  }

  return AccountResetToken
}
