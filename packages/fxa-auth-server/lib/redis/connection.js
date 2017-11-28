/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const error = require('../error')
const P = require('../promise')

module.exports = (log, client) => {
  let isUpdating = false
  let destroyPromise

  return {
    get (key) {
      return client.getAsync(key)
    },

    set (key, value) {
      return client.setAsync(key, value)
    },

    del (key) {
      return client.delAsync(key)
    },

    /**
     * To ensure safe update semantics in the presence of concurrency,
     * we lean on Redis' WATCH, MULTI and EXEC commands so that updates
     * run as a transaction and will fail if the data changes underneath
     * them. You can read more about this in the Redis docs:
     *
     *   https://redis.io/topics/transactions
     *
     * @param key {String} The key to update
     * @param getUpdatedValue {Function} A callback that receives the current value
     *                                   and returns the updated value. May return a
     *                                   promise or the raw updated value.
     */
    update (key, getUpdatedValue) {
      if (isUpdating) {
        log.error({ op: 'redis.update.conflict', key })
        return P.reject(error.unexpectedError())
      }

      isUpdating = true

      return client.watchAsync(key)
        .then(() => client.getAsync(key))
        .then(getUpdatedValue)
        .then(value => {
          const multi = client.multi()

          if (value) {
            multi.set(key, value)
          } else {
            multi.del(key)
          }

          return multi.execAsync()
        })
        .catch(err => {
          client.unwatch()
          log.error({ op: 'redis.update.error', key, err: err.message })
          isUpdating = false
          throw err
        })
        .then(result => {
          isUpdating = false
          if (! result) {
            log.error({ op: 'redis.watch.conflict', key })
            throw error.unexpectedError()
          }
        })
    },

    destroy () {
      if (! destroyPromise) {
        destroyPromise = new P(resolve => {
          client.quit()
          client.on('end', resolve)
        })
      }

      return destroyPromise
    },

    isValid () {
      return ! destroyPromise
    }
  }
}

