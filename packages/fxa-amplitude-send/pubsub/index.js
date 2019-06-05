// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

'use strict'

const async = require('async')
const crypto = require('crypto')
const is = require('check-types')
const { lookup } = require('lookup-dns-cache')
const { PubSub } = require('@google-cloud/pubsub')
const request = require('request-promise')

const { AMPLITUDE_API_KEY, HMAC_KEY, PUBSUB_PROJECT, PUBSUB_TOPIC, PUBSUB_SUBSCRIPTION } = process.env

if (! AMPLITUDE_API_KEY || ! HMAC_KEY || ! PUBSUB_PROJECT || ! PUBSUB_TOPIC || ! PUBSUB_SUBSCRIPTION) {
  console.log(timestamp(), 'Error: You must set AMPLITUDE_API_KEY, HMAC_KEY, PUBSUB_PROJECT, PUBSUB_TOPIC and PUBSUB_SUBSCRIPTION environment variables')
  process.exit(1)
}

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

// If TIMEOUT_THRESHOLD milliseconds pass with no messages arriving, the script will abort
const TIMEOUT_THRESHOLD = parseInt(process.env.TIMEOUT_THRESHOLD || MINUTE);

// If a message older than WARNING_THRESHOLD milliseconds arrives, the script will log a warning
const WARNING_THRESHOLD = parseInt(process.env.WARNING_THRESHOLD || DAY * 3);

const IGNORED_EVENTS = new Map()
if (process.env.IGNORED_EVENTS) {
  // process.env.IGNORED_EVENTS is a JSON object of event_type:criteria, e.g.:
  //
  // {
  //   "fxa_activity - access_token_checked": [
  //     {
  //       "event_properties": {
  //         "oauth_client_id": "deadbeef"
  //       }
  //     },
  //     {
  //       "event_properties": {
  //         "oauth_client_id": "baadf00d"
  //       }
  //     }
  //   ],
  //   "fxa_activity - access_token_created": [
  //     {
  //       "event_properties": {
  //         "oauth_client_id": "deadbeef"
  //       }
  //     },
  //     {
  //       "event_properties": {
  //         "oauth_client_id": "baadf00d"
  //       }
  //     }
  //   ]
  // }
  Object.entries(JSON.parse(process.env.IGNORED_EVENTS)).forEach(([ type, criteria ]) => {
    IGNORED_EVENTS.set(type, criteria)
  })
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
const WORKER_COUNT = process.env.WORKER_COUNT ? parseInt(process.env.WORKER_COUNT) : 1
const MESSAGES = new Map()

main()
  .catch(error => {
    console.log(timestamp(), error.stack)
    process.exit(1)
  })

async function main () {
  const pubsub = new PubSub({
    projectId: PUBSUB_PROJECT
  })

  const topic = pubsub.topic(PUBSUB_TOPIC)
  const subscraption = topic.subscription(PUBSUB_SUBSCRIPTION)
  const [ exists ] = await subscraption.exists()

  const [ subscription ] = await (exists ? subscraption.get(PUBSUB_SUBSCRIPTION) : subscraption.create(PUBSUB_SUBSCRIPTION))

  const cargo = {
    httpapi: setupCargo(ENDPOINTS.HTTP_API, KEYS.HTTP_API),
    identify: setupCargo(ENDPOINTS.IDENTIFY_API, KEYS.IDENTIFY_API),
  }

  let timeout;

  subscription.on('message', message => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(onTimeout, TIMEOUT_THRESHOLD);

    processMessage(cargo, message)
  })

  subscription.on('error', error => {
    console.log(timestamp(), error.stack)
  })

  subscription.on('close', () => {
    console.log(timestamp(), 'Error: subscription closed')
    process.exit(1)
  })
}

function timestamp () {
  return new Date().toISOString()
}

function setupCargo (endpoint, key) {
  const cargo = async.cargo(async payload => {
    try {
      await sendPayload(payload, endpoint, key)
      clearMessages(payload, message => message.ack())
      console.log(timestamp(), 'Success!', endpoint, payload.length)
    } catch (error) {
      console.log(timestamp(), endpoint, error.stack)
      clearMessages(payload, message => message.nack(), true)
    }
  }, MAX_EVENTS_PER_BATCH)

  cargo.concurrency = WORKER_COUNT

  return cargo
}

function processMessage (cargo, message) {
  const { httpapi, identify } = parseMessage(message)

  if (message.publishTime < Date.now() - WARNING_THRESHOLD) {
    console.log(timestamp(), 'Warning: Old message', { httpapi, identify })
  }

  if (httpapi) {
    MESSAGES.set(httpapi.insert_id, { message, payloadCount: identify ? 2 : 1 })
    cargo.httpapi.push(httpapi)
  }

  if (identify) {
    cargo.identify.push(identify)
  }
}

function parseMessage (message) {
  let { jsonPayload: event } = JSON.parse(Buffer.from(message.data, 'base64').toString())

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

  if (isIgnoredEvent(event)) {
    return {}
  }

  if (! isEventOk(event)) {
    console.log(timestamp(), 'Warning: Skipping malformed event', event)
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
      // _insert_id is only here so we can uniquely identify each payload and
      // link it back to its message. It's not actually sent to Amplitude.
      _insert_id: event.insert_id,
    }
  }

  return {
    httpapi: event,
    identify,
  }
}

function isIgnoredEvent (event) {
  if (! IGNORED_EVENTS.has(event.event_type)) {
    return false
  }

  const criteria = IGNORED_EVENTS.get(event.event_type)

  if (Array.isArray(criteria)) {
    return criteria.some(criterion => deepMatch(event, criterion))
  }

  return deepMatch(event, criteria)
}

function deepMatch (object, criteria) {
  if (criteria === undefined) {
    return true
  }

  return Object.entries(criteria).every(([ key, value ]) => {
    if (typeof value === 'object') {
      return deepMatch(object[key], value)
    }

    return object[key] === value
  })
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
      [key]: JSON.stringify(payload.map(item => ({ ...item, _insert_id: undefined })))
    },
    timeout: 5 * 1000
  })
}

function clearMessages (payload, action, forceAction = false) {
  payload.forEach(event => {
    // eslint-disable-next-line no-underscore-dangle
    const id = event.insert_id || event._insert_id

    const item = MESSAGES.get(id)
    if (! item) {
      // In this case the message has already been cleared due to an earlier failure
      return
    }

    const { message, payloadCount } = item
    if (! message) {
      return
    }

    if (forceAction || payloadCount === 1) {
      action(message)
      MESSAGES.delete(id)
    } else {
      MESSAGES.set(id, { message, payloadCount: payloadCount - 1 })
    }
  })
}

function onTimeout () {
  console.log(timestamp(), `Error: no messages received in ${TIMEOUT_THRESHOLD / SECOND} seconds`)
  process.exit(1)
}
