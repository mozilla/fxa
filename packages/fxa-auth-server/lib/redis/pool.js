/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const genericPool = require('generic-pool')
const P = require('../promise')
const redis = require('redis')
const redisConnection = require('./connection')

P.promisifyAll(redis.RedisClient.prototype)
P.promisifyAll(redis.Multi.prototype)

module.exports = (config, log) => {
  const redisConfig = {
    host: config.host,
    port: config.port,
    prefix: config.sessionsKeyPrefix,
    // Prefer redis to fail fast than wait indefinitely for reconnection
    enable_offline_queue: false
  }

  const redisFactory = {
    create () {
      return new P((resolve, reject) => {
        let connection

        const client = redis.createClient(Object.assign({}, redisConfig, {
          retry_strategy ({ attempt }) {
            if (attempt <= config.retryCount) {
              return config.initialBackoff * Math.pow(2, attempt - 1)
            }

            if (connection) {
              // It's too late to reject here because the connection was
              // already added to the pool. Destroy it instead.
              connection.destroy()
            } else {
              reject(new Error('Redis connection failed'))
            }
          }
        }))

        client.on('ready', () => {
          if (! connection) {
            connection = redisConnection(log, client)
            resolve(connection)
          }
        })

        client.on('error', err => {
          log.error({ op: 'redis.error', err: err.message })
        })
      })
    },

    validate (connection) {
      return connection.isValid()
    },

    destroy (connection) {
      return connection.destroy()
    }
  }

  const acquireTimeoutMillis = new Array(config.retryCount)
    .fill(0)
    .reduce((total, _, index) => {
      return total + config.initialBackoff * Math.pow(2, index)
    }, 0)

  const pool = genericPool.createPool(redisFactory, {
    acquireTimeoutMillis,
    autostart: true,
    max: config.maxConnections,
    maxWaitingClients: config.maxPending,
    min: config.minConnections,
    Promise: P,
    testOnBorrow: true
  })

  pool.on('factoryCreateError', err => log.error({ op: 'redisFactory.error', err: err.message }))

  return {
    /**
     * Acquire a single-use Redis connection. Must be consumed via P.using().
     *
     * @return {Disposer} A bluebird disposer object
     */
    acquire () {
      return pool.acquire().disposer(connection => pool.release(connection))
    }
  }
}

