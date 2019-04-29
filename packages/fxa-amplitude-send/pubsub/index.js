// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

'use strict'

const async = require('async')
const crypto = require('crypto')
const is = require('check-types')
const { lookup } = require('lookup-dns-cache')
const Promise = require('bluebird')
const request = require('request-promise')

const { AMPLITUDE_API_KEY, HMAC_KEY } = process.env

if (! AMPLITUDE_API_KEY || ! HMAC_KEY) {
  console.error('Error: You must set AMPLITUDE_API_KEY and HMAC_KEY environment variables')
  process.exit(1)
}

const ENDPOINTS = {
  HTTP_API: 'https://api.amplitude.com/httpapi',
  IDENTIFY_API: 'https://api.amplitude.com/identify',
}

const KEYS = {
  HTTP_API: 'event',
  IDENTIFY_API: 'identification',
}

const IDENTIFY_VERBS = [ '$set', '$setOnce', '$add', '$append', '$unset' ]
const IDENTIFY_VERBS_SET = new Set(IDENTIFY_VERBS)
const MAX_EVENTS_PER_BATCH = 10
const WORKER_COUNT = process.env.WORKER_COUNT ? parseInt(process.env.WORKER_COUNT) : 2

/**
 * Pubsub entrypoint.
 *
 * @param {Object} message
 * @param {Object} context
 */
exports.main = function (message) {
  if (message.data) {
    const { jsonPayload: events } = JSON.parse(Buffer.from(message.data, 'base64').toString())
    return processEvents(events)
  }
}

function processEvents (events) {
  const cargo = {
    httpapi: setupCargo(ENDPOINTS.HTTP_API, KEYS.HTTP_API),
    identify: setupCargo(ENDPOINTS.IDENTIFY_API, KEYS.IDENTIFY_API),
  }

  if (! Array.isArray(events)) {
    events = [ events ]
  }

  let expectedCount = 1
  events.forEach(event => {
    const { httpapi, identify } = parseEvent(event)

    if (httpapi) {
      cargo.httpapi.push(httpapi)
    }

    if (identify) {
      expectedCount = 2
      cargo.identify.push(identify)
    }
  })

  return new Promise(resolve => {
    let done = 0

    cargo.httpapi.drain = teardownCargo
    cargo.identify.drain = teardownCargo

    function teardownCargo () {
      done += 1

      if (done === expectedCount) {
        resolve()
      }
    }
  })
}

function setupCargo (endpoint, key) {
  const cargo = async.cargo(async payload => {
    try {
      await sendPayload(payload, endpoint, key)
      const count = Array.isArray(payload) ? payload.length : 1
      console.log('Success:', count, endpoint)
      return count
    } catch (error) {
      console.error(`Error: ${endpoint} returned ${error.message}`)
      throw error
    }
  }, MAX_EVENTS_PER_BATCH)

  cargo.concurrency = WORKER_COUNT

  return cargo
}

function parseEvent (event) {
  if (event.Fields) {
    event = event.Fields

    if (event.op && event.data) {
      event = JSON.parse(event.data)
    } else {
      if (is.nonEmptyString(event.event_properties)) {
        event.event_properties = JSON.parse(event.event_properties)
      }

      if (is.nonEmptyString(event.user_properties)) {
        event.user_properties = JSON.parse(event.user_properties)
      }
    }
  }

  if (! isEventOk(event)) {
    console.warn('Warning: Skipping malformed event', event)
    return {}
  }

  if (event.user_id) {
    event.user_id = hash(event.user_id)
  }

  event.insert_id = hash(event.user_id, event.device_id, event.session_id, event.event_type, event.time)

  let identify
  if (IDENTIFY_VERBS.some(verb => is.assigned(event.user_properties[verb]))) {
    identify = {
      device_id: event.device_id,
      user_id: event.user_id,
      user_properties: splitIdentifyPayload(event.user_properties),
    }
  }

  return {
    httpapi: event,
    identify,
  }
}

function isEventOk (event) {
  return (
    is.nonEmptyString(event.device_id) ||
    is.nonEmptyString(event.user_id)
  ) &&
    is.nonEmptyString(event.event_type) &&
    is.positive(event.time)
}

function hash (...properties) {
  const hmac = crypto.createHmac('sha256', HMAC_KEY)

  properties.forEach(property => {
    if (property) {
      hmac.update(`${property}`)
    }
  })

  return hmac.digest('hex')
}

function splitIdentifyPayload (properties) {
  return Object.entries(properties).reduce((payload, [ key, value ]) => {
    if (IDENTIFY_VERBS_SET.has(key)) {
      payload[key] = value
      properties[key] = undefined
    }
    return payload
  }, {})
}

function sendPayload (payload, endpoint, key) {
  return request(endpoint, {
    method: 'POST',
    lookup,
    formData: {
      api_key: AMPLITUDE_API_KEY,
      [key]: JSON.stringify(payload)
    }
  })
}
