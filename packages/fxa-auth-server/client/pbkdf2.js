/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var sjcl = require('sjcl')
sjcl.codec.bytes = require('sjcl-codec-bytes')
var P = require('p-promise')

const ITERATIONS = 20 * 1000
const LENGTH = 32 * 8

/** pbkdf2 string creator
 *
 * @param  {Buffer}  input The password hex buffer.
 * @param  {Buffer}  salt The salt string buffer.
 * @return {Buffer}  the derived key hex buffer.
 */
function derive(input, salt) {
  var password = sjcl.codec.bytes.toBits(input)
  var saltBits = sjcl.codec.bytes.toBits(salt)
  var result = sjcl.misc.pbkdf2(password, saltBits, ITERATIONS, LENGTH, sjcl.misc.hmac)

  return P(Buffer(sjcl.codec.bytes.fromBits(result)))
}

module.exports.derive = derive
