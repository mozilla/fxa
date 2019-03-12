/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

const Promise = require('../promise');

// Redis command reference: https://redis.io/commands
const SUPPORTED_COMMANDS = [
  // Basic operations
  'get', 'set', 'del',
  // Sorted sets: https://redis.io/topics/data-types-intro#redis-sorted-sets
  'zadd', 'zrange', 'zrangebyscore', 'zrem', 'zremrangebyscore', 'zrevrange', 'zrevrangebyscore'
];

module.exports = {
  methods: SUPPORTED_COMMANDS.concat('update'),

  create (log, client) {
    let isUpdating = false;
    let destroyPromise;

    return {
      ...SUPPORTED_COMMANDS.reduce((object, command) => {
        object[command] = (...args) => client[`${command}Async`](...args);
        return object;
      }, {}),

      /**
       * To ensure safe update semantics in the presence of concurrency,
       * we lean on Redis' WATCH, MULTI and EXEC commands so that updates
       * run as a transaction and will fail if the data changes underneath
       * them. You can read more about this in the Redis docs:
       *
       *   https://redis.io/topics/transactions
       *
       * @param key {String} The key to update
       * @param getUpdatedValue {Function} A callback that receives the current value
       *                                   and returns the updated value. May return a
       *                                   promise or the raw updated value.
       */
      async update (key, getUpdatedValue) {
        if (isUpdating) {
          log.error('redis.update.conflict', { key });
          throw new Error('redis.update.conflict');
        }

        let result;
        isUpdating = true;

        try {
          await client.watchAsync(key);

          const value = await getUpdatedValue(await client.getAsync(key));
          const multi = client.multi();

          if (value) {
            multi.set(key, value);
          } else {
            multi.del(key);
          }

          result = await multi.execAsync();
        } catch (error) {
          client.unwatch();
          log.error('redis.update.error', { key, error: error.message });
          isUpdating = false;
          throw error;
        }

        isUpdating = false;
        if (! result) {
          // Really this isn't an error as such, it just indicates that
          // this function is operating sanely in concurrent conditions.
          log.warn('redis.watch.conflict', { key });
          throw new Error('redis.watch.conflict');
        }
      },

      destroy () {
        if (! destroyPromise) {
          destroyPromise = new Promise(resolve => {
            client.quit();
            client.on('end', resolve);
          });
        }

        return destroyPromise;
      },

      isValid () {
        return ! destroyPromise;
      }
    };
  },
};
