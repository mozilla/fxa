/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, inherits, Bundle, Account, tokens) {

  function AuthBundle() {
    Bundle.call(this)
    this.authToken = null
    this.otherToken = null
  }
  inherits(AuthBundle, Bundle)

  AuthBundle.create = function (K, type) {
    log.trace({ op: 'AuthBundle.create', type: type })
    return Bundle
      .hkdf(K, type, null, 2 * 32)
      .then(
        function (key) {
          var b = new AuthBundle()
          b.hmacKey = key.slice(0, 32).toString('hex')
          b.xorKey = key.slice(32, 64).toString('hex')
          return b
        }
      )
  }

  AuthBundle.login = function (K, uid) {
    log.trace({ op: 'AuthBundle.login', uid: uid })
    return AuthBundle.create(K, 'auth/finish')
      .then(
        function (b) {
          return tokens.AuthToken.create(uid)
            .then(
              function (t) {
                b.authToken = t
                return {
                  bundle: b.bundle()
                }
              }
            )
        }
      )
  }

  AuthBundle.prototype.unbundle = function (hex) {
    log.trace({ op: 'authBundle.unbundle' })
    var bundle = Buffer(hex, 'hex')
    var ciphertext = bundle.slice(0, 32)
    var hmac = bundle.slice(32, 64)
    if (this.hmac(ciphertext).toString('hex') !== hmac.toString('hex')) {
      throw new Error('Corrupt Message')
    }
    var plaintext = this.xor(ciphertext)
    return plaintext.slice(0, 32).toString('hex')
  }

  AuthBundle.prototype.bundle = function () {
    log.trace({ op: 'authBundle.bundle' })
    return this.bundleHexStrings([this.authToken.data])
  }

  return AuthBundle
}
