/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const crypto = require('crypto');
const P = require('../promise');

// Magic numbers from the node crypto docs:
// https://nodejs.org/api/crypto.html#crypto_crypto_scrypt_password_salt_keylen_options_callback
const DEFAULT_N = 16384;
const DEFAULT_R = 8;
const MAXMEM_MULTIPLIER = 256;
const DEFAULT_MAXMEM = MAXMEM_MULTIPLIER * DEFAULT_N * DEFAULT_R;

// The maximum numer of hash operations allowed concurrently.
// This can be customized by setting the `maxPending` attribute on the
// exported object, or by setting the `scrypt.maxPending` config option.
const DEFAULT_MAX_PENDING = 100;

module.exports = function(log, config) {
  const scrypt = {
    hash: hash,
    // The current number of hash operations in progress.
    numPending: 0,
    // The high-water-mark on number of hash operations in progress.
    numPendingHWM: 0,
    // The maximum number of hash operations that may be in progress.
    maxPending: DEFAULT_MAX_PENDING,
  };
  if (config.scrypt && config.scrypt.hasOwnProperty('maxPending')) {
    scrypt.maxPending = config.scrypt.maxPending;
  }

  /**  hash - Creates an scrypt hash asynchronously
   *
   * @param {Buffer} input The input for scrypt
   * @param {Buffer} salt The salt for the hash
   * @returns {Object} d.promise Deferred promise
   */
  function hash(input, salt, N, r, p, len) {
    const d = P.defer();
    if (scrypt.maxPending > 0 && scrypt.numPending > scrypt.maxPending) {
      log.warn('scrypt.maxPendingExceeded');
      d.reject(new Error('too many pending scrypt hashes'));
    } else {
      scrypt.numPending += 1;
      if (scrypt.numPending > scrypt.numPendingHWM) {
        scrypt.numPendingHWM = scrypt.numPending;
      }
      let maxmem = DEFAULT_MAXMEM;
      if (N > DEFAULT_N || r > DEFAULT_R) {
        // Conservatively prevent `memory limit exceeded` errors. See the docs for more info:
        // https://nodejs.org/api/crypto.html#crypto_crypto_scrypt_password_salt_keylen_options_callback
        maxmem = MAXMEM_MULTIPLIER * (N || DEFAULT_N) * (r || DEFAULT_R);
      }
      crypto.scrypt(input, salt, len, { N, r, p, maxmem }, (err, hash) => {
        scrypt.numPending -= 1;
        return err ? d.reject(err) : d.resolve(hash.toString('hex'));
      });
    }
    return d.promise;
  }

  return scrypt;
};
