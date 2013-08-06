/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (inherits, Token, db) {

  function AuthToken() {
    Token.call(this)
  }
  inherits(AuthToken, Token)

  AuthToken.hydrate = function (object) {
    return Token.fill(new AuthToken(), object)
  }

  AuthToken.create = function (uid) {
    return Token
      .randomTokenData('session/create', 5 * 32)
      .then(
        function (data) {
          var key = data[1]
          var t = new AuthToken()
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

  AuthToken.getCredentials = function (id, cb) {
    AuthToken.get(id)
      .done(
        function (token) {
          cb(null, token)
        },
        cb
      )
  }

  AuthToken.fromHex = function (string) {
    return Token.
      tokenDataFromBytes(
        'session/create',
        5 * 32,
        Buffer(string, 'hex')
      )
      .then(
        function (data) {
          var key = data[1]
          var t = new AuthToken()
          t.data = data[0].toString('hex')
          t.id = key.slice(0, 32).toString('hex')
          t.key = key.slice(32, 64).toString('hex')
          t.hmacKey = key.slice(64, 96).toString('hex')
          t.xorKey = key.slice(96, 160).toString('hex')
          return t
        }
      )
  }

  AuthToken.get = function (id) {
    return db
      .get(id + '/auth')
      .then(AuthToken.hydrate)
  }

  AuthToken.del = function (id) {
    return db.delete(id + '/auth')
  }

  AuthToken.prototype.save = function () {
    var self = this
    return db.set(this.id + '/auth', this).then(function () { return self })
  }

  AuthToken.prototype.del = function () {
    return AuthToken.del(this.id)
  }

  AuthToken.prototype.bundle = function (keyFetchToken, sessionToken) {
    return this.bundleHexStrings([keyFetchToken.data, sessionToken.data])
  }

  AuthToken.prototype.unbundle = function (bundle) {
    var buffer = Buffer(bundle, 'hex')
    var ciphertext = buffer.slice(0, 64)
    var hmac = buffer.slice(64, 96).toString('hex')
    if(this.hmac(ciphertext).toString('hex') !== hmac) {
      throw new Error('Unmatching HMAC')
    }
    var plaintext = this.xor(ciphertext)
    return {
      // TODO: maybe parse the tokens here
      keyFetchToken: plaintext.slice(0, 32).toString('hex'),
      sessionToken: plaintext.slice(32, 64).toString('hex')
    }
  }

  return AuthToken
}
