/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('p-promise')
var pbkdf2 = require('./pbkdf2')
var scrypt = require('../scrypt')
var hkdf = require('../hkdf')

// The namespace for the salt functions
const NAMESPACE = 'identity.mozilla.com/picl/v1/'
const SCRYPT_HELPER = 'https://scrypt-accounts.dev.lcip.org/'
const ITERATIONS = 20000
const LENGTH = 8 * 32

/** Derive a key from an email and password pair
 *
 * @param {Buffer} email The email hex buffer of the user
 * @param {Buffer} password The password of the user
 * @param {String} saltHex The salt to derive hkdf as a hex string
 * @return p.promise object - It will resolve with
 * {Buffer} srpPw srp password
 * {Buffer} unwrapBKey unwrapBKey
 * or fail with {object} err
 */
function derive(email, password, saltHex) {
  var p = P.defer()

  if (!password || !email || !saltHex) {
    p.reject('Bad password, salt or email input')
    return p.promise
  }

  var salt = Buffer(saltHex, 'hex')
  // derive the first key from pbkdf2
  pbkdf2
    .derive(password, KWE('first-PBKDF', email), ITERATIONS, LENGTH)
    .then(
      function(K1) {
        // request a hash from scrypt based on the first key
        return scrypt.hash(K1, KW("scrypt"), module.exports.SCRYPT_HELPER)
      }
    )
    .then(
      function (K2) {
        // combine the K2 hex string and a password UTF8 into a bit array
        var scryptPassword = Buffer.concat([
          Buffer(K2, 'hex'),
          password
        ])
        // derive the second key from pbkdf2
        return pbkdf2.derive(scryptPassword, KWE('second-PBKDF', email), ITERATIONS, LENGTH)
      }
    )
    .then(
      function (stretchedPw) {
        var input = new Buffer (stretchedPw, 'hex')
        var lengthHkdf = 2 * 32

        return hkdf(input, 'mainKDF', salt, lengthHkdf)
      }
    )
    .done(
      function (hkdfResult) {
        var hkdfResultHex = hkdfResult.toString('hex')
        var srpPw = Buffer(hkdfResultHex.substring(0,64), 'hex')
        var unwrapBKey = Buffer(hkdfResultHex.substring(64,128), 'hex')

        p.resolve({ srpPw: srpPw, unwrapBKey: unwrapBKey })
      },
      function (err) {
        p.reject(err)
      }
    )

  return p.promise
}

/** XOR
 *
 * @param {Buffer|String} input1 first value of the buffer as a hex string or a buffer
 * @param {Buffer|String} input2 second value of the buffer as hex string or a buffer
 * @return {Buffer} xorResult Result XOR buffer
 */
function xor(input1, input2) {
  var buf1 = Buffer.isBuffer(input1) ? input1 : Buffer(input1, 'hex')
  var buf2 = Buffer.isBuffer(input2) ? input2 : Buffer(input2, 'hex')
  var xorResult = Buffer(buf1.length)

  if (buf1.length !== buf2.length) {
    throw new Error(
      'XOR buffers must be same length %d != %d',
      buf1.length,
      buf2.length
    )
  }
  for (var i = 0; i < xorResult.length; i++) {
    xorResult[i] = buf2[i] ^ buf1[i]
  }

  return xorResult
}


/** KWE
 *
 * @param {String} name The name of the salt
 * @param {Buffer} email The email of the user.
 * @return {Buffer} the salt combination with the namespace
 */
function KWE(name, email) {
  return Buffer(NAMESPACE + name + ':' + email)
}

/** KW
 *
 * @param {String} name The name of the salt
 * @return {Buffer} the salt combination with the namespace
 */
function KW(name) {
  return Buffer(NAMESPACE + name)
}

module.exports.SCRYPT_HELPER = SCRYPT_HELPER
module.exports.derive = derive
module.exports.xor = xor
module.exports.KWE = KWE
module.exports.KW = KW
