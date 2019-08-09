/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

const error = require('./error');

module.exports = (config, log) => {
  const redis = require('../../fxa-shared/redis')(config, log);
  if (!redis) {
    return;
  }

  return Object.entries(redis).reduce((object, [key, value]) => {
    if (typeof value === 'function') {
      object[key] = async (...args) => {
        try {
          return await value(...args);
        } catch (err) {
          if (err.message === 'redis.watch.conflict') {
            // This error is nothing to worry about, just a sign that our
            // protection against concurrent updates is working correctly.
            // fxa-shared is responsible for logging.
            throw error.redisConflict();
          }

          // If you see this line in a stack trace in Sentry
          // it means something unexpected has really occurred.
          // fxa-shared is responsible for logging.
          throw error.unexpectedError();
        }
      };
    } else {
      object[key] = value;
    }

    return object;
  }, {});
};
