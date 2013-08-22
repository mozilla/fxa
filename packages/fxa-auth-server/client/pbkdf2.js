/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var sjcl = require('sjcl')
var P = require('p-promise')

const ITERATIONS = 20 * 1000
const LENGTH = 32 * 8

/** pbkdf2 string creator
 *
 * @param {bitArray|String} password The password.
 * @param {String} salt The salt.
 * @return {String} the derived key.
 */
function derive(password, salt) {
  var saltBits = sjcl.codec.utf8String.toBits(salt)
  var result = sjcl.misc.pbkdf2(password, saltBits, ITERATIONS, LENGTH, sjcl.misc.hmac)

  return P(sjcl.codec.hex.fromBits(result))
}

module.exports.derive = derive
