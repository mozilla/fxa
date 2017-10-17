/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var sinon = require('sinon')
var proxyquire = require('proxyquire')

var logger = {
  debug: sinon.spy(),
  error: sinon.spy(),
  critical: sinon.spy(),
  warn: sinon.spy(),
  info: sinon.spy()
}
var mocks = {
  mozlog: sinon.spy(function () {
    return logger
  })
}
mocks.mozlog.config = sinon.spy()
const log = proxyquire('../../lib/log', mocks)('foo', 'test')

const emitRouteFlowEvent = sinon.spy()

describe('log', () => {
  it(
    'initialised correctly',
    () => {
      assert.equal(mocks.mozlog.config.callCount, 1, 'mozlog.config was called once')
      var args = mocks.mozlog.config.args[0]
      assert.equal(args.length, 1, 'mozlog.config was passed one argument')
      assert.equal(Object.keys(args[0]).length, 4, 'number of mozlog.config arguments was correct')
      assert.equal(args[0].app, 'test', 'app property was correct')
      assert.equal(args[0].level, 'foo', 'level property was correct')
      assert.equal(args[0].stream, process.stderr, 'stream property was correct')

      assert.equal(mocks.mozlog.callCount, 1, 'mozlog was called once')
      assert.ok(mocks.mozlog.config.calledBefore(mocks.mozlog), 'mozlog was called after mozlog.config')
      assert.equal(mocks.mozlog.args[0].length, 0, 'mozlog was passed no arguments')

      assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      assert.equal(logger.error.callCount, 0, 'logger.error was not called')
      assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')
      assert.equal(logger.info.callCount, 0, 'logger.info was not called')

      assert.equal(typeof log.trace, 'function', 'log.trace method was exported')
      assert.equal(typeof log.error, 'function', 'log.error method was exported')
      assert.equal(typeof log.fatal, 'function', 'log.fatal method was exported')
      assert.equal(typeof log.warn, 'function', 'log.warn method was exported')
      assert.equal(typeof log.info, 'function', 'log.info method was exported')
      assert.equal(typeof log.begin, 'function', 'log.begin method was exported')
      assert.equal(typeof log.notifyAttachedServices, 'function', 'log.notifyAttachedServices method was exported')
      assert.equal(typeof log.activityEvent, 'function', 'log.activityEvent method was exported')
      assert.equal(log.activityEvent.length, 1, 'log.activityEvent expects 1 argument')
      assert.equal(typeof log.flowEvent, 'function', 'log.flowEvent method was exported')
      assert.equal(log.flowEvent.length, 1, 'log.flowEvent expects 1 argument')
      assert.equal(typeof log.amplitudeEvent, 'function', 'log.amplitudeEvent method was exported')
      assert.equal(log.amplitudeEvent.length, 1, 'log.amplitudeEvent expects 1 argument')
      assert.equal(typeof log.summary, 'function', 'log.summary method was exported')
    }
  )

  it(
    '.activityEvent',
    () => {
      log.activityEvent({
        event: 'foo',
        uid: 'bar'
      })

      assert.equal(logger.info.callCount, 1, 'logger.info was called once')
      const args = logger.info.args[0]
      assert.equal(args.length, 2, 'logger.info was passed two arguments')
      assert.equal(args[0], 'activityEvent', 'first argument was correct')
      assert.deepEqual(args[1], {
        event: 'foo',
        uid: 'bar'
      }, 'second argument was event data')

      assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      assert.equal(logger.error.callCount, 0, 'logger.error was not called')
      assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')

      logger.info.reset()
    }
  )

  it(
    '.activityEvent with missing data',
    () => {
      log.activityEvent()

      assert.equal(logger.error.callCount, 1, 'logger.error was called once')
      const args = logger.error.args[0]
      assert.equal(args.length, 2, 'logger.error was passed two arguments')
      assert.equal(args[0], 'log.activityEvent', 'first argument was function name')
      assert.deepEqual(args[1], {
        op: 'log.activityEvent',
        data: undefined
      }, 'argument was correct')

      assert.equal(logger.info.callCount, 0, 'logger.info was not called')
      assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')

      logger.error.reset()
    }
  )

  it(
    '.activityEvent with missing uid',
    () => {
      log.activityEvent({
        event: 'wibble'
      })

      assert.equal(logger.error.callCount, 1, 'logger.error was called once')
      const args = logger.error.args[0]
      assert.equal(args.length, 2, 'logger.error was passed two arguments')
      assert.equal(args[0], 'log.activityEvent', 'first argument was function name')
      assert.deepEqual(args[1], {
        op: 'log.activityEvent',
        data: {
          event: 'wibble'
        }
      }, 'argument was correct')

      assert.equal(logger.info.callCount, 0, 'logger.info was not called')
      assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')

      logger.error.reset()
    }
  )

  it(
    '.activityEvent with missing event',
    () => {
      log.activityEvent({
        uid: 'wibble'
      })

      assert.equal(logger.error.callCount, 1, 'logger.error was called once')
      const args = logger.error.args[0]
      assert.equal(args.length, 2, 'logger.error was passed two arguments')
      assert.equal(args[0], 'log.activityEvent', 'first argument was function name')
      assert.deepEqual(args[1], {
        op: 'log.activityEvent',
        data: {
          uid: 'wibble'
        }
      }, 'argument was correct')

      assert.equal(logger.info.callCount, 0, 'logger.info was not called')
      assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')

      logger.error.reset()
    }
  )

  it(
    '.flowEvent',
    () => {
      log.flowEvent({
        event: 'wibble',
        flow_id: 'blee',
        flow_time: 1000,
        time: 1483557217331
      })

      assert.equal(logger.info.callCount, 1, 'logger.info was called once')
      const args = logger.info.args[0]
      assert.equal(args.length, 2, 'logger.info was passed two arguments')
      assert.equal(args[0], 'flowEvent', 'first argument was correct')
      assert.deepEqual(args[1], {
        event: 'wibble',
        flow_id: 'blee',
        flow_time: 1000,
        time: 1483557217331
      }, 'second argument was event data')

      assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')
      assert.equal(logger.error.callCount, 0, 'logger.error was not called')

      logger.info.reset()
    }
  )

  it(
    '.flowEvent with missing data',
    () => {
      log.flowEvent()

      assert.equal(logger.error.callCount, 1, 'logger.error was called once')
      const args = logger.error.args[0]
      assert.equal(args.length, 2, 'logger.error was passed two arguments')
      assert.equal(args[0], 'log.flowEvent', 'first argument was function name')
      assert.deepEqual(args[1], {
        op: 'log.flowEvent',
        data: undefined
      }, 'argument was correct')

      assert.equal(logger.info.callCount, 0, 'logger.info was not called')
      assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')

      logger.error.reset()
    }
  )

  it(
    '.flowEvent with missing event',
    () => {
      log.flowEvent({
        flow_id: 'wibble',
        flow_time: 1000,
        time: 1483557217331
      })

      assert.equal(logger.error.callCount, 1, 'logger.error was called once')
      const args = logger.error.args[0]
      assert.equal(args.length, 2, 'logger.error was passed two arguments')
      assert.equal(args[0], 'log.flowEvent', 'first argument was function name')
      assert.deepEqual(args[1], {
        op: 'log.flowEvent',
        data: {
          flow_id: 'wibble',
          flow_time: 1000,
          time: 1483557217331
        }
      }, 'argument was correct')

      assert.equal(logger.info.callCount, 0, 'logger.info was not called')
      assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')

      logger.error.reset()
    }
  )

  it(
    '.flowEvent with missing flow_id',
    () => {
      log.flowEvent({
        event: 'wibble',
        flow_time: 1000,
        time: 1483557217331
      })

      assert.equal(logger.error.callCount, 1, 'logger.error was called once')
      const args = logger.error.args[0]
      assert.equal(args.length, 2, 'logger.error was passed two arguments')
      assert.equal(args[0], 'log.flowEvent', 'first argument was function name')
      assert.deepEqual(args[1], {
        op: 'log.flowEvent',
        data: {
          event: 'wibble',
          flow_time: 1000,
          time: 1483557217331
        }
      }, 'argument was correct')

      assert.equal(logger.info.callCount, 0, 'logger.info was not called')
      assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')

      logger.error.reset()
    }
  )

  it(
    '.flowEvent with missing flow_time',
    () => {
      log.flowEvent({
        event: 'wibble',
        flow_id: 'blee',
        time: 1483557217331
      })

      assert.equal(logger.error.callCount, 1, 'logger.error was called once')
      const args = logger.error.args[0]
      assert.equal(args.length, 2, 'logger.error was passed two arguments')
      assert.equal(args[0], 'log.flowEvent', 'first argument was function name')
      assert.deepEqual(args[1], {
        op: 'log.flowEvent',
        data: {
          event: 'wibble',
          flow_id: 'blee',
          time: 1483557217331
        }
      }, 'argument was correct')

      assert.equal(logger.info.callCount, 0, 'logger.info was not called')
      assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')

      logger.error.reset()
    }
  )

  it(
    '.flowEvent with missing time',
    () => {
      log.flowEvent({
        event: 'wibble',
        flow_id: 'blee',
        flow_time: 1000
      })

      assert.equal(logger.error.callCount, 1, 'logger.error was called once')
      const args = logger.error.args[0]
      assert.equal(args.length, 2, 'logger.error was passed two arguments')
      assert.equal(args[0], 'log.flowEvent', 'first argument was function name')
      assert.deepEqual(args[1], {
        op: 'log.flowEvent',
        data: {
          event: 'wibble',
          flow_id: 'blee',
          flow_time: 1000
        }
      }, 'argument was correct')

      assert.equal(logger.info.callCount, 0, 'logger.info was not called')
      assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')

      logger.error.reset()
    }
  )

  it('.amplitudeEvent', () => {
    log.amplitudeEvent({ event_type: 'foo', device_id: 'bar', user_id: 'baz' })

    assert.equal(logger.info.callCount, 1, 'logger.info was called once')
    const args = logger.info.args[0]
    assert.equal(args.length, 2, 'logger.info was passed two arguments')
    assert.equal(args[0], 'amplitudeEvent', 'first argument was correct')
    assert.deepEqual(args[1], {
      event_type: 'foo',
      device_id: 'bar',
      user_id: 'baz'
    }, 'second argument was event data')

    assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
    assert.equal(logger.error.callCount, 0, 'logger.error was not called')
    assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
    assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')

    logger.info.reset()
  })

  it('.amplitudeEvent with missing data', () => {
    log.amplitudeEvent()

    assert.equal(logger.error.callCount, 1, 'logger.error was called once')
    const args = logger.error.args[0]
    assert.equal(args.length, 2, 'logger.error was passed two arguments')
    assert.equal(args[0], 'amplitude.missingData', 'first argument was error op')
    assert.deepEqual(args[1], {
      op: 'amplitude.missingData',
      data: undefined
    }, 'second argument was correct')

    assert.equal(logger.info.callCount, 0, 'logger.info was not called')
    assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
    assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
    assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')

    logger.error.reset()
  })

  it('.amplitudeEvent with missing event_type', () => {
    log.amplitudeEvent({ device_id: 'foo', user_id: 'bar' })

    assert.equal(logger.error.callCount, 1, 'logger.error was called once')
    const args = logger.error.args[0]
    assert.equal(args.length, 2, 'logger.error was passed two arguments')
    assert.equal(args[0], 'amplitude.missingData', 'first argument was error op')
    assert.deepEqual(args[1], {
      op: 'amplitude.missingData',
      data: { device_id: 'foo', user_id: 'bar' }
    }, 'second argument was correct')

    assert.equal(logger.info.callCount, 0, 'logger.info was not called')
    assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
    assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
    assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')

    logger.error.reset()
  })

  it('.amplitudeEvent with missing device_id and user_id', () => {
    log.amplitudeEvent({ event_type: 'foo' })

    assert.equal(logger.error.callCount, 1, 'logger.error was called once')
    const args = logger.error.args[0]
    assert.equal(args.length, 2, 'logger.error was passed two arguments')
    assert.equal(args[0], 'amplitude.missingData', 'first argument was error op')
    assert.deepEqual(args[1], {
      op: 'amplitude.missingData',
      data: { event_type: 'foo' }
    }, 'second argument was correct')

    assert.equal(logger.info.callCount, 0, 'logger.info was not called')
    assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
    assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
    assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')

    logger.error.reset()
  })

  it('.amplitudeEvent with missing device_id', () => {
    log.amplitudeEvent({ event_type: 'wibble', user_id: 'blee' })

    assert.equal(logger.info.callCount, 1, 'logger.info was called once')
    const args = logger.info.args[0]
    assert.equal(args.length, 2, 'logger.info was passed two arguments')
    assert.equal(args[0], 'amplitudeEvent', 'first argument was correct')
    assert.deepEqual(args[1], {
      event_type: 'wibble',
      user_id: 'blee'
    }, 'second argument was event data')

    assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
    assert.equal(logger.error.callCount, 0, 'logger.error was not called')
    assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
    assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')

    logger.info.reset()
  })

  it('.amplitudeEvent with missing user_id', () => {
    log.amplitudeEvent({ event_type: 'foo', device_id: 'bar' })

    assert.equal(logger.info.callCount, 1, 'logger.info was called once')
    const args = logger.info.args[0]
    assert.equal(args.length, 2, 'logger.info was passed two arguments')
    assert.equal(args[0], 'amplitudeEvent', 'first argument was correct')
    assert.deepEqual(args[1], {
      event_type: 'foo',
      device_id: 'bar'
    }, 'second argument was event data')

    assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
    assert.equal(logger.error.callCount, 0, 'logger.error was not called')
    assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
    assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')

    logger.info.reset()
  })

  it(
    '.error removes PII from error objects',
    () => {
      var err = new Error()
      err.email = 'test@example.com'
      log.error({ op: 'unexpectedError', err: err })

      assert.equal(logger.error.callCount, 1, 'logger.error was called once')
      var args = logger.error.args[0]
      assert.equal(args[0], 'unexpectedError', 'logger.error received "op" value')
      assert.equal(Object.keys(args[1]).length, 3, 'log info has three fields')
      assert.equal(args[1].email, 'test@example.com', 'email is reported in top-level fields')
      assert(! args[1].err.email, 'email should not be reported in error object')

      logger.error.reset()
    }
  )

  describe('.summary', () => {

    beforeEach(() => {
      logger.info.reset()
      logger.error.reset()
    })

    it('should log an info message and call request.emitRouteFlowEvent', () => {
      log.summary({
        app: {},
        emitRouteFlowEvent: emitRouteFlowEvent,
        headers: {},
        info: {
          received: Date.now()
        },
        path: '/v1/frobnicate',
        payload: {}
      }, {
        code: 200
      })

      assert.equal(logger.info.callCount, 1)
      assert.equal(logger.info.args[0][1].op, 'request.summary')
      assert.equal(emitRouteFlowEvent.callCount, 1)
      assert.equal(emitRouteFlowEvent.args[0].length, 1)
      assert.deepEqual(emitRouteFlowEvent.args[0][0], { code: 200 })
      assert.equal(logger.error.callCount, 0)
    })
  })
})
