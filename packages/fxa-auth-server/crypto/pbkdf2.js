/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var sjcl = require('sjcl')
var P = require('../promise')

/** pbkdf2 string creator
 *
 * @param  {Buffer}  input The password hex buffer.
 * @param  {Buffer}  salt The salt string buffer.
 * @return {Buffer}  the derived key hex buffer.
 */
function derive(input, salt, iterations, len) {
  var password = sjcl.codec.hex.toBits(input.toString('hex'))
  var saltBits = sjcl.codec.hex.toBits(salt.toString('hex'))
  var result = sjcl.misc.pbkdf2(password, saltBits, iterations, len, sjcl.misc.hmac)

  return P(Buffer(sjcl.codec.hex.fromBits(result), 'hex'))
}

module.exports.derive = derive
