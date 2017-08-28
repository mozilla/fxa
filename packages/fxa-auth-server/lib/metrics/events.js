/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const error = require('../error')
const P = require('../promise')

const ACTIVITY_EVENTS = new Set([
  'account.changedPassword',
  'account.confirmed',
  'account.created',
  'account.deleted',
  'account.keyfetch',
  'account.login',
  'account.reset',
  'account.signed',
  'account.verified',
  'device.created',
  'device.deleted',
  'device.updated',
  'sync.sentTabToDevice'
])

// We plan to emit a vast number of flow events to cover all
// kinds of success and error steps of the sign-in/up journey.
// It's far easier to define the events that *aren't* a flow
// event than it is to define those that are.
const NOT_FLOW_EVENTS = new Set([
  'account.changedPassword',
  'account.deleted',
  'device.created',
  'device.deleted',
  'device.updated',
  'sync.sentTabToDevice'
])

// It's an error if a flow event doesn't have a flow_id
// but some events are also emitted outside of user flows.
// Don't log an error for those events.
const OPTIONAL_FLOW_EVENTS = {
  'account.keyfetch': true,
  'account.reset': true,
  'account.signed': true
}

const IGNORE_FLOW_EVENTS_FROM_SERVICES = {
  'account.signed': 'content-server'
}

const FLOW_EVENT_ROUTES = new Set([
  '/account/create',
  '/account/destroy',
  '/account/keys',
  '/account/login',
  '/account/login/send_unblock_code',
  '/account/reset',
  '/recovery_email/resend_code',
  '/recovery_email/verify_code',
  '/sms'
])

const PATH_PREFIX = /^\/v1/

module.exports = log => {
  const amplitude = require('./amplitude')(log)

  return {
    /**
     * Asynchronously emit a flow event and/or an activity event.
     *
     * @name emitMetricsEvent
     * @this request
     * @param {String} event
     * @param {Object} [data]
     * @returns {Promise}
     */
    emit (event, data) {
      if (! event) {
        log.error({ op: 'metricsEvents.emit', missingEvent: true })
        return P.resolve()
      }

      const request = this

      return P.resolve().then(() => {
        if (ACTIVITY_EVENTS.has(event)) {
          emitActivityEvent(event, request, data)
        }
      })
      .then(() => {
        if (NOT_FLOW_EVENTS.has(event)) {
          return
        }

        const service = request.query && request.query.service
        if (service && IGNORE_FLOW_EVENTS_FROM_SERVICES[event] === service) {
          return
        }

        return emitFlowEvent(event, request, data)
      })
      .then(metricsContext => {
        amplitude(event, request, data, metricsContext)

        if (metricsContext && event === metricsContext.flowCompleteSignal) {
          log.flowEvent(Object.assign({}, metricsContext, { event: 'flow.complete' }))
          amplitude('flow.complete', request, data, metricsContext)
          request.clearMetricsContext()
        }
      })
    },

    /**
     * Asynchronously emit a flow event indicating the route response.
     *
     * @name emitRouteFlowEvent
     * @this request
     * @param {Object} response
     * @returns {Promise}
     */
    emitRouteFlowEvent (response) {
      const request = this
      const path = request.path.replace(PATH_PREFIX, '')

      if (! FLOW_EVENT_ROUTES.has(path)) {
        return P.resolve()
      }

      let status = response.statusCode || response.output.statusCode
      const errno = response.errno || (response.output && response.output.errno)

      if (status >= 400) {
        if (errno === error.ERRNO.INVALID_PARAMETER && ! request.validateMetricsContext()) {
          // Don't emit flow events if the metrics context failed validation
          return P.resolve()
        }

        status = `${status}.${errno || 999}`
      }

      return emitFlowEvent(`route.${path}.${status}`, request)
        .then(data => {
          if (status >= 200 && status < 300) {
            // Limit to success responses so that short-cut logic (e.g. errors, 304s)
            // doesn't skew distribution of the performance data
            return emitPerformanceEvent(path, request, data)
          }
        })
    }
  }

  function emitActivityEvent (event, request, data) {
    data = Object.assign({
      event,
      userAgent: request.headers['user-agent']
    }, data)

    optionallySetService(data, request)

    log.activityEvent(data)
  }

  function emitFlowEvent (event, request, optionalData) {
    if (! request || ! request.headers) {
      log.error({ op: 'metricsEvents.emitFlowEvent', event, badRequest: true })
      return P.resolve()
    }

    return request.gatherMetricsContext({
      event: event,
      locale: request.app && request.app.locale,
      userAgent: request.headers['user-agent']
    }).then(data => {
      if (data.flow_id) {
        const uid = coalesceUid(optionalData, request)
        if (uid) {
          data.uid = uid
        }

        log.flowEvent(data)
      } else if (! OPTIONAL_FLOW_EVENTS[event]) {
        log.error({ op: 'metricsEvents.emitFlowEvent', event, missingFlowId: true })
      }

      return data
    })
  }

  function emitPerformanceEvent (path, request, data) {
    return log.flowEvent(Object.assign({}, data, {
      event: `route.performance.${path}`,
      flow_time: Date.now() - request.info.received
    }))
  }
}

function optionallySetService (data, request) {
  if (data.service) {
    return
  }

  data.service =
    (request.payload && request.payload.service) ||
    (request.query && request.query.service)
}

function coalesceUid (data, request) {
  if (data && data.uid) {
    return data.uid
  }

  return request.auth &&
    request.auth.credentials &&
    request.auth.credentials.uid
}

