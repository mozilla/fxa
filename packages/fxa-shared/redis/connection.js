/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

const Promise = require('../promise');

// Redis command reference: https://redis.io/commands
const SUPPORTED_COMMANDS = [
  // Basic operations
  'get',
  'set',
  'del',
  // Sorted sets: https://redis.io/topics/data-types-intro#redis-sorted-sets
  'zadd',
  'zrange',
  'zrangebyscore',
  'zrem',
  'zrevrange',
  'zrevrangebyscore',
];

module.exports = {
  methods: SUPPORTED_COMMANDS.concat('update', 'zpoprangebyscore'),

  create(log, client) {
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
      async update(key, getUpdatedValue) {
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
          // eslint-disable-next-line require-atomic-updates
          isUpdating = false;
          throw error;
        }

        // eslint-disable-next-line require-atomic-updates
        isUpdating = false;
        if (! result) {
          // Really this isn't an error as such, it just indicates that
          // this function is operating sanely in concurrent conditions.
          log.warn('redis.watch.conflict', { key });
          throw new Error('redis.watch.conflict');
        }
      },

      /**
       * To ensure safe range semantics in the presence of concurrency,
       * we lean on Redis' MULTI and EXEC commands so that ranges can be
       * popped atomically. It is impossible for any concurrent operation
       * to pop the same records as long as clients use this method.
       *
       * In addition to the named parameters below, there are optional
       * args for offset, count and including scores in the result.
       * Read the `zrangebyscore` docs for more information:
       *
       *   https://redis.io/commands/zrangebyscore
       *
       * @param key {String} The key for the sorted set
       * @param min {Number} The minimum score to include in the popped range.
       * @param max {Number} The maximum score to include in the popped range.
       * @param [withScores] {Boolean} Whether to include scores in the popped ranges.
       * @returns {Promise} Resolves to the popped range.
       */
      async zpoprangebyscore(key, min, max, withScores) {
        const multi = client.multi();

        const args = [key, min, max];
        if (withScores) {
          args.push('WITHSCORES');
        }
        multi.zrangebyscore(...args);
        multi.zremrangebyscore(key, min, max);

        const results = await multi.execAsync();
        return results[0];
      },

      destroy() {
        if (! destroyPromise) {
          destroyPromise = new Promise(resolve => {
            client.quit();
            client.on('end', resolve);
          });
        }

        return destroyPromise;
      },

      isValid() {
        return ! destroyPromise;
      },
    };
  },
};
