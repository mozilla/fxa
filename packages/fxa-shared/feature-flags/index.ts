/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

import Redis from 'ioredis';

const FLAGS_PREFIX = 'featureFlags:';
const FLAGS_KEY = 'current';

/**
 * Initialise the feature-flag module.
 *
 * @param {Object} config - Configuration object.
 * @param {Object} config.interval - Refresh interval.
 * @param {Object} [config.redis] - Redis config.
 * @param {String} [config.redis.host] - Redis host name or IP address.
 * @param {Number} [config.redis.port] - Redis port.
 * @param {Number} [config.redis.maxConnections] - Maximum number of connections in Redis pool.
 * @param {Number} [config.redis.maxPending] - Maximum number of clients waiting for a connection.
 * @param {Number} [config.redis.minConnections] - Minimum number of clients in Redis pool.
 *
 * @param {Object} log - Log object.
 *
 * @param {Object} [defaults] - Default experiment state to return in the event of error.
 *                              If not set, calls to FeatureFlags.get may fail.
 *
 * @returns {FeatureFlags}
 */
export default function initialise(config: any, log: any, defaults: any) {
  const { interval, redis: redisConfig } = config;

  if (!(interval > 0 && interval < Infinity)) {
    throw new TypeError('Invalid interval');
  }

  if (!log) {
    throw new TypeError('Missing log argument');
  }

  const redis = new Redis({
    ...redisConfig,
    keyPrefix: FLAGS_PREFIX,
  });

  let cache: Promise<any> | undefined;
  let timeout: NodeJS.Timeout | undefined;

  refresh();

  /**
   * @typedef {Object} FeatureFlags
   *
   * @property {Function} get
   *
   * @property {Function} terminate
   */
  return { get, terminate };

  async function refresh() {
    try {
      if (cache) {
        // Eliminate any latency during refresh by keeping the old cached result
        // until the refreshed promise has actually resolved.
        const result = await redis.get(FLAGS_KEY);
        if (result) {
          // eslint-disable-next-line require-atomic-updates
          cache = Promise.resolve(JSON.parse(result));
        }
      } else {
        cache = redis.get(FLAGS_KEY).then((result: any) => JSON.parse(result));
        // The positioning of `await` is deliberate here.
        // The initial value of `cache` must be a promise
        // so that callers can access it uniformly.
        // But we don't want `setTimeout` to be invoked
        // until after that promise has completed.
        await cache;
      }
    } catch (error) {}

    timeout = setTimeout(refresh, interval);
  }

  /**
   * Get the current state for all experiments.
   * Asynchronous, but returns the cached state
   * so it doesn't add latency,
   * except during initialisation.
   *
   * @returns {Promise}
   */
  async function get() {
    try {
      return (await cache) || defaults || {};
    } catch (error) {
      if (defaults) {
        return defaults;
      }

      throw error;
    }
  }

  /**
   * Terminate the refresh loop
   * and close all redis connections.
   * Useful for e.g. terminating tests cleanly.
   *
   * @returns {Promise}
   */
  function terminate() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }

    return redis.quit();
  }
}
