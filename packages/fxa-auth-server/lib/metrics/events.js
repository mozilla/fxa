/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

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
  'device.updated'
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
  'device.updated'
])

const IGNORE_FLOW_EVENTS_FROM_SERVICES = {
  'account.signed': 'content-server'
}

module.exports = log => {
  return {
    /**
     * Emit a flow event and/or an activity event.
     *
     * @name emitMetricsEvent
     * @this request
     * @param {String} event
     * @param {Object} [data]
     */
    emit (event, data) {
      const request = this

      return P.resolve().then(() => {
        if (ACTIVITY_EVENTS.has(event)) {
          return log.activityEvent(event, request, data)
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

        return log.flowEvent(event, request)
      })
    }
  }
}

