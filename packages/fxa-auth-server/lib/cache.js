/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const crypto = require('crypto')
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
     * Delete data from the cache, keyed by a hash of
     * `token.uid` and `token.id`. Fails silently if
     * the cache is not enabled.
     *
     * @param token
     */
    del (token) {
      return getCache()
        .then(cache => cache.delAsync(getKey(token)))
    },

    /**
     * Fetch data from the cache, keyed by a hash of
     * `token.uid` and `token.id`. Fails silently if
     * the cache is not enabled.
     *
     * @param token
     */
    get (token) {
      return getCache()
        .then(cache => cache.getAsync(getKey(token)))
    },

    /**
     * Fetch data from the cache, keyed by a hash of
     * `token.uid` and `token.id`. Fails silently if
     * the cache is not enabled.
     *
     * @param token
     * @param data
     */
    set (token, data) {
      return getCache()
        .then(cache => cache.setAsync(getKey(token), data, CACHE_LIFETIME))
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

function getKey (token) {
  if (! token || ! token.uid || ! token.id) {
    const err = new Error('Invalid token')
    throw err
  }

  const hash = crypto.createHash('sha256')
  hash.update(token.uid)
  hash.update(token.id)

  return hash.digest('base64')
}

