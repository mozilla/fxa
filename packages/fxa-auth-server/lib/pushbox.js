/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * "Pushbox" is a durable queue service that allows customers to store and
 * retrieve large payloads (~1 MB) that persist for generous lengths of time
 * (~1 month).  We use it to provide a "command queue" for each connected device
 * that is more reliable than its webpush subscription.
 *
 * This library implements a little proxy in front of the pushbox API,
 * allowing it to be authenticated by the device's session token.
 * It's likely that we'll eventually refacor this out into a standalone
 * oauth-authenticated service, once we get more experience with using it.
 */

'use strict'

const isA = require('joi')
const error = require('./error')
const Pool = require('./pool')
const P = require('./promise')
const validators = require('./routes/validators')

const base64url = require('base64url')

const LOG_OP_RETRIEVE = 'pushbox.retrieve'
const LOG_OP_STORE = 'pushbox.store'

const PUSHBOX_RETRIEVE_SCHEMA = isA.object({
  last: isA.boolean().optional(),
  index: isA.number().optional(),
  messages: isA.array().items(isA.object({
    index: isA.number().required(),
    data: isA.string().regex(validators.URL_SAFE_BASE_64).required(),
  })).optional(),
  status: isA.number().required(),
  error: isA.string().optional()
}).and('last', 'messages').or('index', 'error')

const PUSHBOX_STORE_SCHEMA = isA.object({
  index: isA.number().optional(),
  error: isA.string().optional(),
  status: isA.number().required()
}).or('index', 'error')

const validateRetrieveResponse = P.promisify(PUSHBOX_RETRIEVE_SCHEMA.validate, {
  context: PUSHBOX_RETRIEVE_SCHEMA
})

const validateStoreResponse = P.promisify(PUSHBOX_STORE_SCHEMA.validate, {
  context: PUSHBOX_STORE_SCHEMA
})


// Pushbox stores strings, so these are a little pair
// of helper functions to allow us to store arbitrary
// JSON-serializable objects.

function encodeForStorage(data) {
  return base64url.encode(JSON.stringify(data))
}

function decodeFromStorage(data) {
  return JSON.parse(base64url.decode(data))
}


module.exports = function (log, config) {
  if (! config.pushbox.enabled) {
    return {
      retrieve() {
        return Promise.reject(error.featureNotEnabled())
      },
      store() {
        return Promise.reject(error.featureNotEnabled())
      }
    }
  }

  const pool = new Pool(config.pushbox.url, { timeout: 15000 })
  // pushbox expects this in seconds, not millis.
  const maxTTL = Math.round(config.pushbox.maxTTL / 1000)

  const SafeUrl = require('./safe-url')(log)
  const path = new SafeUrl('/v1/store/:uid/:deviceId')
  const headers = {Authorization: `FxA-Server-Key ${config.pushbox.key}`}

  return {
    /**
     * Retrieves enqueued items for a specific device.
     * This simply relays the request to the pushbox service,
     * decoding stored strings back into rich objects.
     *
     * @param {String} uid
     * @param {String} deviceId
     * @param {Object} options
     * @param {Number} limit
     * @param {String} [index]
     * @returns {Promise}
     */
    retrieve (uid, deviceId, limit, index) {
      log.trace({
        op: LOG_OP_RETRIEVE,
        uid,
        deviceId,
        index,
        limit
      })
      const query = {
        limit: limit.toString()
      }
      if (index) {
        query.index = index.toString()
      }
      const params = {uid, deviceId}
      return pool.get(path, params, {query, headers})
      .then(body => {
        log.info({ op: 'pushbox.retrieve.response', body: body })
        return validateRetrieveResponse(body).catch(e => {
          log.error({ op: 'pushbox.retrieve', error: 'response schema validation failed', body: body })
          throw error.unexpectedError()
        })
      })
      .then(body => {
        if (body.error) {
          log.error({ op: 'pushbox.retrieve', status: body.status, error: body.error })
          throw error.unexpectedError()
        }
        return {
          last: body.last,
          index: body.index,
          messages: (! body.messages) ? undefined : body.messages.map(msg => {
            return {
              index: msg.index,
              data: decodeFromStorage(msg.data)
            }
          })
        }
      })
    },

    /**
     * Enqueue an item for a specific device.
     * This simply relays the request to the Pushbox service,
     * encoding rich objects down into a string for storage.
     *
     * @param {String} uid - Firefox Account uid
     * @param {String} deviceId
     * @param {string} topic
     * @param {Object} data - data object to serialize into storage
     * @returns {Promise} direct url to the stored message
     */
    store (uid, deviceId, data, ttl) {
      if (typeof ttl === 'undefined' || ttl > maxTTL) {
        ttl = maxTTL
      }
      log.trace({
        op: LOG_OP_STORE,
        uid,
        deviceId,
      })
      const body = {data: encodeForStorage(data), ttl}
      const params = {uid, deviceId}
      return pool.post(path, params, body, {headers})
      .then(body => {
        log.info({ op: 'pushbox.store.response', body: body })
        return validateStoreResponse(body).catch(e => {
          log.error({ op: 'pushbox.store', error: 'response schema validation failed', body: body })
          throw error.unexpectedError()
        })
      })
      .then(body => {
        if (body.error) {
          log.error({ op: 'pushbox.store', status: body.status, error: body.error })
          throw error.unexpectedError()
        }
        return body
      })
    }
  }
}

module.exports.RETRIEVE_SCHEMA = PUSHBOX_RETRIEVE_SCHEMA
