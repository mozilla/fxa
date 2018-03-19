/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const Memcached = require('memcached')
const P = require('./promise')

P.promisifyAll(Memcached.prototype)

const NOP = () => P.resolve()
const NULL_CACHE = {
  delAsync: NOP,
  getAsync: NOP,
  setAsync: NOP
}

module.exports = (log, config, namespace) => {
  let _cache

  const CACHE_ADDRESS = config.memcached.address
  const CACHE_IDLE = config.memcached.idle
  const CACHE_LIFETIME = config.memcached.lifetime

  return {
    /**
     * Delete data from the cache, keyed by a string.
     *
     * Fails silently if the cache is not enabled.
     *
     * @param {string} key
     */
    del (key) {
      return getCache()
        .then(cache => cache.delAsync(key))
    },

    /**
     * Fetch data from the cache, keyed by a string.
     *
     * Fails silently if the cache is not enabled.
     *
     * @param {string} key
     */
    get (key) {
      return getCache()
        .then(cache => cache.getAsync(key))
    },

    /**
     * Fetch data from the cache, keyed by a string.
     *
     * Fails silently if the cache is not enabled.
     *
     * @param {string} key
     * @param data
     */
    set (key, data) {
      return getCache()
        .then(cache => cache.setAsync(key, data, CACHE_LIFETIME))
    }
  }

  function getCache () {
    return P.resolve()
      .then(() => {
        if (_cache) {
          return _cache
        }

        if (CACHE_ADDRESS === 'none') {
          _cache = NULL_CACHE
        } else {
          _cache = new Memcached(CACHE_ADDRESS, {
            timeout: 500,
            retries: 1,
            retry: 1000,
            reconnect: 1000,
            idle: CACHE_IDLE,
            namespace
          })
        }

        return _cache
      })
      .catch(err => {
        log.error({ op: 'cache.getCache', err: err })
        return NULL_CACHE
      })
  }
}
