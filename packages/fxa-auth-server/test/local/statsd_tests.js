/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var StatsDCollector = require('../../lib/metrics/statsd')
var mockLog = require('../mocks').mockLog()

describe('metrics/statsd', () => {
  it(
    'statsd init failure cases',
    () => {
      assert.throws(() => {
        void new StatsDCollector()
      }, 'Log is required')

      assert.doesNotThrow(() => {
        var statsd = new StatsDCollector(mockLog)
        statsd.init()
      })
    }
  )

  it(
    'statsd init',
    () => {
      var statsd = new StatsDCollector(mockLog)
      statsd.init()
      assert.equal(statsd.connected, true)
    }
  )

  it(
    'statsd write',
    () => {
      let count = 0
      function StatsDMock() {
        return {
          socket: {},
          increment: function (name, value, sampleRate, tags) {
            assert.equal(name, 'fxa.auth.some-event')
            assert.equal(value, 1)
            assert.ok(sampleRate)
            assert.equal(Array.isArray(tags), true)
            assert.equal(tags.length, 0)
            count++
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
      assert.equal(count, 1)
    }
  )

  it(
    'statsd write with tags',
    () => {
      let count = 0
      function StatsDMock() {
        return {
          socket: {},
          increment: function (name, value, sampleRate, tags) {
            assert.equal(name, 'fxa.auth.some-event')
            assert.equal(value, 1)
            assert.ok(sampleRate)
            assert.deepEqual(tags, [
              'agent_ua_family:Firefox',
              'agent_ua_version:43.0',
              'agent_ua_version_major:43',
              'agent_os_version:10.11',
              'agent_os_family:Mac OS X',
              'agent_os_major:10'
            ])
            count++
          }
        }
      }

      var statsd = new StatsDCollector(mockLog)
      statsd.init()
      statsd.client = new StatsDMock()
      statsd.write({
        event: 'some-event',
        uid: 'id',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:43.0) Gecko/20100101 Firefox/43.0'
      })
      assert.equal(count, 1)
    }
  )

  it(
    'statsd write via log.increment',
    () => {
      let count = 0
      function StatsDMock() {
        return {
          socket: {},
          increment: function (name, value, sampleRate, tags) {
            assert.equal(name, 'fxa.auth.some-event')
            assert.equal(value, 1)
            assert.ok(sampleRate)
            assert.equal(Array.isArray(tags), true)
            assert.equal(tags.length, 0)
            count++
          }
        }
      }

      var statsd = new StatsDCollector(mockLog)
      statsd.init()
      statsd.client = new StatsDMock()
      var log = require('../../lib/log')('info')
      log.statsd = statsd
      log.increment('some-event')
      assert.equal(count, 1)
    }
  )

  it(
    'statsd write error',
    () => {
      let count = 0
      var mockLog = {
        error: function (log) {
          assert.equal(log.op, 'statsd.increment')
          assert.equal(log.err.message, 'Failed to send message')
          count++
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
      assert.equal(count, 1)
    }
  )

  it(
    'statsd.timing',
    () => {
      let count = 0
      function StatsDMock() {
        return {
          socket: {},
          increment: function () {
            assert(false, 'statsd.increment should not be called')
          },
          timing: function () {
            assert.equal(arguments.length, 5, 'statsd.timing received the correct number arguments')
            assert.equal(arguments[0], 'fxa.auth.foo.time', 'statsd.timing received the correct name argument')
            assert.equal(arguments[1], 1, 'statsd.timing received the correct timing argument')
            assert.equal(typeof arguments[2], 'number', 'statsd.timing received the correct timing argument')
            assert.equal(arguments[3], undefined, 'statsd.timing received the correct tags argument')
            assert.equal(typeof arguments[4], 'function', 'statsd.timing received the correct callback argument')
            count++
          }
        }
      }

      var statsd = new StatsDCollector(mockLog)
      statsd.init()
      statsd.client = new StatsDMock()
      var log = require('../../lib/log')('info')
      log.statsd = statsd
      log.timing('foo', 1)
      assert.equal(count, 1)
    }
  )

  it(
    'statsd.timing error',
    () => {
      let count = 0
      var mockLog = {
        error: function (log) {
          assert.equal(log.op, 'statsd.timing')
          assert.equal(log.err, 'foo')
          count++
        }
      }

      function StatsDMock() {
        return {
          socket: {},
          timing: function () {
            arguments[4]('foo')
          }
        }
      }

      var statsd = new StatsDCollector(mockLog)
      statsd.init()
      statsd.client = new StatsDMock()
      statsd.timing('wibble', 42)
      assert.equal(count, 1)
    }
  )

  it(
    'statsd close',
    () => {
      var statsd = new StatsDCollector(mockLog)
      statsd.init()
      assert.equal(statsd.connected, true)
      statsd.close()
      assert.equal(statsd.connected, false)
    }
  )
})
