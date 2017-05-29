/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const bufferEqualConstantTime = require('buffer-equal-constant-time')
const crypto = require('crypto')
const HEX_STRING = require('../routes/validators').HEX_STRING
const isA = require('joi')
const P = require('../promise')

const FLOW_ID_LENGTH = 64

const SCHEMA = isA.object({
  flowId: isA.string().length(64).regex(HEX_STRING).optional(),
  flowBeginTime: isA.number().integer().positive().optional()
})
  .unknown(false)
  .and('flowId', 'flowBeginTime')

module.exports = function (log, config) {
  const cache = require('../cache')(log, config, 'fxa-metrics~')

  return {
    stash: stash,
    gather: gather,
    clear: clear,
    validate: validate,
    setFlowCompleteSignal: setFlowCompleteSignal
  }

  /**
   * Stashes metrics context metadata using a key derived from a token.
   * Asynchronous, returns a promise.
   *
   * @name stashMetricsContext
   * @this request
   * @param token    token to stash the metadata against
   */
  function stash (token) {
    const metadata = this.payload && this.payload.metricsContext

    if (! metadata) {
      return P.resolve()
    }

    return P.resolve()
      .then(() => cache.set(token, metadata))
      .catch(err => log.error({
        op: 'metricsContext.stash',
        err: err,
        hasToken: !! token,
        hasId: !! (token && token.id),
        hasUid: !! (token && token.uid)
      }))
  }

  /**
   * Gathers metrics context metadata onto data, using either metadata
   * passed in with a request or previously-stashed metadata for a
   * token. Asynchronous, returns a promise that resolves to data, with
   * metrics context metadata copied to it.
   *
   * @name gatherMetricsContext
   * @this request
   * @param data target object
   */
  function gather (data) {
    let token

    return P.resolve()
      .then(() => {
        const metadata = this.payload && this.payload.metricsContext

        if (metadata) {
          return metadata
        }

        token = getToken(this)
        if (token) {
          return cache.get(token)
        }
      })
      .then(metadata => {
        if (metadata) {
          data.time = Date.now()
          data.flow_id = metadata.flowId
          data.flow_time = calculateFlowTime(data.time, metadata.flowBeginTime)
          data.flowCompleteSignal = metadata.flowCompleteSignal
        }
      })
      .catch(err => log.error({
        op: 'metricsContext.gather',
        err: err,
        hasToken: !! token,
        hasId: !! (token && token.id),
        hasUid: !! (token && token.uid)
      }))
      .then(() => data)
  }

  function getToken (request) {
    if (request.auth && request.auth.credentials) {
      return request.auth.credentials
    }

    if (request.payload && request.payload.uid && request.payload.code) {
      return {
        uid: Buffer(request.payload.uid, 'hex'),
        id: request.payload.code
      }
    }
  }

  /**
   * Attempt to clear previously-stashed metrics context metadata.
   *
   * @name clearMetricsContext
   * @this request
   */
  function clear () {
    return P.resolve()
      .then(() => {
        const token = getToken(this)
        if (token) {
          return cache.del(token)
        }
      })
  }

  /**
   * Checks whether a request's flowId and flowBeginTime are valid.
   * Returns a boolean, `true` if the request is valid, `false` if
   * it's invalid.
   *
   * @name validateMetricsContext
   * @this request
   */
  function validate() {
    if (! this.payload) {
      return logInvalidContext(this, 'missing payload')
    }

    const metadata = this.payload.metricsContext

    if (! metadata) {
      return logInvalidContext(this, 'missing context')
    }
    if (! metadata.flowId) {
      return logInvalidContext(this, 'missing flowId')
    }
    if (! metadata.flowBeginTime) {
      return logInvalidContext(this, 'missing flowBeginTime')
    }

    const age = Date.now() - metadata.flowBeginTime
    if (age > config.metrics.flow_id_expiry || age <= 0) {
      return logInvalidContext(this, 'expired flowBeginTime')
    }

    if (! HEX_STRING.test(metadata.flowId)) {
      return logInvalidContext(this, 'invalid flowId')
    }

    // The first half of the id is random bytes, the second half is a HMAC of
    // additional contextual information about the request.  It's a simple way
    // to check that the metrics came from the right place, without having to
    // share state between content-server and auth-server.
    const flowSignature = metadata.flowId.substr(FLOW_ID_LENGTH / 2, FLOW_ID_LENGTH)
    const flowSignatureBytes = Buffer.from(flowSignature, 'hex')
    const expectedSignatureBytes = calculateFlowSignatureBytes(this, metadata)
    if (! bufferEqualConstantTime(flowSignatureBytes, expectedSignatureBytes)) {
      return logInvalidContext(this, 'invalid signature')
    }

    log.info({
      op: 'metrics.context.validate',
      valid: true,
      agent: this.headers['user-agent']
    })
    log.increment('metrics.context.valid')
    return true
  }

  function logInvalidContext(request, reason) {
    if (request.payload && request.payload.metricsContext) {
      delete request.payload.metricsContext.flowId
      delete request.payload.metricsContext.flowBeginTime
    }
    log.warn({
      op: 'metrics.context.validate',
      valid: false,
      reason: reason,
      agent: request.headers['user-agent']
    })
    log.increment('metrics.context.invalid')
    return false
  }

  function calculateFlowSignatureBytes(request, metadata) {
    // We want a digest that's half the length of a flowid,
    // and we want the length in bytes rather than hex.
    const signatureLength = FLOW_ID_LENGTH / 2 / 2
    const key = config.metrics.flow_id_key
    return crypto.createHmac('sha256', key)
      .update([
        metadata.flowId.substr(0, FLOW_ID_LENGTH / 2),
        metadata.flowBeginTime.toString(16),
        request.headers['user-agent']
      ].join('\n'))
      .digest()
      .slice(0, signatureLength)
  }

  /**
   * Sets the event name that will signal completion of the current flow.
   *
   * @name setMetricsFlowCompleteSignal
   * @this request
   * @param {String} flowCompleteSignal
   */
  function setFlowCompleteSignal (flowCompleteSignal) {
    if (this.payload && this.payload.metricsContext) {
      this.payload.metricsContext.flowCompleteSignal = flowCompleteSignal
    }
  }
}

function calculateFlowTime (time, flowBeginTime) {
  if (time <= flowBeginTime) {
    return 0
  }

  return time - flowBeginTime
}

// HACK: Force the API docs to expand SCHEMA inline
module.exports.SCHEMA = SCHEMA
module.exports.schema = SCHEMA.optional()
module.exports.requiredSchema = SCHEMA.required()

