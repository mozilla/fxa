/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('../promise')
var scrypt = require('scrypt-hash')
 
// The maximum numer of hash operations allowed concurrently.
// This can be customized by setting module.exports.MAX_PENDING
const DEFAULT_MAX_PENDING = 100

// The current number of hash operations in progress.
var num_pending = 0

/**  hash - Creates an scrypt hash asynchronously
 *
 * @param {Buffer} input The input for scrypt
 * @param {Buffer} salt The salt for the hash
 * @returns {Object} d.promise Deferred promise
 */
function hash(input, salt, N, r, p, len) {
  var d = P.defer()
  var MAX_PENDING = module.exports.MAX_PENDING
  if (MAX_PENDING > 0 && num_pending > MAX_PENDING) {
    d.reject(new Error('too many pending scrypt hashes'))
  } else {
    num_pending += 1
    scrypt(input, salt, N, r, p, len,
      function (err, hash) {
        num_pending -= 1
        return err ? d.reject(err) : d.resolve(hash.toString('hex'))
      }
    )
  }
  return d.promise
}

module.exports = {
  hash: hash,
  MAX_PENDING: DEFAULT_MAX_PENDING
}
