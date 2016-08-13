/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var sinon = require('sinon')
var proxyquire = require('proxyquire')
var P = require('../../lib/promise')

var logger = {
  debug: sinon.spy(),
  error: sinon.spy(),
  critical: sinon.spy(),
  warn: sinon.spy(),
  info: sinon.spy()
}
var statsd = {
  init: sinon.spy(),
  write: sinon.spy()
}
var metricsContext = {
  gather: sinon.spy(function (data, request) {
    return P.resolve(request.payload && request.payload.metricsContext)
  })
}
var mocks = {
  mozlog: sinon.spy(function () {
    return logger
  })
}
mocks.mozlog.config = sinon.spy()
mocks['./metrics/statsd'] = function () {
  return statsd
}
var log = proxyquire('../../lib/log', mocks)('foo', 'bar')
log.setMetricsContext(metricsContext)

test(
  'initialised correctly',
  function (t) {
    t.equal(mocks.mozlog.config.callCount, 1, 'mozlog.config was called once')
    var args = mocks.mozlog.config.args[0]
    t.equal(args.length, 1, 'mozlog.config was passed one argument')
    t.equal(Object.keys(args[0]).length, 4, 'number of mozlog.config arguments was correct')
    t.equal(args[0].app, 'bar', 'app property was correct')
    t.equal(args[0].level, 'foo', 'level property was correct')
    t.equal(args[0].stream, process.stderr, 'stream property was correct')

    t.equal(mocks.mozlog.callCount, 1, 'mozlog was called once')
    t.ok(mocks.mozlog.config.calledBefore(mocks.mozlog), 'mozlog was called after mozlog.config')
    t.equal(mocks.mozlog.args[0].length, 0, 'mozlog was passed no arguments')

    t.equal(statsd.init.callCount, 1, 'statsd.init was called once')
    t.equal(statsd.init.args[0].length, 0, 'statsd.init was passed no arguments')

    t.equal(statsd.write.callCount, 0, 'statsd.write was not called')
    t.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
    t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
    t.equal(logger.error.callCount, 0, 'logger.error was not called')
    t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
    t.equal(logger.warn.callCount, 0, 'logger.warn was not called')
    t.equal(logger.info.callCount, 0, 'logger.info was not called')

    t.equal(typeof log.trace, 'function', 'log.trace method was exported')
    t.equal(typeof log.error, 'function', 'log.error method was exported')
    t.equal(typeof log.fatal, 'function', 'log.fatal method was exported')
    t.equal(typeof log.warn, 'function', 'log.warn method was exported')
    t.equal(typeof log.info, 'function', 'log.info method was exported')
    t.equal(typeof log.begin, 'function', 'log.begin method was exported')
    t.equal(typeof log.notifyAttachedServices, 'function', 'log.notifyAttachedServices method was exported')
    t.equal(typeof log.activityEvent, 'function', 'log.activityEvent method was exported')
    t.equal(typeof log.increment, 'function', 'log.increment method was exported')
    t.equal(typeof log.stat, 'function', 'log.stat method was exported')
    t.equal(typeof log.summary, 'function', 'log.summary method was exported')

    t.end()
  }
)

test(
  'log.activityEvent',
  function (t) {
    var request = {
      headers: {
        'user-agent': 'foo'
      },
      payload: {
        metricsContext: {}
      }
    }
    return log.activityEvent('bar', request, {
      uid: 'baz'
    }).then(function () {
      t.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')
      var args = metricsContext.gather.args[0]
      t.equal(args.length, 3, 'metricsContext.gather was passed three arguments')
      t.equal(typeof args[0], 'object', 'first argument was object')
      t.notEqual(args[0], null, 'first argument was not null')
      t.equal(Object.keys(args[0]).length, 2, 'first argument had two properties')
      t.equal(args[0].event, 'bar', 'event property was correct')
      t.equal(args[0].userAgent, 'foo', 'userAgent property was correct')
      t.equal(args[1], request, 'second argument was request object')
      t.equal(args[2], 'bar', 'third argument was event name')

      t.equal(logger.info.callCount, 2, 'logger.info was called twice')
      args = logger.info.args[0]
      t.equal(args.length, 2, 'logger.info was passed two arguments')
      t.equal(args[0], 'activityEvent', 'first argument was correct')
      t.equal(typeof args[1], 'object', 'second argument was object')
      t.notEqual(args[1], null, 'second argument was not null')
      t.equal(Object.keys(args[1]).length, 3, 'second argument had three properties')
      t.equal(args[1].uid, 'baz', 'uid property was correct')

      // flow event data
      t.equal(logger.info.args[1][0], 'flowEvent', 'correct op name')
      t.equal(logger.info.args[1][1].event, 'bar', 'correct event name')

      t.equal(statsd.write.callCount, 1, 'statsd.write was called once')
      args = statsd.write.args[0]
      t.equal(args.length, 1, 'statsd.write was passed one argument')
      t.equal(args[0], logger.info.args[0][1], 'statsd.write argument was correct')

      t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      t.equal(logger.error.callCount, 0, 'logger.error was not called')
      t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      t.equal(logger.warn.callCount, 0, 'logger.warn was not called')

      metricsContext.gather.reset()
      logger.info.reset()
      statsd.write.reset()
    })
  }
)

test(
  'log.activityEvent with service payload parameter',
  function (t) {
    return log.activityEvent('wibble', {
      headers: {},
      payload: {
        metricsContext: {},
        service: 'blee'
      }
    }, {
      uid: 'ugg'
    }).then(function () {
      t.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')
      var args = metricsContext.gather.args[0]
      t.equal(args[0].event, 'wibble', 'event property was correct')
      t.equal(args[0].userAgent, undefined, 'userAgent property was undefined')
      t.equal(typeof args[1], 'object', 'second argument was object')
      t.notEqual(args[1], null, 'second argument was not null')

      t.equal(logger.info.callCount, 2, 'logger.info was called once')
      args = logger.info.args[0]
      t.equal(Object.keys(args[1]).length, 3, 'second argument had three properties')
      t.equal(args[1].service, 'blee', 'service property was correct')
      t.equal(args[1].uid, 'ugg', 'service property was correct')
      t.equal(args[1].event, 'wibble', 'service property was correct')

      t.equal(statsd.write.callCount, 1, 'statsd.write was called once')
      t.equal(statsd.write.args[0][0], args[1], 'statsd.write argument was correct')

      t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      t.equal(logger.error.callCount, 0, 'logger.error was not called')
      t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      t.equal(logger.warn.callCount, 0, 'logger.warn was not called')

      metricsContext.gather.reset()
      logger.info.reset()
      statsd.write.reset()
    })
  }
)

test(
  'log.activityEvent with service query parameter',
  function (t) {
    return log.activityEvent('foo', {
      headers: {},
      payload: {
        metricsContext: {}
      },
      query: {
        service: 'bar'
      }
    }, {
      uid: 'baz'
    }).then(function () {
      t.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')
      t.equal(metricsContext.gather.args[0][0].event, 'foo', 'event property was correct')

      t.equal(logger.info.callCount, 2, 'logger.info was called twice')
      t.equal(logger.info.args[0][1].service, 'bar', 'service property was correct')

      // flow event data
      t.equal(logger.info.args[1][0], 'flowEvent', 'correct op name')
      t.equal(logger.info.args[1][1].event, 'foo', 'correct event name')
      t.equal(logger.info.args[1][1].service, 'bar', 'correct service name for the flow event')


      t.equal(statsd.write.callCount, 1, 'statsd.write was called once')
      t.equal(statsd.write.args[0][0], logger.info.args[0][1], 'statsd.write argument was correct')

      t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      t.equal(logger.error.callCount, 0, 'logger.error was not called')
      t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      t.equal(logger.warn.callCount, 0, 'logger.warn was not called')

      metricsContext.gather.reset()
      logger.info.reset()
      statsd.write.reset()
    })
  }
)

test(
  'log.activityEvent with service metricsContext property and service payload parameter',
  function (t) {
    return log.activityEvent('foo', {
      headers: {},
      payload: {
        metricsContext: {
          service: 'bar'
        },
        service: 'baz'
      }
    }, {
      uid: 'qux'
    }).then(function () {
      t.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

      // activity event data
      t.equal(logger.info.callCount, 2, 'logger.info was called twice')
      t.equal(logger.info.args[0][1].service, 'baz', 'service property was correct for the activity event')

      // flow event data
      t.equal(logger.info.args[1][0], 'flowEvent', 'correct op name')
      t.equal(logger.info.args[1][1].event, 'foo', 'correct event name')
      t.equal(logger.info.args[1][1].service, 'bar', 'correct service name for the flow event')

      t.equal(statsd.write.callCount, 1, 'statsd.write was called once')
      t.equal(statsd.write.args[0][0], logger.info.args[0][1], 'statsd.write argument was correct')

      t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      t.equal(logger.error.callCount, 0, 'logger.error was not called')
      t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      t.equal(logger.warn.callCount, 0, 'logger.warn was not called')

      metricsContext.gather.reset()
      logger.info.reset()
      statsd.write.reset()
    })
  }
)

test(
  'log.activityEvent with extra data',
  function (t) {
    return log.activityEvent('foo', {
      headers: {
        'user-agent': 'bar'
      },
      payload: {
        metricsContext: {}
      }
    }, {
      baz: 'qux',
      uid: 42,
      wibble: 'blee'
    }).then(function () {
      t.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')
      t.equal(Object.keys(metricsContext.gather.args[0][0]).length, 2, 'first argument had two properties')

      t.equal(logger.info.callCount, 2, 'logger.info was called twice')
      var args = logger.info.args[0]
      t.equal(Object.keys(args[1]).length, 5, 'second argument had 5 properties')
      t.equal(args[1].baz, 'qux', 'first extra data property was correct')
      t.equal(args[1].wibble, 'blee', 'second extra data property was correct')

      t.equal(statsd.write.callCount, 1, 'statsd.write was called once')
      t.equal(statsd.write.args[0][0], args[1], 'statsd.write argument was correct')

      t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      t.equal(logger.error.callCount, 0, 'logger.error was not called')
      t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      t.equal(logger.warn.callCount, 0, 'logger.warn was not called')

      metricsContext.gather.reset()
      logger.info.reset()
      statsd.write.reset()
    })
  }
)

test(
  'log.activityEvent with no data',
  function (t) {
    return log.activityEvent('foo', {
      headers: {},
      payload: {
        metricsContext: {}
      }
    }).then(function () {
      t.equal(logger.error.callCount, 1, 'logger.error was called once')
      var args = logger.error.args[0]
      t.equal(args.length, 2, 'logger.error was passed two arguments')
      t.equal(args[0], 'log.activityEvent', 'first argument was correct')
      t.equal(Object.keys(args[1]).length, 2, 'second argument had two properties')
      t.equal(args[1].data, undefined, 'data property was undefined')

      t.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
      t.equal(statsd.write.callCount, 0, 'statsd.write was not called')
      t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      t.equal(logger.warn.callCount, 0, 'logger.warn was not called')
      t.equal(logger.info.callCount, 0, 'logger.info was not called')

      logger.error.reset()
    })
  }
)

test(
  'log.activityEvent with no uid',
  function (t) {
    return log.activityEvent('foo', {
      headers: {},
      payload: {
        metricsContext: {}
      }
    }, {
      foo: 'bar'
    }).then(function () {
      t.equal(logger.error.callCount, 1, 'logger.error was called once')
      var args = logger.error.args[0]
      t.equal(Object.keys(args[1].data).length, 1, 'data property had one property')
      t.equal(args[1].data.foo, 'bar', 'data property had correct property')

      t.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
      t.equal(statsd.write.callCount, 0, 'statsd.write was not called')
      t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      t.equal(logger.warn.callCount, 0, 'logger.warn was not called')
      t.equal(logger.info.callCount, 0, 'logger.info was not called')

      logger.error.reset()
    })
  }
)


test(
  'log.flowEvent with bad event name',
  function (t) {
    return log.flowEvent(undefined).then(function () {
      t.equal(logger.error.callCount, 1, 'logger.error was called once')
      var args = logger.error.args[0]
      t.equal(args[0], 'log.flowEvent', 'correct op')
      t.equal(args[1].missingEvent, true, 'correct flag')

      t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      t.equal(logger.warn.callCount, 0, 'logger.warn was not called')
      t.equal(logger.info.callCount, 0, 'logger.info was not called')

      logger.error.reset()
    })
  }
)

test(
  'log.flowEvent with a bad request',
  function (t) {
    return log.flowEvent('some.event').then(function () {
      t.equal(logger.error.callCount, 1, 'logger.error was called once')
      var args = logger.error.args[0]
      t.equal(args[0], 'log.flowEvent', 'correct op')
      t.equal(args[1].badRequest, true, 'correct flag')

      t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      t.equal(logger.warn.callCount, 0, 'logger.warn was not called')
      t.equal(logger.info.callCount, 0, 'logger.info was not called')

      logger.error.reset()
    })
  }
)

test(
  'log.flowEvent properly logs with no errors',
  function (t) {
    return log.flowEvent('some.event', {
      headers: {
        'user-agent': 'bar'
      },
      payload: {
        metricsContext: {
          service: 'bar'
        },
        service: 'baz'
      }
    }).then(function () {
      t.equal(logger.info.callCount, 1, 'logger.info was called')
      var args = logger.info.args[0]
      t.equal(args[0], 'flowEvent', 'correct event name')
      t.equal(args[1].service, 'bar', 'correct metrics data')
      t.equal(args[1].event, 'some.event', 'correct event name')

      t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      t.equal(logger.warn.callCount, 0, 'logger.warn was not called')
      t.equal(logger.error.callCount, 0, 'logger.error was not called')

      logger.error.reset()
    })
  }
)


test(
  'log.error removes PII from error objects',
  function (t) {
    var err = new Error()
    err.email = 'test@example.com'
    log.error({ op: 'unexpectedError', err: err })

    t.equal(logger.error.callCount, 1, 'logger.error was called once')
    var args = logger.error.args[0]
    t.equal(args[0], 'unexpectedError', 'logger.error received "op" value')
    t.equal(Object.keys(args[1]).length, 3, 'log info has three fields')
    t.equal(args[1].email, 'test@example.com', 'email is reported in top-level fields')
    t.notOk(args[1].err.email, 'email should not be reported in error object')

    t.end()

    logger.error.reset()
  }
)
