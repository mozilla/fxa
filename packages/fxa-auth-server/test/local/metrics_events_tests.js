/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const sinon = require('sinon')
const P = require('../../lib/promise')
const log = {
  activityEvent: sinon.spy(() => {
    return P.resolve()
  }),
  flowEvent: sinon.spy(() => {
    return P.resolve()
  })
}
const events = require('../../lib/metrics/events')(log)

describe('metrics/events', () => {

  it('interface is correct', () => {
    assert.equal(typeof events, 'object', 'events is object')
    assert.notEqual(events, null, 'events is not null')
    assert.equal(Object.keys(events).length, 1, 'events has 1 property')

    assert.equal(typeof events.emit, 'function', 'events.emit is function')
    assert.equal(events.emit.length, 2, 'events.emit expects 2 arguments')

    assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
    assert.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')
  })

  it('.emit with activity event', () => {
    const request = {}
    const data = {}
    return events.emit.call(request, 'device.created', data)
      .then(() => {
        assert.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
        const args = log.activityEvent.args[0]
        assert.equal(args.length, 3, 'log.activityEvent was passed three arguments')
        assert.equal(args[0], 'device.created', 'first argument was event name')
        assert.equal(args[1], request, 'second argument was request object')
        assert.equal(args[2], data, 'third argument was event data')

        assert.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')

        log.activityEvent.reset()
      })
  })

  it('.emit with flow event', () => {
    const request = {}
    const data = {}
    return events.emit.call(request, 'account.reminder', data)
      .then(() => {
        assert.equal(log.flowEvent.callCount, 1, 'log.flowEvent was called once')
        const args = log.flowEvent.args[0]
        assert.equal(args.length, 2, 'log.flowEvent was passed two arguments')
        assert.equal(args[0], 'account.reminder', 'first argument was event name')
        assert.equal(args[1], request, 'second argument was request object')

        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')

        log.flowEvent.reset()
      })
  })

  it('.emit with hybrid activity/flow event', () => {
    const request = {}
    const data = {}
    return events.emit.call(request, 'account.created', data)
      .then(() => {
        assert.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
        let args = log.activityEvent.args[0]
        assert.equal(args.length, 3, 'log.activityEvent was passed three arguments')
        assert.equal(args[0], 'account.created', 'first argument was event name')
        assert.equal(args[1], request, 'second argument was request object')
        assert.equal(args[2], data, 'third argument was event data')

        assert.equal(log.flowEvent.callCount, 1, 'log.flowEvent was called once')
        args = log.flowEvent.args[0]
        assert.equal(args.length, 2, 'log.flowEvent was passed two arguments')
        assert.equal(args[0], 'account.created', 'first argument was event name')
        assert.equal(args[1], request, 'second argument was request object')

        log.activityEvent.reset()
        log.flowEvent.reset()
      })
  })

  it('.emit with content server account.signed event', () => {
    const request = {
      query: {
        service: 'content-server'
      }
    }
    const data = {}
    return events.emit.call(request, 'account.signed', data)
      .then(() => {
        assert.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
        assert.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')

        log.activityEvent.reset()
      })
  })

  it('.emit with sync account.signed event', () => {
    const request = {
      query: {
        service: 'sync'
      }
    }
    const data = {}
    return events.emit.call(request, 'account.signed', data)
      .then(() => {
        assert.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
        assert.equal(log.flowEvent.callCount, 1, 'log.flowEvent was called once')

        log.activityEvent.reset()
        log.flowEvent.reset()
      })
  })
})
