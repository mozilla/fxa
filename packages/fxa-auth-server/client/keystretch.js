/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('p-promise')
var sjcl = require('sjcl')
var pbkdf2 = require('./pbkdf2')
var scrypt = require('./scrypt')
var hkdf = require('../hkdf')
var crypto = require('crypto')

// The namespace for the salt functions
const NAMESPACE = 'identity.mozilla.com/picl/v1/'


/** Derive a key from an email and password pair
 *
 * @param {String} email The email of the user
 * @param {String} password The password of the user
 * @param {String} saltHex The salt to derive hkdf as a hex string
 * @return p.promise object - It will resolve with
 * {String} srpPw srp password
 * {String} unwrapBKey unwrapBKey
 * {String} salt salt used in this derivation
 * or fail with {object} err
 */
function derive(email, password, saltHex) {
  var p = P.defer()
  var salt = Buffer(saltHex, 'hex')

  if (password == 'undefined' || email == 'undefined' || password.length === 0 || email.length === 0) {
    p.reject('Bad password or email input')
    return p.promise
  }

  // derive the first key from pbkdf2
  pbkdf2
    .derive(password, KWE('first-PBKDF', email))
    .then(
      function(K1) {
        // request a hash from scrypt based on the first key
        return scrypt.hash(K1, KW("scrypt"), 'http://scrypt.dev.lcip.org/')
      }
    )
    .then(
      function (K2) {
        // combine the K2 hex string and a password UTF8 into a bit array
        var scryptPassword = sjcl.bitArray.concat(
          sjcl.codec.hex.toBits(K2),
          sjcl.codec.utf8String.toBits(password)
        )
        // derive the second key from pbkdf2
        return pbkdf2.derive(scryptPassword, KWE('second-PBKDF', email))
      }
    )
    .then(
      function (stretchedPw) {
        var input = new Buffer (stretchedPw, 'hex')
        // if there's existingSalt use it
        var lengthHkdf = 2 * 32;
        return hkdf(input, 'mainKDF', salt, lengthHkdf)
      }
    )
    .done(
      function (hkdfResult) {
        var hkdfResultHex = hkdfResult.toString('hex')
        var srpPw = hkdfResultHex.substring(0,64)
        var unwrapBKey = hkdfResultHex.substring(64,128)
        p.resolve({ srpPw: srpPw, unwrapBKey: unwrapBKey })
      },
      function (err) {
        p.reject(err)
      }
    )

  return p.promise
}


/** KWE
 *
 * @param {String} name The name of the salt
 * @param {String} email The email of the user.
 * @return {string} the salt combination with the namespace
 */
function KWE(name, email) {
  return NAMESPACE + name + ':' + email
}

/** KW
 *
 * @param {String} name The name of the salt
 * @return {string} the salt combination with the namespace
 */
function KW(name) {
  return NAMESPACE + name
}

module.exports.derive = derive
