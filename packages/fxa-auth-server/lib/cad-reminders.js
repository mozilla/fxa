/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// This module implements logic for managing account cad (connect another device) reminders.
//
// Similar to account verification reminders, Connect another device (CAD) reminders are
// stored in sorted sets in redis.
//
// More detail on sorted sets:
//
// * https://redis.io/topics/data-types#sorted-sets
// * https://redis.io/topics/data-types-intro#redis-sorted-sets
'use strict';

const redis = require('./redis');
const P = require('./promise');

// The config file determines the number of intervals. Ex `firstInterval` is stored
// in set called `first`.
const INTERVAL_PATTERN = /^([a-z]+)Interval$/;

class CadReminders {
  constructor(config, log) {
    this.redis = redis(
      {
        ...config.redis,
        ...config.cadReminders.redis,
        enabled: true,
      },
      log
    );
    this.log = log;
    this.rolloutRate = config.cadReminders.rolloutRate;
    const { keys, intervals } = this.parseIntervals(config);
    this.keys = keys;
    this.intervals = intervals;
  }

  parseIntervals(config) {
    return Object.entries(config.cadReminders).reduce(
      ({ keys, intervals }, [key, value]) => {
        const matches = INTERVAL_PATTERN.exec(key);
        if (matches && matches.length === 2) {
          const key = matches[1];
          keys.push(key);
          intervals[key] = value;
        }
        return { keys, intervals };
      },
      { keys: [], intervals: {} }
    );
  }

  /**
   * Create cad reminder records for an account.
   *
   * @param {String} uid
   * @returns {Promise} - Each property on the resolved object will be the number
   *                      of elements added to that sorted set, i.e. the result of
   *                      [`redis.zadd`](https://redis.io/commands/zadd).
   */
  async create(uid) {
    try {
      if (this.rolloutRate <= 1 && Math.random() < this.rolloutRate) {
        const now = Date.now();
        const result = await P.props(
          this.keys.reduce((result, key) => {
            result[key] = this.redis.zadd(key, now, uid);
            return result;
          }, {})
        );
        this.log.info('cadReminders.create', {
          uid,
        });
        return result;
      }
    } catch (err) {
      this.log.error('cadReminders.create.error', {
        err,
        uid,
      });
      throw err;
    }
  }

  /**
   * Deletes cad reminder records for an account.
   *
   * @param {String} uid
   * @returns {Promise} - Each property on the resolved object will be the number
   *                      of elements added to that sorted set, i.e. the result of
   *                      [`redis.zadd`](https://redis.io/commands/zrem).
   */
  async delete(uid) {
    try {
      const result = await P.props(
        this.keys.reduce((result, key) => {
          result[key] = this.redis.zrem(key, uid);
          return result;
        }, {})
      );
      this.log.info('cadReminders.delete', {
        uid,
      });
      return result;
    } catch (err) {
      this.log.error('cadReminders.delete.error', {
        err,
        uid,
      });
      throw err;
    }
  }

  /**
   * Gets cad reminder records for an account.
   *
   * @param {String} uid
   * @returns {Promise} - Each property on the resolved object will be the number
   *                      of elements added to that sorted set, i.e. the result of
   *                      [`redis.zadd`](https://redis.io/commands/zrank).
   */
  async get(uid) {
    try {
      this.log.info('cadReminders.get', {
        uid,
      });
      return await P.props(
        this.keys.reduce((result, key) => {
          result[key] = this.redis.zrank(key, uid);
          return result;
        }, {})
      );
    } catch (err) {
      this.log.error('cadReminders.get.error', {
        err,
        uid,
      });
      throw err;
    }
  }

  /**
   * Read and remove all reminders that have
   * ticked past the expiry intervals set in config.
   *
   * @returns {Promise} - Each property on the resolved object will be an array of
   *                      { timestamp, uid } reminder records
   *                      that have ticked past the relevant expiry interval.
   */
  async process() {
    try {
      const now = Date.now();
      return await P.props(
        this.keys.reduce((result, key) => {
          const cutoff = now - this.intervals[key];
          result[key] = this.redis
            .zpoprangebyscore(key, 0, cutoff, 'WITHSCORES')
            .then(async (items) => {
              const reminders = [];
              let index = 0;
              for (const item of items) {
                if (index % 2 === 0) {
                  const uid = item;
                  reminders.push({ uid });
                } else {
                  reminders[(index - 1) / 2].timestamp = item;
                }
                index++;
              }
              return reminders;
            });
          this.log.info('cadReminders.process', { key, now, cutoff });
          return result;
        }, {})
      );
    } catch (err) {
      this.log.error('cadReminders.process.error', { err });
      throw err;
    }
  }

  /**
   * Close the underlying redis connections.
   *
   * @returns {Promise}
   */
  close() {
    return this.redis.close();
  }
}

module.exports = (config, log) => {
  return new CadReminders(config, log);
};
