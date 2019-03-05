/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

const FLAGS_KEY = 'current';
const FLAGS_PREFIX = 'featureFlags:';

module.exports = initialise;

/**
 * Initialise the Redis feature-flagging implementation.
 *
 * @param {Object} config - Configuration parameters
 * @param {String} config.host - Redis host name or IP address
 * @param {Number} config.port - Redis port
 * @param {Number} config.maxConnections - Maximum number of connections in Redis pool
 * @param {Number} config.maxPending - Maximum number of clients waiting for a connection
 * @param {Number} config.minConnections - Minimum number of clients in Redis pool
 * @param {Object} log - Logging interface
 *
 * @returns {FeatureFlags}
 */
function initialise (config, log) {
  const redis = require('../redis')({
    ...config,
    enabled: true,
    prefix: FLAGS_PREFIX,
  }, log);

  /**
   * @typedef {Object} FeatureFlags
   *
   * @property {Function} get
   */
  return { get };

  /**
   * Get the current state for all experiments.
   *
   * @returns {Promise}
   */
  async function get (iteration = 0) {
    return JSON.parse(await redis.get(FLAGS_KEY));
  }
}
