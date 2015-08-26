/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var tap = require('tap')
var test = tap.test

var StatsDCollector = require('../../lib/metrics/statsd')
var mockLog = {
  error: function () {}
}

test(
  'statsd init failure cases',
  function (t) {

    try {
      void new StatsDCollector()
    } catch (e) {
      t.equal(e.message, 'Log is required')
    }

    try {
      var statsd = new StatsDCollector(mockLog)
      statsd.init()
    } catch (e) {
      t.fail('should not throw')
    }

    t.end()
  }
)

test(
  'statsd init',
  function (t) {
    var statsd = new StatsDCollector(mockLog)
    statsd.init()
    t.equal(statsd.connected, true)
    t.end()
  }
)

test(
  'statsd write',
  function (t) {
    function StatsDMock() {
      return {
        socket: {},
        increment: function (name, value, sampleRate, tags) {
          t.equal(name, 'fxa.auth.some-event')
          t.equal(value, 1)
          t.ok(sampleRate)
          t.notOk(tags)
          t.end()
        }
      }
    }

    var statsd = new StatsDCollector(mockLog)
    statsd.init()
    statsd.client = new StatsDMock()
    statsd.write({
      event: 'some-event',
      uid: 'id'
    })
  }
)

test(
  'statsd write via log.increment',
  function (t) {
    function StatsDMock() {
      return {
        socket: {},
        increment: function (name, value, sampleRate, tags) {
          t.equal(name, 'fxa.auth.some-event')
          t.equal(value, 1)
          t.ok(sampleRate)
          t.notOk(tags)
          t.end()
        }
      }
    }

    var statsd = new StatsDCollector(mockLog)
    statsd.init()
    statsd.client = new StatsDMock()
    var log = require('../../lib/log')('info')
    log.statsd = statsd
    log.increment('some-event')
  }
)

test(
  'statsd write error',
  function (t) {
    var mockLog = {
      error: function (log) {
        t.equal(log.op, 'statsd')
        t.equal(log.err.message, 'Failed to send message')
        t.end()
      }
    }

    function StatsDMock() {
      return {
        socket: {},
        increment: function (name, value, sampleRate, tags, cb) {
          cb(new Error('Failed to send message'))
        }
      }
    }

    var statsd = new StatsDCollector(mockLog)
    statsd.init()
    statsd.client = new StatsDMock()
    statsd.write({
      event: 'some-event',
      uid: 'id'
    })
  }
)

test(
  'statsd close',
  function (t) {
    var statsd = new StatsDCollector(mockLog)
    statsd.init()
    t.equal(statsd.connected, true)
    statsd.close()
    t.equal(statsd.connected, false)
    t.end()
  }
)


