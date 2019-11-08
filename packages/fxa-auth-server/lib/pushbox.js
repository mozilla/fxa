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

'use strict';

const isA = require('joi');
const error = require('./error');
const createBackendServiceAPI = require('./backendService');
const validators = require('./routes/validators');

const base64url = require('base64url');

const PUSHBOX_RETRIEVE_SCHEMA = isA
  .object({
    last: isA.boolean().optional(),
    index: isA.number().optional(),
    messages: isA
      .array()
      .items(
        isA.object({
          index: isA.number().required(),
          data: isA
            .string()
            .regex(validators.URL_SAFE_BASE_64)
            .required(),
        })
      )
      .optional(),
    status: isA.number().required(),
    error: isA.string().optional(),
  })
  .and('last', 'messages')
  .or('index', 'error');

const PUSHBOX_STORE_SCHEMA = isA
  .object({
    index: isA.number().optional(),
    error: isA.string().optional(),
    status: isA.number().required(),
  })
  .or('index', 'error');

// Pushbox stores strings, so these are a little pair
// of helper functions to allow us to store arbitrary
// JSON-serializable objects.

function encodeForStorage(data) {
  return base64url.encode(JSON.stringify(data));
}

function decodeFromStorage(data) {
  return JSON.parse(base64url.decode(data));
}

module.exports = function(log, config, statsd) {
  if (!config.pushbox.enabled) {
    return {
      retrieve() {
        return Promise.reject(error.featureNotEnabled());
      },
      store() {
        return Promise.reject(error.featureNotEnabled());
      },
    };
  }

  const PushboxAPI = createBackendServiceAPI(
    log,
    config,
    'pushbox',
    {
      retrieve: {
        path: '/v1/store/:uid/:deviceId',
        method: 'GET',
        validate: {
          params: {
            uid: isA
              .string()
              .regex(validators.HEX_STRING)
              .required(),
            deviceId: isA
              .string()
              .regex(validators.HEX_STRING)
              .required(),
          },
          query: {
            limit: isA
              .string()
              .regex(validators.DIGITS)
              .required(),
            index: isA
              .string()
              .regex(validators.DIGITS)
              .optional(),
          },
          response: PUSHBOX_RETRIEVE_SCHEMA,
        },
      },

      store: {
        path: '/v1/store/:uid/:deviceId',
        method: 'POST',
        validate: {
          params: {
            uid: isA
              .string()
              .regex(validators.HEX_STRING)
              .required(),
            deviceId: isA
              .string()
              .regex(validators.HEX_STRING)
              .required(),
          },
          payload: {
            data: isA.string().required(),
            ttl: isA.number().required(),
          },
          response: PUSHBOX_STORE_SCHEMA,
        },
      },
    },
    statsd
  );

  const api = new PushboxAPI(config.pushbox.url, {
    headers: { Authorization: `FxA-Server-Key ${config.pushbox.key}` },
    timeout: 15000,
  });

  // pushbox expects this in seconds, not millis.
  const maxTTL = Math.round(config.pushbox.maxTTL / 1000);

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
    async retrieve(uid, deviceId, limit, index) {
      const query = {
        limit: limit.toString(),
      };
      if (index) {
        query.index = index.toString();
      }
      const body = await api.retrieve(uid, deviceId, query);
      log.info('pushbox.retrieve.response', { body: body });
      if (body.error) {
        log.error('pushbox.retrieve', {
          status: body.status,
          error: body.error,
        });
        throw error.backendServiceFailure();
      }
      return {
        last: body.last,
        index: body.index,
        messages: !body.messages
          ? undefined
          : body.messages.map(msg => {
            return {
              index: msg.index,
              data: decodeFromStorage(msg.data),
            };
          }),
      };
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
    async store(uid, deviceId, data, ttl) {
      if (typeof ttl === 'undefined' || ttl > maxTTL) {
        ttl = maxTTL;
      }
      const body = await api.store(uid, deviceId, {
        data: encodeForStorage(data),
        ttl,
      });
      log.info('pushbox.store.response', { body: body });
      if (body.error) {
        log.error('pushbox.store', { status: body.status, error: body.error });
        throw error.backendServiceFailure();
      }
      return body;
    },
  };
};

module.exports.RETRIEVE_SCHEMA = PUSHBOX_RETRIEVE_SCHEMA;
