// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

'use strict'

const crypto = require('crypto')
const qs = require('qs')
const Promise = require('bluebird')
const sqs = require('sqs')

const { AUTH, SQS_SUFFIX, PROVIDER } = process.env

if (! AUTH || ! SQS_SUFFIX || ! PROVIDER) {
  throw new Error('Missing config')
}

const ACCEPTED_PROVIDERS = [
  'sendgrid',
  'socketlabs'
]

if (! ACCEPTED_PROVIDERS.includes(PROVIDER)) { 
  throw new Error(`Only the following providers are supported: ${ACCEPTED_PROVIDERS.join(', ')}`)
}

const provider = require(`./${PROVIDER}`)

const AUTH_HASH = createHash(AUTH).split('')

const QUEUES = {
  Bounce: `fxa-email-bounce-${SQS_SUFFIX}`,
  Complaint: `fxa-email-complaint-${SQS_SUFFIX}`,
  Delivery: `fxa-email-delivery-${SQS_SUFFIX}`
}

// env vars: SQS_ACCESS_KEY, SQS_SECRET_KEY, SQS_REGION
const SQS_CLIENT = sqs()
SQS_CLIENT.pushAsync = Promise.promisify(SQS_CLIENT.push)

module.exports = { main }

async function main (data) {
  try {
    // If there's a body, it's a request from the API gateway
    if (data.body) {
      // Requests from the API gateway must be authenticated
      if (! data.queryStringParameters || ! authenticate(data.queryStringParameters.auth)) {
        const errorResponse = { 
          error: 'Unauthorized', 
          errno: 999,
          code: 401,
          message: 'Request must provide a valid auth query param.'
        }
        return {
          statusCode: 401,
          body: JSON.stringify(errorResponse),
          isBase64Encoded: false
        }
      }

      if (data.headers && data.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
        data = qs.parse(data.body)
      } else {
        data = JSON.parse(data.body)
      }
    }

    if (! Array.isArray(data)) {
      data = [ data ]
    }
    
    if (PROVIDER === 'socketlabs' && provider.shouldValidate(data[0])) {
      return provider.validationResponse()
    }

    let results = await processEvents(data)
    let response = { 
      result: `Processed ${results.length} events` 
    }
    return {
      statusCode: 200,
      body: JSON.stringify(response),
      isBase64Encoded: false
    }
  } catch(error) {
    const errorResponse = { 
      error: 'Internal Server Error', 
      errno: 999,
      code: 500,
      message: error && error.message ? error.message : 'Unspecified error'
    }
    return {
      statusCode: 500,
      body: JSON.stringify(errorResponse),
      isBase64Encoded: false
    }
  }
}

function authenticate (auth) {
  const authHash = createHash(auth)
  return AUTH_HASH
    .reduce((equal, char, index) => equal && char === authHash[index], true)
}

function createHash (value) {
  const hash = crypto.createHash('sha256')
  hash.update(value)
  return hash.digest('base64')
}

async function processEvents (events) {
  return Promise.all(
    events.map(provider.marshallEvent)
      .filter(event => !! event)
      .map(sendEvent)
  )
}

function sendEvent (event) {
  return SQS_CLIENT.pushAsync(QUEUES[event.notificationType], event)
    .then(() => console.log('Sent:', event.notificationType))
    .catch(error => {
      console.error('Failed to send event:', event)
      console.error(error.stack)
      throw error
    })
}
