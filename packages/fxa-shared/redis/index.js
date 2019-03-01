/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// This module presents a "safe" interface to redis/pool and redis/connection,
// where "safe" means "always acquires a new connection and always releases that
// connection back to the pool at the end, regardless of any errors that may have
// occurred". You do not need to worry about acquiring or releasing connections
// yourself.
//
// Usage:
//
//   const redis = require('fxa-shared/redis');
//
//   redis.get(key)
//     .then(value => {
//       // :)
//     })
//     .catch(error => {
//       // :(
//     });
//
//   redis.set(key, value)
//     .then(() => {
//       // :)
//     })
//     .catch(error => {
//       // :(
//     });
//
//   redis.del(key)
//     .then(() => {
//       // :)
//     })
//     .catch(error => {
//       // :(
//     });
//
//   redis.update(key, value => updatedValue)
//     .then(() => {
//       // :)
//     })
//     .catch(error => {
//       // :(
//     });

'use strict';

const Promise = require('../promise');

const REDIS_COMMANDS = [ 'get', 'set', 'del', 'update' ];

module.exports = (config, log) => {
  if (! config.enabled) {
    log.info('redis.disabled');
    return;
  }

  log.info('redis.enabled', { config });

  const pool = require('./pool')(config, log);

  return REDIS_COMMANDS.reduce((result, command) => {
    result[command] = (...args) => Promise.using(pool.acquire(), connection => connection[command](...args));
    return result;
  }, {
    close: () => pool.close()
  });
};
