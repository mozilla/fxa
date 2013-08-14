/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (inherits, Token, crypto, db) {

  var NULL = '0000000000000000000000000000000000000000000000000000000000000000'

  function AccountResetToken() {
    Token.call(this)
  }
  inherits(AccountResetToken, Token)

  AccountResetToken.hydrate = function (object) {
    return Token.fill(new AccountResetToken(), object)
  }

  AccountResetToken.create = function (uid) {
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
          return t.save()
        }
      )
  }

  AccountResetToken.fromHex = function (string) {
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

  AccountResetToken.getCredentials = function (id, cb) {
    AccountResetToken.get(id)
      .done(
        function (token) {
          cb(null, token)
        },
        cb
      )
  }

  AccountResetToken.get = function (id) {
    return db
      .get(id + '/reset')
      .then(AccountResetToken.hydrate)
  }

  AccountResetToken.del = function (id) {
    return db.delete(id + '/reset')
  }

  AccountResetToken.prototype.save = function () {
    var self = this
    return db.set(this.id + '/reset', this).then(function () { return self })
  }

  AccountResetToken.prototype.del = function () {
    return AccountResetToken.del(this.id)
  }

  AccountResetToken.prototype.bundle = function (wrapKb, verifier) {
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
