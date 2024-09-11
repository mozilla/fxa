/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// This module implements logic for managing account verification reminders.
//
// Reminder records are stored in Redis sorted sets on account creation and
// removed when an acount is verified. A separate script, running on the
// fxa-admin box, processes reminder records in a cron job by pulling the
// records that have ticked passed an expiry limit set in config and sending
// the appropriate reminder email to the address associated with each account.
//
// Right now, config determines how many reminder emails are sent and what
// the expiry intervals for them are. Ultimately though, that might be a good
// candidate to control with feature flags.
//
// More detail on sorted sets:
//
// * https://redis.io/topics/data-types#sorted-sets
// * https://redis.io/topics/data-types-intro#redis-sorted-sets

import { props } from 'fxa-shared/lib/promise-extras';

const INTERVAL_PATTERN = /^([a-z]+)Interval$/;
const METADATA_KEY_SUB_FLOW = 'metadata_sub_flow';

/**
 * Initialise the subscriptionAccount reminders module.
 *
 * @param {Object} log
 * @param {Object} config
 * @returns {SubscriptionAccountReminders}
 */
export default (log, config) => {
  if (!config.redis || !config.redis.host) {
    return {
      keys: [],
      async create(uid, flowId, flowBeginTime, deviceId, productId, productName) {
        return {};
      },
      async delete(uid) {
        return {};
      },
      async process() {
        return {};
      },
      async reinstate(key, reminders) {
        return {};
      },
      async close() {},
    };
  }

  const redis = require('./redis')(
    {
      ...config.redis,
      ...config.subscriptionAccountReminders.redis,
      enabled: true,
    },
    log
  );

  const { rolloutRate } = config.subscriptionAccountReminders;

  const { keys, intervals } = Object.entries(
    config.subscriptionAccountReminders
  ).reduce(
    ({ keys, intervals }, [key, value]) => {
      const matches = INTERVAL_PATTERN.exec(key);
      if (matches && matches.length === 2) {
        const key = matches[1];

        if (key === METADATA_KEY_SUB_FLOW) {
          throw new Error('Invalid subscriptionAccount reminder key found in config');
        }

        keys.push(key);
        intervals[key] = value;
      }
      return { keys, intervals };
    },
    { keys: [], intervals: {} }
  );

  /**
   * @typedef {Object} SubscriptionAccountReminders
   * @property {Array} keys
   * @property {Function} create
   * @property {Function} delete
   * @property {Function} process
   *
   * Each method below returns a promise that resolves to an object,
   * the shape of which is determined by config. If config has settings
   * for `firstInterval` and `secondInterval` (as at time of writing),
   * the shape of those objects would be `{ first, second }`.
   */
  return {
    keys: keys.slice(),

    /**
     * Create subscriptionAccount reminder records for an account.
     *
     * @param {String} uid
     * @param {String} [flowId]
     * @param {String} [flowBeginTime]
     * @returns {Promise} - Each property on the resolved object will be the number
     *                      of elements added to that sorted set, i.e. the result of
     *                      [`redis.zadd`](https://redis.io/commands/zadd).
     */
    async create(uid, flowId, flowBeginTime, deviceId, productId, productName,now = Date.now()) {
      try {
        if (rolloutRate <= 1 && Math.random() < rolloutRate) {
          const result = await props(
            keys.reduce((result, key) => {
              result[key] = redis.zadd(key, now, uid);
              return result;
            }, {})
          );
          if (flowId && flowBeginTime && deviceId && productId && productName) {
            await redis.set(
              `${METADATA_KEY_SUB_FLOW}:${uid}`,
              JSON.stringify([flowId, flowBeginTime, deviceId, productId, productName])
            );
          }
          log.info('subscriptionAccountReminders.create', {
            uid,
            flowId,
            flowBeginTime,
          });
          return result;
        }
      } catch (err) {
        log.error('subscriptionAccountReminders.create.error', {
          err,
          uid,
          flowId,
          flowBeginTime,
        });
        throw err;
      }
    },

    /**
     * Delete subscriptionAccount reminder records for an account.
     *
     * @param {String} uid
     * @returns {Promise} - Each property on the resolved object will be the number of
     *                      elements removed from that sorted set, i.e. the result of
     *                      [`redis.zrem`](https://redis.io/commands/zrem).
     */
    async delete(uid) {
      try {
        const result = await props(
          keys.reduce((result, key) => {
            result[key] = redis.zrem(key, uid);
            return result;
          }, {})
        );
        await redis.del(`${METADATA_KEY_SUB_FLOW}:${uid}`);
        log.info('subscriptionAccountReminders.delete', { uid });
        return result;
      } catch (err) {
        log.error('subscriptionAccountReminders.delete.error', { err, uid });
        throw err;
      }
    },

    /**
     * Read and remove all subscriptionAccount reminders that have
     * ticked past the expiry intervals set in config.
     *
     * @returns {Promise} - Each property on the resolved object will be an array of
     *                      { timestamp, uid, flowId, flowBeginTime, deviceId, productId, productName } reminder records
     *                      that have ticked past the relevant expiry interval.
     */
    async process(now = Date.now()) {
      try {
        return await props(
          keys.reduce((result, key, keyIndex) => {
            const cutoff = now - intervals[key];
            result[key] = redis
              .zpoprangebyscore(key, 0, cutoff, 'WITHSCORES')
              .then(async (items) => {
                const reminders = [];
                let index = 0;
                for (const item of items) {
                  if (index % 2 === 0) {
                    const uid = item;
                    let metadata = await redis.get(`${METADATA_KEY_SUB_FLOW}:${uid}`);
                    if (metadata) {
                      const [flowId, flowBeginTime, deviceId, productId, productName] = JSON.parse(metadata);
                      metadata = { flowId, flowBeginTime, deviceId, productId, productName };
                      if (keyIndex === keys.length - 1) {
                        await redis.del(`${METADATA_KEY_SUB_FLOW}:${uid}`);
                      }
                    }
                    reminders.push({ uid, ...metadata });
                  } else {
                    reminders[(index - 1) / 2].timestamp = item;
                  }
                  index++;
                }
                return reminders;
              });
            log.info('subscriptionAccountReminders.process', { key, now, cutoff });
            return result;
          }, {})
        );
      } catch (err) {
        log.error('subscriptionAccountReminders.process.error', { err });
        throw err;
      }
    },

    /**
     * Reinstate failed reminders using their original timestamps.
     * Each reminder item is an object of the form { timestamp, uid }.
     *
     * @param {String} key
     * @param {Array} reminders
     * @returns {Promise} - The number of reminders reinstated to the sorted set.
     */
    async reinstate(key, reminders) {
      try {
        const metadata = [];
        const result = await redis.zadd(
          key,
          ...reminders.reduce((args, reminder) => {
            const { timestamp, uid, flowId, flowBeginTime, deviceId, productId, productName } = reminder;
            args.push(timestamp, uid);
            if (flowId && flowBeginTime && deviceId && productId && productName) {
              metadata.push({ uid, flowId, flowBeginTime, deviceId, productId, productName });
            }
            return args;
          }, [])
        );
        await Promise.all(
          metadata.map(({ uid, flowId, flowBeginTime, deviceId, productId, productName }) => {
            return redis.set(
              `${METADATA_KEY_SUB_FLOW}:${uid}`,
              JSON.stringify([flowId, flowBeginTime, deviceId, productId, productName])
            );
          })
        );
        log.info('subscriptionAccountReminders.reinstate', { key, reminders });
        return result;
      } catch (err) {
        log.error('subscriptionAccountReminders.reinstate.error', { err });
        throw err;
      }
    },

    /**
     * Close the underlying redis connections.
     *
     * @returns {Promise}
     */
    close() {
      return redis.close();
    },
  };
};
