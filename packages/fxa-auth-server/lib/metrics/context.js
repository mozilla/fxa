/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var crypto = require('crypto')
var isA = require('joi')
var bufferEqualConstantTime = require('buffer-equal-constant-time')
var HEX = require('../routes/validators').HEX_STRING

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

module.exports = function (log, config) {

  return {
    schema: SCHEMA,
    add: add,
    validate: validate
  }

  function add(data, metadata, doNotTrack) {
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

    return data
  }

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

function calculateFlowTime (time, flowBeginTime) {
  if (time <= flowBeginTime) {
    return 0
  }

  return time - flowBeginTime
}
