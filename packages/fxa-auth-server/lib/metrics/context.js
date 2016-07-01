/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var crypto = require('crypto')
var isA = require('joi')
var bufferEqualConstantTime = require('buffer-equal-constant-time')
var HEX = require('../routes/validators').HEX_STRING
var P = require('../promise')
var Memcached = require('memcached')
P.promisifyAll(Memcached.prototype)

var FLOW_ID_LENGTH = 64

var SCHEMA = isA.object({
  flowId: isA.string().length(64).regex(HEX).optional(),
  flowBeginTime: isA.number().integer().positive().optional(),
  context: isA.string().optional(),
  entrypoint: isA.string().optional(),
  migration: isA.string().optional(),
  service: isA.string().optional(),
  utmCampaign: isA.string().optional(),
  utmContent: isA.string().optional(),
  utmMedium: isA.string().optional(),
  utmSource: isA.string().optional(),
  utmTerm: isA.string().optional()
}).and('flowId', 'flowBeginTime').optional()

var NOP = function () {
  return P.resolve()
}

var NULL_MEMCACHED = {
  delAsync: NOP,
  getAsync: NOP,
  setAsync: NOP
}

module.exports = function (log, config) {
  var _memcached

  return {
    schema: SCHEMA,
    stash: stash,
    gather: gather,
    validate: validate
  }

  /**
   * Stashes metrics context metadata using a key derived from a token
   * and an event. Asynchronous, returns a promise.
   *
   * @param token    token to stash the metadata against
   * @param events   array of event names that constitute a flow
   * @param metadata metrics context metadata
   */
  function stash (token, events, metadata) {
    if (! metadata) {
      return P.resolve()
    }

    if (events && typeof events === 'string') {
      events = [ events ]
    }

    if (! token || ! Array.isArray(events)) {
      log.error({
        op: 'metricsContext.stash',
        err: new Error('Invalid argument'),
        token: token,
        events: events
      })
      return P.resolve()
    }

    var memcached = getMemcached()

    return P.all(events.map(function (event) {
      return memcached.setAsync(getKey(token, event), metadata, config.memcached.lifetime)
        .catch(function (err) {
          log.error({ op: 'metricsContext.stash', err: err })
        })
    }))
  }

  function getMemcached () {
    if (_memcached) {
      return _memcached
    }

    try {
      if (config.memcached.address !== 'none') {
        _memcached = new Memcached(config.memcached.address, {
          timeout: 500,
          retries: 1,
          retry: 1000,
          reconnect: 1000,
          idle: config.memcached.idle,
          namespace: 'fxa-metrics~'
        })

        return _memcached
      }
    } catch (err) {
      log.error({ op: 'metricsContext.getMemcached', err: err })
    }

    return NULL_MEMCACHED
  }

  /**
   * Gathers metrics context metadata onto data, using either metadata
   * passed in from a request or previously-stashed metadata for a
   * token. Asynchronous, returns a promise that resolves to data,
   * with metrics context metadata copied to it.
   *
   * @param data    target object
   * @param request request object
   * @param event   event name
   */
  function gather (data, request, event) {
    var metadata = request.payload && request.payload.metricsContext
    var token = request.auth && request.auth.credentials
    var doNotTrack = request.headers && request.headers.dnt === '1'
    var memcached = getMemcached()
    var key = getKey(token, event)

    return P.resolve()
      .then(function () {
        if (metadata) {
          return metadata
        }

        if (key) {
          return memcached.getAsync(key)
        }
      })
      .catch(function (err) {
        log.error({ op: 'memcached.get', err: err })
      })
      .then(function (metadata) {
        if (metadata) {
          data.time = Date.now()
          data.flow_id = metadata.flowId
          data.flow_time = calculateFlowTime(data.time, metadata.flowBeginTime)
          data.context = metadata.context
          data.entrypoint = metadata.entrypoint
          data.migration = metadata.migration
          data.service = metadata.service

          if (! doNotTrack) {
            data.utm_campaign = metadata.utmCampaign
            data.utm_content = metadata.utmContent
            data.utm_medium = metadata.utmMedium
            data.utm_source = metadata.utmSource
            data.utm_term = metadata.utmTerm
          }
        }
      })
      .then(function () {
        if (key) {
          return memcached.delAsync(key)
        }
      })
      .catch(function (err) {
        log.error({ op: 'memcached.del', err: err })
      })
      .then(function () {
        return data
      })
  }

  /**
   * Checks whether a request's flowId and flowBeginTime are valid.
   * Returns a boolean, `true` if the request is valid, `false` if
   * it's invalid.
   *
   * @param request object
   */
  function validate(request) {
    var metadata = request.payload.metricsContext

    if (!metadata) {
      return logInvalidContext(request, 'missing context')
    }
    if (!metadata.flowId) {
      return logInvalidContext(request, 'missing flowId')
    }
    if (!metadata.flowBeginTime) {
      return logInvalidContext(request, 'missing flowBeginTime')
    }

    if (Date.now() - metadata.flowBeginTime > config.metrics.flow_id_expiry) {
      return logInvalidContext(request, 'expired flowBeginTime')
    }

    // The first half of the id is random bytes, the second half is a HMAC of
    // additional contextual information about the request.  It's a simple way
    // to check that the metrics came from the right place, without having to
    // share state between content-server and auth-server.
    var flowSignature = metadata.flowId.substr(FLOW_ID_LENGTH / 2, FLOW_ID_LENGTH)
    var flowSignatureBytes = new Buffer(flowSignature, 'hex')
    var expectedSignatureBytes = calculateFlowSignatureBytes(request, metadata)
    if (! bufferEqualConstantTime(flowSignatureBytes, expectedSignatureBytes)) {
      return logInvalidContext(request, 'invalid signature')
    }

    log.info({
      op: 'metrics.context.validate',
      valid: true,
      agent: request.headers['user-agent']
    })
    log.increment('metrics.context.valid')
    return true
  }

  function logInvalidContext(request, reason) {
    if (request.payload.metricsContext) {
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
    var signatureLength = FLOW_ID_LENGTH / 2 / 2
    var key = config.metrics.flow_id_key
    return crypto.createHmac('sha256', key)
      .update([
        metadata.flowId.substr(0, FLOW_ID_LENGTH / 2),
        metadata.flowBeginTime.toString(16),
        request.headers['user-agent']
      ].join('\n'))
      .digest()
      .slice(0, signatureLength)
  }
}

function getKey (token, event) {
  if (token && event) {
    return [ token.uid.toString('hex'), token.id, event ].join(':')
  }
}

function calculateFlowTime (time, flowBeginTime) {
  if (time <= flowBeginTime) {
    return 0
  }

  return time - flowBeginTime
}
