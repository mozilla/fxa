/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('../promise')
var scrypt = require('scrypt-hash')

/**  hash - Creates an scrypt hash asynchronously
 *
 * @param {Buffer} input The input for scrypt
 * @param {Buffer} salt The salt for the hash
 * @returns {Object} d.promise Deferred promise
 */
function hash(input, salt, N, r, p, len) {
  var d = P.defer()
  scrypt(input, salt, N, r, p, len,
    function (err, hash) {
      return err ? d.reject(err) : d.resolve(hash.toString('hex'))
    }
  )
  return d.promise
}

module.exports.hash = hash
