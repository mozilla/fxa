/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const emailDomains = require('../../../config/popular-email-domains')
let amplitude

function getInsensitiveHeaderValueFromArray(headerName, headers) {
  var value = ''
  var headerNameNormalized = headerName.toLowerCase()
  headers.some(function (header) {
    if (header.name.toLowerCase() === headerNameNormalized) {
      value = header.value
      return true
    }

    return false
  })

  return value
}

function getInsensitiveHeaderValueFromObject(headerName, headers) {
  var headerNameNormalized = headerName.toLowerCase()
  var value = ''
  Object.keys(headers).some(function (name) {
    if (name.toLowerCase() === headerNameNormalized) {
      value = headers[name]
      return true
    }

    return false
  })
  return value
}

function getHeaderValue(headerName, message){
  var headers = message.mail && message.mail.headers || message.headers
  if (Array.isArray(headers)) {
    return getInsensitiveHeaderValueFromArray(headerName, headers)
  } else if (headers) {
    return getInsensitiveHeaderValueFromObject(headerName, headers)
  } else {
    return ''
  }
}

function logEmailEventSent(log, message) {
  const emailEventInfo = {
    op: 'emailEvent',
    template: message.template,
    type: 'sent'
  }

  emailEventInfo['flow_id'] = getHeaderValue('X-Flow-Id', message)
  emailEventInfo.locale = getHeaderValue('Content-Language', message)

  const addrs = [message.email].concat(message.ccEmails || [])

  addrs.forEach(addr => {
    const msg = Object.assign({}, emailEventInfo)
    msg.domain = getAnonymizedEmailDomain(addr)
    log.info(msg)
  })

  logAmplitudeEvent(log, message, emailEventInfo)
}

function logAmplitudeEvent (log, message, eventInfo) {
  if (! amplitude) {
    amplitude = require('../../metrics/amplitude')(log)
  }

  amplitude(`email.${eventInfo.template}.${eventInfo.type}`, {
    app: {
      locale: eventInfo.locale,
      ua: {}
    },
    auth: {},
    query: {},
    payload: {}
  }, {
    device_id: getHeaderValue('X-Device-Id', message),
    service: getHeaderValue('X-Service-Id', message),
    uid: getHeaderValue('X-Uid', message)
  }, {
    flow_id: eventInfo.flow_id,
    time: Date.now()
  })
}

function logEmailEventFromMessage(log, message, type, emailDomain) {
  const templateName = getHeaderValue('X-Template-Name', message)
  const flowId = getHeaderValue('X-Flow-Id', message)
  const locale = getHeaderValue('Content-Language', message)

  const emailEventInfo = {
    domain: emailDomain,
    locale: locale,
    op: 'emailEvent',
    template: templateName,
    type: type
  }

  if (flowId) {
    emailEventInfo['flow_id'] = flowId
  }

  if (message.bounce) {
    emailEventInfo.bounced = true
  }

  if (message.complaint) {
    emailEventInfo.complaint = true
  }

  log.info(emailEventInfo)

  logAmplitudeEvent(log, message, emailEventInfo)
}

function logFlowEventFromMessage(log, message, type) {
  const currentTime = Date.now()
  const templateName = getHeaderValue('X-Template-Name', message)

  // Log flow metrics if `flowId` and `flowBeginTime` specified in headers
  const flowId = getHeaderValue('X-Flow-Id', message)
  const flowBeginTime = getHeaderValue('X-Flow-Begin-Time', message)
  const elapsedTime = currentTime - flowBeginTime

  if (flowId && flowBeginTime && (elapsedTime > 0) && type && templateName) {
    const eventName = `email.${templateName}.${type}`

    // Flow events have a specific event and structure that must be emitted.
    // Ref `gather` in https://github.com/mozilla/fxa-auth-server/blob/master/lib/metrics/context.js
    const flowEventInfo = {
      event: eventName,
      time: currentTime,
      flow_id: flowId,
      flow_time: elapsedTime
    }

    log.flowEvent(flowEventInfo)
  } else {
    log.error({ op: 'handleBounce.flowEvent', templateName, type, flowId, flowBeginTime, currentTime})
  }
}

function getAnonymizedEmailDomain(email) {
  // This function returns an email domain if it is considered a popular domain,
  // which means it is in `./config/popular-email-domains.js`. Otherwise, it
  // return `other` as domain.
  const tokens = email.split('@')
  const emailDomain = tokens[1]
  var anonymizedEmailDomain = 'other'
  if (emailDomain && emailDomains.has(emailDomain)) {
    anonymizedEmailDomain = emailDomain
  }

  return anonymizedEmailDomain
}

module.exports = {
  logEmailEventSent: logEmailEventSent,
  logEmailEventFromMessage: logEmailEventFromMessage,
  logFlowEventFromMessage: logFlowEventFromMessage,
  getHeaderValue: getHeaderValue,
  getAnonymizedEmailDomain: getAnonymizedEmailDomain
}
