/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const emailDomains = require('../../../config/popular-email-domains')

function getHeaderValue(headerName, message){
  var value = ''
  var headerNameNormalized = headerName.toLowerCase()
  if (message.mail && message.mail.headers) {
    message.mail.headers.some(function (header) {
      if (header.name.toLowerCase() === headerNameNormalized) {
        value = header.value
        return true
      }

      return false
    })
  }

  return value
}

function logEmailEventSent(log, message) {
  const emailDomain = getAnonymizedEmailDomain(message.email)
  const emailEventInfo = {
    domain: emailDomain,
    op: 'emailEvent',
    template: message.template,
    type: 'sent'
  }

  if (message.headers && message.headers['X-Flow-Id']) {
    emailEventInfo['flow_id'] = message.headers['X-Flow-Id']
  }
  if (message.headers && message.headers['Content-Language']) {
    emailEventInfo.locale = message.headers['Content-Language']
  }


  log.info(emailEventInfo)
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
