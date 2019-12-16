/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Memcached = require('memcached');
const P = require('./promise');

P.promisifyAll(Memcached.prototype);

const NOP = () => P.resolve();
const NULL_CACHE = {
  addAsync: NOP,
  delAsync: NOP,
  getAsync: NOP,
};

module.exports = (log, config, namespace) => {
  let _cache;

  const CACHE_ADDRESS = config.memcached.address;
  const CACHE_IDLE = config.memcached.idle;
  const CACHE_LIFETIME = config.memcached.lifetime;

  return {
    /**
     * Add data to the cache, keyed by a string.
     * If the key already exists,
     * the call will fail.
     *
     * Fails silently if the cache is not enabled.
     *
     * @param {string} key
     * @param data
     */
    async add(key, data) {
      const cache = await getCache();
      return await cache.addAsync(key, data, CACHE_LIFETIME);
    },

    /**
     * Delete data from the cache, keyed by a string.
     *
     * Fails silently if the cache is not enabled.
     *
     * @param {string} key
     */
    async del(key) {
      const cache = await getCache();
      return await cache.delAsync(key);
    },

    /**
     * Fetch data from the cache, keyed by a string.
     *
     * Fails silently if the cache is not enabled.
     *
     * @param {string} key
     */
    async get(key) {
      const cache = await getCache();
      return await cache.getAsync(key);
    },
  };

  async function getCache() {
    try {
      if (_cache) {
        return _cache;
      }

      if (CACHE_ADDRESS === 'none') {
        _cache = NULL_CACHE;
      } else {
        _cache = new Memcached(CACHE_ADDRESS, {
          timeout: 500,
          retries: 1,
          retry: 1000,
          reconnect: 1000,
          idle: CACHE_IDLE,
          namespace,
        });
      }
      return _cache;
    } catch (err) {
      log.error('cache.getCache', { err: err });
      return NULL_CACHE;
    }
  }
};
