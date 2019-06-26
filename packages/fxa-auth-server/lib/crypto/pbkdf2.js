/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sjcl = require('sjcl');
const P = require('../promise');

/** pbkdf2 string creator
 *
 * @param  {Buffer}  input The password hex buffer.
 * @param  {Buffer}  salt The salt string buffer.
 * @return {Buffer}  the derived key hex buffer.
 */
function derive(input, salt, iterations, len) {
  const password = sjcl.codec.hex.toBits(input.toString('hex'));
  const saltBits = sjcl.codec.hex.toBits(salt.toString('hex'));
  const result = sjcl.misc.pbkdf2(
    password,
    saltBits,
    iterations,
    len * 8,
    sjcl.misc.hmac
  );

  return P.resolve(Buffer.from(sjcl.codec.hex.fromBits(result), 'hex'));
}

module.exports.derive = derive;
