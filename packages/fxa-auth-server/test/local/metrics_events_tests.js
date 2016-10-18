/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const sinon = require('sinon')
const test = require('../ptaptest')
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

test('events interface is correct', t => {
  t.equal(typeof events, 'object', 'events is object')
  t.notEqual(events, null, 'events is not null')
  t.equal(Object.keys(events).length, 1, 'events has 1 property')

  t.equal(typeof events.emit, 'function', 'events.emit is function')
  t.equal(events.emit.length, 2, 'events.emit expects 2 arguments')

  t.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
  t.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')

  t.end()
})

test('events.emit with activity event', t => {
  const request = {}
  const data = {}
  return events.emit.call(request, 'device.created', data)
    .then(() => {
      t.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
      const args = log.activityEvent.args[0]
      t.equal(args.length, 3, 'log.activityEvent was passed three arguments')
      t.equal(args[0], 'device.created', 'first argument was event name')
      t.equal(args[1], request, 'second argument was request object')
      t.equal(args[2], data, 'third argument was event data')

      t.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')

      log.activityEvent.reset()
    })
})

test('events.emit with flow event', t => {
  const request = {}
  const data = {}
  return events.emit.call(request, 'account.reminder', data)
    .then(() => {
      t.equal(log.flowEvent.callCount, 1, 'log.flowEvent was called once')
      const args = log.flowEvent.args[0]
      t.equal(args.length, 2, 'log.flowEvent was passed two arguments')
      t.equal(args[0], 'account.reminder', 'first argument was event name')
      t.equal(args[1], request, 'second argument was request object')

      t.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')

      log.flowEvent.reset()
    })
})

test('events.emit with hybrid activity/flow event', t => {
  const request = {}
  const data = {}
  return events.emit.call(request, 'account.created', data)
    .then(() => {
      t.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
      let args = log.activityEvent.args[0]
      t.equal(args.length, 3, 'log.activityEvent was passed three arguments')
      t.equal(args[0], 'account.created', 'first argument was event name')
      t.equal(args[1], request, 'second argument was request object')
      t.equal(args[2], data, 'third argument was event data')

      t.equal(log.flowEvent.callCount, 1, 'log.flowEvent was called once')
      args = log.flowEvent.args[0]
      t.equal(args.length, 2, 'log.flowEvent was passed two arguments')
      t.equal(args[0], 'account.created', 'first argument was event name')
      t.equal(args[1], request, 'second argument was request object')

      log.activityEvent.reset()
      log.flowEvent.reset()
    })
})

test('events.emit with content server account.signed event', t => {
  const request = {
    query: {
      service: 'content-server'
    }
  }
  const data = {}
  return events.emit.call(request, 'account.signed', data)
    .then(() => {
      t.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
      t.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')

      log.activityEvent.reset()
    })
})

test('events.emit with sync account.signed event', t => {
  const request = {
    query: {
      service: 'sync'
    }
  }
  const data = {}
  return events.emit.call(request, 'account.signed', data)
    .then(() => {
      t.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
      t.equal(log.flowEvent.callCount, 1, 'log.flowEvent was called once')

      log.activityEvent.reset()
      log.flowEvent.reset()
    })
})

