/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

const genericPool = require('generic-pool');
const Promise = require('../promise');
const redis = require('redis');
const redisConnection = require('./connection');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

module.exports = (config, log) => {
  const redisConfig = {
    host: config.host,
    port: config.port,
    prefix: config.prefix,
    // Prefer redis to fail fast than wait indefinitely for reconnection
    enable_offline_queue: false,
  };

  const redisFactory = {
    create() {
      return new Promise((resolve, reject) => {
        let connection;

        const client = redis.createClient(
          Object.assign({}, redisConfig, {
            retry_strategy({ attempt }) {
              if (attempt <= config.retryCount) {
                return config.initialBackoff * Math.pow(2, attempt - 1);
              }

              if (connection) {
                // It's too late to reject here because the connection was
                // already added to the pool. Destroy it instead.
                connection.destroy();
              } else {
                reject(new Error('redis.connection.error'));
              }
            },
          })
        );

        client.on('ready', () => {
          if (! connection) {
            connection = redisConnection.create(log, client);
            resolve(connection);
          }
        });

        client.on('error', error => {
          log.error('redis.error', { error: error.message });
        });
      });
    },

    validate(connection) {
      return connection.isValid();
    },

    destroy(connection) {
      return connection.destroy();
    },
  };

  const acquireTimeoutMillis = new Array(config.retryCount)
    .fill(0)
    .reduce((total, _, index) => {
      return total + config.initialBackoff * Math.pow(2, index);
    }, 0);

  const pool = genericPool.createPool(redisFactory, {
    acquireTimeoutMillis,
    autostart: true,
    max: config.maxConnections,
    maxWaitingClients: config.maxPending,
    min: config.minConnections,
    Promise,
    testOnBorrow: true,
  });

  pool.on('factoryCreateError', error =>
    log.error('redisFactory.error', { error: error.message })
  );

  return {
    methods: redisConnection.methods,

    pool: {
      /**
       * Acquire a single-use Redis connection. Must be consumed via Promise.using().
       *
       * @return {Disposer} A bluebird disposer object
       */
      acquire() {
        return pool.acquire().disposer(connection => pool.release(connection));
      },

      /**
       * Close the pool, releasing any network connections.
       */
      close() {
        return pool.drain().then(() => pool.clear());
      },
    },
  };
};
