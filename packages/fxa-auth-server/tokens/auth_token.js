/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, inherits, Token, error) {

  function AuthToken() {
    Token.call(this)
    this.opKey = null
  }
  inherits(AuthToken, Token)

  AuthToken.create = function (uid) {
    log.trace({ op: 'AuthToken.create', uid: uid })
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
          return t
        }
      )
  }

  AuthToken.fromHex = function (string) {
    log.trace({ op: 'AuthToken.fromHex' })
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

  AuthToken.prototype.bundleKeys = function (type, keyFetchToken, otherToken) {
    log.trace({ op: 'authToken.bundleKeys', id: this.id, type: type })
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

  AuthToken.prototype.unbundleSession = function (bundle) {
    log.trace({ op: 'authToken.unbundleSession', id: this.id })
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
    log.trace({ op: 'authToken.unbundleAccountReset', id: this.id })
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
    log.trace({ op: 'authToken.unbundle', id: this.id, type: type })
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
          throw error.invalidSignature()
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
