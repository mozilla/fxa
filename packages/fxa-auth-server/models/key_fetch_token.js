/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (inherits, Token, db) {

  function KeyFetchToken() {
    Token.call(this)
  }
  inherits(KeyFetchToken, Token)

  KeyFetchToken.hydrate = function (object) {
    return Token.fill(new KeyFetchToken(), object)
  }

  KeyFetchToken.create = function (uid) {
    return Token
      .randomTokenData('account/keys', 3 * 32 + 2 * 32)
      .then(
        function (data) {
          var key = data[1]
          var t = new KeyFetchToken()
          t.uid = uid
          t.data = data[0].toString('hex')
          t.id = key.slice(0, 32).toString('hex')
          t.key = key.slice(32, 64).toString('hex')
          t.hmacKey = key.slice(64, 96).toString('hex')
          t.xorKey = key.slice(96, 160).toString('hex')
          return t.save()
        }
      )
  }

  KeyFetchToken.getCredentials = function (id, cb) {
    KeyFetchToken.get(id)
      .done(
        function (token) {
          cb(null, token)
        },
        cb
      )
  }

  KeyFetchToken.get = function (id) {
    return db
      .get(id + '/fetch')
      .then(KeyFetchToken.hydrate)
  }

  KeyFetchToken.del = function (id) {
    return db.delete(id + '/fetch')
  }

  KeyFetchToken.prototype.save = function () {
    var self = this
    return db.set(this.id + '/fetch', this).then(function () { return self })
  }

  KeyFetchToken.prototype.del = function () {
    return KeyFetchToken.del(this.id)
  }

  KeyFetchToken.prototype.bundle = function (kA, wrapKb) {
    return this.bundleHexStrings([kA, wrapKb])
  }

  KeyFetchToken.prototype.unbundle = function (bundle) {
    var buffer = Buffer(bundle, 'hex')
    var ciphertext = buffer.slice(0, 64)
    var hmac = buffer.slice(64, 96).toString('hex')
    if(this.hmac(ciphertext).toString('hex') !== hmac) {
      throw new Error('Unmatching HMAC')
    }
    var plaintext = this.xor(ciphertext)
    return {
      kA: plaintext.slice(0, 32).toString('hex'),
      wrapKb: plaintext.slice(32, 64).toString('hex')
    }
  }

  return KeyFetchToken
}
