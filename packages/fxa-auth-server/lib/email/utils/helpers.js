/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function getHeaderValue(headerName, message){
  var value = ''
  if (message.mail && message.mail.headers) {
    message.mail.headers.some(function (header) {
      if (header.name === headerName) {
        value = header.value
        return true
      }

      return false
    })
  }

  return value
}

function logFlowEventFromMessage(log, message, type) {
  const currentTime = Date.now()
  var templateName = getHeaderValue('X-Template-Name', message)

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

module.exports = {
  logFlowEventFromMessage: logFlowEventFromMessage,
  getHeaderValue: getHeaderValue
}
