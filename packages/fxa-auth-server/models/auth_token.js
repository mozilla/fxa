/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (inherits, Token, db) {

  function AuthToken() {
    Token.call(this)
    this.opKey = null
  }
  inherits(AuthToken, Token)

  AuthToken.hydrate = function (object) {
    var t = Token.fill(new AuthToken(), object)
    if (t) {
      t.opKey = object.value ? object.value.opKey : object.opKey
    }
    return t
  }

  AuthToken.create = function (uid) {
    return Token
      .randomTokenData('authToken', 3 * 32)
      .then(
        function (data) {
          var key = data[1]
          var t = new AuthToken()
          t.uid = uid
          t.data = data[0].toString('hex')
          t.id = key.slice(0, 32).toString('hex')
          t._key = key.slice(32, 64).toString('hex')
          t.opKey = key.slice(64, 96).toString('hex')
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
        'authToken',
        3 * 32,
        Buffer(string, 'hex')
      )
      .then(
        function (data) {
          var key = data[1]
          var t = new AuthToken()
          t.data = data[0].toString('hex')
          t.id = key.slice(0, 32).toString('hex')
          t._key = key.slice(32, 64).toString('hex')
          t.opKey = key.slice(64, 96).toString('hex')
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

  AuthToken.prototype.bundleKeys = function (type, keyFetchToken, otherToken) {
    return Token.tokenDataFromBytes(
      type,
      3 * 32,
      Buffer(this.opKey, 'hex')
    )
    .then(
      function (data) {
        var wrapper = new Token()
        wrapper.hmacKey = data[1].slice(0, 32).toString('hex')
        wrapper.xorKey = data[1].slice(32, 96).toString('hex')
        return wrapper.bundleHexStrings([keyFetchToken.data, otherToken.data])
      }
    )
  }

  AuthToken.prototype.bundleSession = function (keyFetchToken, sessionToken) {
    return this.bundleKeys('session/create', keyFetchToken, sessionToken)
  }

  AuthToken.prototype.bundleAccountReset = function (keyFetchToken, accountResetToken) {
    return this.bundleKeys('password/change', keyFetchToken, accountResetToken)
  }

  AuthToken.prototype.unbundleSession = function (bundle) {
    return this.unbundle('session/create', bundle)
      .then(
        function (tokens) {
          return {
            keyFetchToken: tokens.keyFetchToken,
            sessionToken: tokens.otherToken
          }
        }
      )
  }

  AuthToken.prototype.unbundleAccountReset = function (bundle) {
    return this.unbundle('password/change', bundle)
      .then(
        function (tokens) {
          return {
            keyFetchToken: tokens.keyFetchToken,
            accountResetToken: tokens.otherToken
          }
        }
      )
  }

  AuthToken.prototype.unbundle = function (type, bundle) {
    return Token.tokenDataFromBytes(
      type,
      3 * 32,
      Buffer(this.opKey, 'hex')
    )
    .then(
      function (data) {
        var token = new Token()
        token.hmacKey = data[1].slice(0, 32).toString('hex')
        token.xorKey = data[1].slice(32, 96).toString('hex')
        return token
      }
    )
    .then(
      function (token) {
        var buffer = Buffer(bundle, 'hex')
        var ciphertext = buffer.slice(0, 64)
        var hmac = buffer.slice(64, 96).toString('hex')
        if(token.hmac(ciphertext).toString('hex') !== hmac) {
          throw new Error('Unmatching HMAC')
        }
        var plaintext = token.xor(ciphertext)
        return {
          keyFetchToken: plaintext.slice(0, 32).toString('hex'),
          otherToken: plaintext.slice(32, 64).toString('hex')
        }
      }
    )
  }

  return AuthToken
}
