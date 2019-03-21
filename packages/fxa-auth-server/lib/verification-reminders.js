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

/**
 * Initialise the verification reminders module.
 *
 * @param {Object} log
 * @param {Object} config
 * @returns {VerificationReminders}
 */
module.exports = (log, config) => {
  const redis = require('fxa-shared/redis')({
    ...config.redis,
    ...config.verificationReminders.redis,
    enabled: true,
  }, log);

  const { rolloutRate } = config.verificationReminders;

  const { keys, intervals } = Object.entries(config.verificationReminders).reduce(({ keys, intervals }, [ key, value ]) => {
    const matches = INTERVAL_PATTERN.exec(key);
    if (matches && matches.length === 2) {
      const key = matches[1];
      keys.push(key);
      intervals[key] = value;
    }
    return { keys, intervals };
  }, { keys: [], intervals: {} });

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
     * @returns {Promise} - Each property on the resolved object will be the number
     *                      of elements added to that sorted set, i.e. the result of
     *                      [`redis.zadd`](https://redis.io/commands/zadd).
     */
    async create (uid) {
      try {
        if (rolloutRate <= 1 && Math.random() < rolloutRate) {
          const now = Date.now();
          const result = await P.props(keys.reduce((result, key) => {
            result[key] = redis.zadd(key, now, uid);
            return result;
          }, {}));
          log.info('verificationReminders.create', { uid });
          return result;
        }
      } catch (err) {
        log.error('verificationReminders.create.error', { err, uid });
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
    async delete (uid) {
      try {
        const result = await P.props(keys.reduce((result, key) => {
          result[key] = redis.zrem(key, uid);
          return result;
        }, {}));
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
     * @returns {Promise} - Each property on the resolved object will be an array of uids that
     *                      were found to have ticked past the relevant expiry interval, i.e.
     *                      the result of [`redis.zrangebyscore`](https://redis.io/commands/zrangebyscore).
     */
    async process () {
      try {
        const now = Date.now();
        return await P.props(keys.reduce((result, key) => {
          const cutoff = now - intervals[key];
          result[key] = redis.zrangebyscore(key, 0, cutoff);
          setImmediate(async () => {
            await result[key];
            redis.zremrangebyscore(key, 0, cutoff);
          });
          log.info('verificationReminders.process', { key, now, cutoff });
          return result;
        }, {}));
      } catch (err) {
        log.error('verificationReminders.process.error', { err });
        throw err;
      }
    },
  };
};
