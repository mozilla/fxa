/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { pbkdf2 } = require('crypto');

/** pbkdf2 string creator
 *
 * @param  {Buffer}  input The password hex buffer.
 * @param  {Buffer}  salt The salt string buffer.
 * @param  {number}  iterations number of rounds of kdf
 * @param  {number}  len byte length of the derived key
 * @return {Promise<Buffer>}  the derived key hex buffer.
 */
function derive(input, salt, iterations, len) {
  return new Promise((resolve, reject) => {
    pbkdf2(input, salt, iterations, len, 'sha256', (err, key) => {
      if (err) {
        return reject(err);
      }
      resolve(key);
    });
  });
}

module.exports.derive = derive;
