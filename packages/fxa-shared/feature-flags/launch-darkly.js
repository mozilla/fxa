/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const request = require('request-promise');

const BASE_URI = 'https://app.launchdarkly.com/api/v2/flags';
const { NODE_ENV: ENV } = process.env;
const RETRY_LIMIT = 3;
const PERMANENT_ERRORS = new Set([ 400, 401, 409 ]);

module.exports = initialise;

/**
 * Initialise the LaunchDarkly implementation.
 *
 * API docs: https://apidocs.launchdarkly.com/v2.0/docs
 *
 * @param {Object} config
 * @param {String} config.accessToken
 * @param {String} config.projectKey
 * @param {Object} config.redis
 * @param {Boolean} config.redis.enabled
 * @param {String} config.redis.host
 * @param {Number} config.redis.port
 * @param {String} config.redis.prefix
 *
 * @returns {FeatureFlags}
 */
function initialise (config) {
  const { accessToken: ACCESS_TOKEN } = config;
  const FLAGS_URL = `${BASE_URI}/${config.projectKey}?env=${ENV}`;

  if (config.redis.enabled) {
    // TODO: set up redis
    // TODO: move this up a level if it turns out we have to
    //       do it manually for each implementation
  }

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
    try {
      return JSON.parse(
        await request(FLAGS_URL, {
          simple: true,
          method: 'GET',
          headers: {
            authorization: ACCESS_TOKEN
          }
        })
      ).items.reduce(reduceFlags, {});
    } catch (response) {
      const { statusCode } = response;

      if (iteration === RETRY_LIMIT || PERMANENT_ERRORS.has(statusCode)) {
        throw response;
      }

      if (statusCode === 429) {
        let backoff = parseInt(response.headers['retry-after']) * 1000;
        if (isNaN(backoff)) {
          backoff = parseInt(response.headers['x-ratelimit-reset']) - Date.now();
        }

        if (backoff > 0) {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              get(iteration + 1)
                .then(resolve, reject);
            }, backoff);
          });
        }
      }

      return get(iteration + 1);
    }
  }
}

function reduceFlags (flags, flag) {
  const variations = flag.variations.map(({ value }) => {
    try {
      if (typeof value === 'string') {
        return JSON.parse(value);
      }
    } catch (error) {
    }

    return value;
  });
  // XXX: This doesn't work where there is more than one variation
  // XXX: This doesn't work if the default variation is changed in the LaunchDarkly UI
  flags[flag.key] = flag.environments[ENV].on ? variations[0] : variations[1];
  return flags;
}
