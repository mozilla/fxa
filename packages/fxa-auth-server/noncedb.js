/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('p-promise')
var redis = require('then-redis')

/*  An abstract DB for checking nonce re-use.
 *
 *  This module will check for the presence of a 'redis' key in the config
 *  and use that if available.  If not then it logs a warning and falls back
 *  to a simple in-memory storage.
 *
 */

module.exports = function (config, log, now) {

  if (typeof now === 'undefined') {
    now = Date.now
  }

  // A redis-based NonceDB.
  //
  // Stores each seen nonces as a key with appropriate expiration time.
  // Checks for re-use by just querying the key.

  function RedisNonceDB() {
    throw 'RedisNonceDB is not implemented yet'
  }

  RedisNonceDB.connect = function () {
    return P(new RedisNonceDB())
  }

  RedisNonceDB.prototype.checkAndSetNonce = function(nonce, ttl) {
    throw 'no really, RedisNonceDB is not implemented yet'
  }
  

  // An in-memory NonceDB.
  //
  // Stores seen nonces in a hash in local process memory.
  // Easy to get up and running, but not for production.

  function MemoryNonceDB() {
    // Map of nonce -> expTime, for easy lookup.
    this.nonces = {}
    // Sorted list of [expTime, nonce] pairs.
    // A proper implementation would use a heap here, to get O(log(n))
    // insertion and deletion.  But whatevz; this ain't for production.
    this.nonces_by_exp = []
  }

  MemoryNonceDB.connect = function () {
    return P(new MemoryNonceDB())
  }

  MemoryNonceDB.prototype.checkAndSetNonce = function(nonce, ttl) {
    var d = P.defer()
    // Purge expired items from head of list.
    var curTime = now() / 1000
    while (this.nonces_by_exp.length && this.nonces_by_exp[0][0] < curTime) {
      var expired = this.nonces_by_exp.shift()
      delete this.nonces[expired[1]]
    }
    // Check if we've seen this nonce before.
    if (this.nonces[nonce]) {
      d.reject('duplicate nonce')
    } else {
      // Store the newly-seen nonce for future reference.
      // In theory, the insertion pos should be near the end of the array.
      var expTime = curTime + ttl
      var item = [expTime, nonce]
      var pos = this.nonces_by_exp.length
      while (pos > 0 && this.nonces_by_exp[pos - 1] > item) {
        pos++
      }
      this.nonces_by_exp.splice(pos, 0, item)
      this.nonces[nonce] = expTime
      d.resolve(true)
    }
    return d.promise
  }


  // Pick the most appropriate implementation based on current app config.

  if (config.redis && config.redis.host) {
    return RedisNonceDB
  } else {
    if (config.env === 'production') {
        throw 'in-memory nonce db is not suitable for production use'
    }
    log.warn('using in-memory nonce db')
    return MemoryNonceDB
  }
}
