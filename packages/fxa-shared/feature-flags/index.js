/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = initialise;

/**
 * Initialise the feature-flag module.
 *
 * @param {Object} config                Configuration object.
 *
 * @param {String} config.implementation Underlying implementation, loaded with `require`.
 *
 * @param {Number} config.interval       Refresh interval, in milliseconds.
 *
 * @param {Object} config                Log object.
 *
 * @param {Object} [defaults]            Default experiment state to return in the event of error.
 *                                       If not set, calls to FeatureFlags.get may fail.
 *
 * @returns {FeatureFlags}
 */
function initialise (config, log, defaults) {
  const implementation = require(`./${config.implementation}`)(config[config.implementation], log);
  const { interval } = config;

  if (! (interval > 0 && interval < Infinity)) {
    throw new TypeError('Invalid interval');
  }

  if (! log) {
    throw new TypeError('Missing log argument');
  }

  let cache, timeout;

  refresh();

  /**
   * @typedef {Object} FeatureFlags
   *
   * @property {Function} get
   *
   * @property {Function} terminate
   */
  return { get, terminate };

  async function refresh () {
    try {
      if (cache) {
        // Prevent latency during refresh by keeping the old cached result
        // until the refreshed promise has actually resolved.
        const temp = await implementation.get();
        cache = Promise.resolve(temp);
      } else {
        cache = implementation.get();
        // The positioning of `await` is deliberate here.
        // The initial value of `cache` must be a promise
        // so that callers can access it uniformly.
        // But we don't want `setTimeout` to be invoked
        // until after that promise has completed.
        await cache;
      }
    } catch (error) {
    }

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
  async function get () {
    try {
      return await cache;
    } catch (error) {
      if (defaults) {
        return defaults;
      }

      throw error;
    }
  }

  /**
   * Terminate the refresh loop.
   * Useful for e.g. terminating tests cleanly.
   */
  function terminate () {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  }
}
