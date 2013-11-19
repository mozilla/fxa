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
    var options = {
      host: config.redis.host,
      port: config.redis.port
    }
    if (config.redis.password) {
      options.database = config.redis.database
    }
    if (config.redis.password) {
      options.password = config.redis.password
    }
    this.client = redis.createClient(options)
  }

  RedisNonceDB.connect = function () {
    return (new RedisNonceDB()).connect()
  }

  RedisNonceDB.prototype.connect = function() {
    log.trace({ op: 'RedisNonceDB.connect' })
    return this.client.connect()
      .then(
        function (res) {
          log.trace({ op: 'RedisNonceDB.connect.1' })
          return this
        }.bind(this)
      )
  }

  RedisNonceDB.prototype.checkAndSetNonce = function(nonce, ttl) {
    log.trace({ op: 'RedisNonceDB.checkAndSetNonce', nonce: nonce })
    // The redis promises don't seem compatible with our own..?
    var d = P.defer()
    // Use a set-if-not-exists to check and set the key in a single call.
    var key = "NONCEDB:" + nonce
    this.client.set(key, '', 'EX', ttl, 'NX')
      .then(
        function(res) {
          log.trace({
            op: 'RedisNonceDB.checkAndSetNonce.1',
            nonce: nonce,
            res: res
          })
          if (res === 'OK') {
            d.resolve()
          } else {
            d.reject('duplicate nonce')
          }
        }
      )
    return d.promise
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
      d.resolve()
    }
    return d.promise
  }


  // Pick the most appropriate implementation based on current app config.

  if (config.redis && config.redis.host) {
    return RedisNonceDB
  } else {
    if (config.env === 'production') {
      log.warn('using in-memory nonce db; this is likely not suitable for production')
    }
    return MemoryNonceDB
  }
}
