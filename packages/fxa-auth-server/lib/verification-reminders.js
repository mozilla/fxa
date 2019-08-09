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

'use strict';

const P = require('./promise');

const INTERVAL_PATTERN = /^([a-z]+)Interval$/;
const METADATA_KEY = 'metadata';

/**
 * Initialise the verification reminders module.
 *
 * @param {Object} log
 * @param {Object} config
 * @returns {VerificationReminders}
 */
module.exports = (log, config) => {
  const redis = require('../../fxa-shared/redis')(
    {
      ...config.redis,
      ...config.verificationReminders.redis,
      enabled: true,
    },
    log
  );

  const { rolloutRate } = config.verificationReminders;

  const { keys, intervals } = Object.entries(
    config.verificationReminders
  ).reduce(
    ({ keys, intervals }, [key, value]) => {
      const matches = INTERVAL_PATTERN.exec(key);
      if (matches && matches.length === 2) {
        const key = matches[1];

        if (key === METADATA_KEY) {
          throw new Error('Invalid verification reminder key found in config');
        }

        keys.push(key);
        intervals[key] = value;
      }
      return { keys, intervals };
    },
    { keys: [], intervals: {} }
  );

  /**
   * @typedef {Object} VerificationReminders
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
     * Create verification reminder records for an account.
     *
     * @param {String} uid
     * @param {String} [flowId]
     * @param {String} [flowBeginTime]
     * @returns {Promise} - Each property on the resolved object will be the number
     *                      of elements added to that sorted set, i.e. the result of
     *                      [`redis.zadd`](https://redis.io/commands/zadd).
     */
    async create(uid, flowId, flowBeginTime) {
      try {
        if (rolloutRate <= 1 && Math.random() < rolloutRate) {
          const now = Date.now();
          const result = await P.props(
            keys.reduce((result, key) => {
              result[key] = redis.zadd(key, now, uid);
              return result;
            }, {})
          );
          if (flowId && flowBeginTime) {
            await redis.set(
              `${METADATA_KEY}:${uid}`,
              JSON.stringify([flowId, flowBeginTime])
            );
          }
          log.info('verificationReminders.create', {
            uid,
            flowId,
            flowBeginTime,
          });
          return result;
        }
      } catch (err) {
        log.error('verificationReminders.create.error', {
          err,
          uid,
          flowId,
          flowBeginTime,
        });
        throw err;
      }
    },

    /**
     * Delete verification reminder records for an account.
     *
     * @param {String} uid
     * @returns {Promise} - Each property on the resolved object will be the number of
     *                      elements removed from that sorted set, i.e. the result of
     *                      [`redis.zrem`](https://redis.io/commands/zrem).
     */
    async delete(uid) {
      try {
        const result = await P.props(
          keys.reduce((result, key) => {
            result[key] = redis.zrem(key, uid);
            return result;
          }, {})
        );
        await redis.del(`${METADATA_KEY}:${uid}`);
        log.info('verificationReminders.delete', { uid });
        return result;
      } catch (err) {
        log.error('verificationReminders.delete.error', { err, uid });
        throw err;
      }
    },

    /**
     * Read and remove all verification reminders that have
     * ticked past the expiry intervals set in config.
     *
     * @returns {Promise} - Each property on the resolved object will be an array of
     *                      { timestamp, uid, flowId, flowBeginTime } reminder records
     *                      that have ticked past the relevant expiry interval.
     */
    async process() {
      try {
        const now = Date.now();
        return await P.props(
          keys.reduce((result, key, keyIndex) => {
            const cutoff = now - intervals[key];
            result[key] = redis
              .zpoprangebyscore(key, 0, cutoff, 'WITHSCORES')
              .reduce(async (reminders, item, index) => {
                if (index % 2 === 0) {
                  const uid = item;
                  let metadata = await redis.get(`${METADATA_KEY}:${uid}`);
                  if (metadata) {
                    const [flowId, flowBeginTime] = JSON.parse(metadata);
                    metadata = { flowId, flowBeginTime };
                    if (keyIndex === keys.length - 1) {
                      await redis.del(`${METADATA_KEY}:${uid}`);
                    }
                  }
                  reminders.push({ uid, ...metadata });
                } else {
                  reminders[(index - 1) / 2].timestamp = item;
                }
                return reminders;
              }, []);
            log.info('verificationReminders.process', { key, now, cutoff });
            return result;
          }, {})
        );
      } catch (err) {
        log.error('verificationReminders.process.error', { err });
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
            const { timestamp, uid, flowId, flowBeginTime } = reminder;
            args.push(timestamp, uid);
            if (flowId && flowBeginTime) {
              metadata.push({ uid, flowId, flowBeginTime });
            }
            return args;
          }, [])
        );
        await P.all(
          metadata.map(({ uid, flowId, flowBeginTime }) => {
            return redis.set(
              `${METADATA_KEY}:${uid}`,
              JSON.stringify([flowId, flowBeginTime])
            );
          })
        );
        log.info('verificationReminders.reinstate', { key, reminders });
        return result;
      } catch (err) {
        log.error('verificationReminders.reinstate.error', { err });
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
