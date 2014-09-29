/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('../promise')
var scrypt_hash = require('scrypt-hash')
 
// The maximum numer of hash operations allowed concurrently.
// This can be customized by setting the `max_pending` attribute
// on the exported object.
const DEFAULT_MAX_PENDING = 100

module.exports = function(log, config) {

  var scrypt = {
    hash: hash,
    // The current number of hash operations in progress.
    num_pending: 0,
     // The maximum number of hash operations that may be in progress.
    max_pending: DEFAULT_MAX_PENDING
  }

  /**  hash - Creates an scrypt hash asynchronously
   *
   * @param {Buffer} input The input for scrypt
   * @param {Buffer} salt The salt for the hash
   * @returns {Object} d.promise Deferred promise
   */
  function hash(input, salt, N, r, p, len) {
    var d = P.defer()
    if (scrypt.max_pending > 0 && scrypt.num_pending > scrypt.max_pending) {
      d.reject(new Error('too many pending scrypt hashes'))
    } else {
      scrypt.num_pending += 1
      scrypt_hash(input, salt, N, r, p, len,
        function (err, hash) {
          scrypt.num_pending -= 1
          return err ? d.reject(err) : d.resolve(hash.toString('hex'))
        }
      )
    }
    return d.promise
  }

  return scrypt
}
