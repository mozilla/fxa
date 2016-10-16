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
  gather: sinon.spy(function (data) {
    return P.resolve(this.payload && {
      flow_id: this.payload.metricsContext.flowId,
      service: this.payload.metricsContext.service
    })
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
    t.equal(typeof log.flowEvent, 'function', 'log.flowEvent method was exported')
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
      gatherMetricsContext: metricsContext.gather,
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
      t.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')

      t.equal(logger.info.callCount, 1, 'logger.info was called once')
      var args = logger.info.args[0]
      t.equal(args.length, 2, 'logger.info was passed two arguments')
      t.equal(args[0], 'activityEvent', 'first argument was correct')
      t.equal(typeof args[1], 'object', 'second argument was object')
      t.notEqual(args[1], null, 'second argument was not null')
      t.equal(Object.keys(args[1]).length, 3, 'second argument had three properties')
      t.equal(args[1].uid, 'baz', 'uid property was correct')

      t.equal(statsd.write.callCount, 1, 'statsd.write was called once')
      args = statsd.write.args[0]
      t.equal(args.length, 1, 'statsd.write was passed one argument')
      t.equal(args[0], logger.info.args[0][1], 'statsd.write argument was correct')

      t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      t.equal(logger.error.callCount, 0, 'logger.error was not called')
      t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      t.equal(logger.warn.callCount, 0, 'logger.warn was not called')

      logger.info.reset()
      statsd.write.reset()
    })
  }
)

test(
  'log.activityEvent with flow event',
  function (t) {
    var request = {
      gatherMetricsContext: metricsContext.gather,
      headers: {
        'user-agent': 'foo'
      },
      payload: {
        metricsContext: {
          flowId: 'bar'
        }
      }
    }
    return log.activityEvent('account.created', request, {
      uid: 'baz'
    }).then(function () {
      t.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')
      var args = metricsContext.gather.args[0]
      t.equal(args.length, 1, 'metricsContext.gather was passed one argument')
      t.equal(typeof args[0], 'object', 'argument was object')
      t.notEqual(args[0], null, 'argument was not null')
      t.equal(Object.keys(args[0]).length, 2, 'argument had two properties')
      t.equal(args[0].event, 'account.created', 'event property was correct')
      t.equal(args[0].userAgent, 'foo', 'userAgent property was correct')
      t.equal(metricsContext.gather.thisValues[0], request, 'this was request object')

      t.equal(logger.info.callCount, 2, 'logger.info was called twice')
      t.equal(logger.info.args[0][0], 'activityEvent', 'first call was activityEvent')
      t.equal(logger.info.args[1][0], 'flowEvent', 'second call was flowEvent')
      t.equal(logger.info.args[1][1].event, 'account.created', 'flowEvent had correct event name')

      t.equal(statsd.write.callCount, 1, 'statsd.write was called once')

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
  'log.activityEvent with flow event and missing flowId',
  function (t) {
    var request = {
      gatherMetricsContext: metricsContext.gather,
      headers: {
        'user-agent': 'foo'
      },
      payload: {
        metricsContext: {}
      }
    }
    return log.activityEvent('account.created', request, {
      uid: 'bar'
    }).then(function () {
      t.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

      t.equal(logger.info.callCount, 1, 'logger.info was called once')
      t.equal(logger.info.args[0][0], 'activityEvent', 'call was activityEvent')

      t.equal(logger.error.callCount, 1, 'logger.error was called once')
      var args = logger.error.args[0]
      t.equal(args.length, 2, 'logger.error was passed two arguments')
      t.equal(args[0], 'log.flowEvent')
      t.deepEqual(args[1], {
        op: 'log.flowEvent',
        event: 'account.created',
        missingFlowId: true
      }, 'error data was correct')

      t.equal(statsd.write.callCount, 1, 'statsd.write was called once')

      t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      t.equal(logger.warn.callCount, 0, 'logger.warn was not called')

      metricsContext.gather.reset()
      logger.info.reset()
      logger.error.reset()
      statsd.write.reset()
    })
  }
)

test(
  'log.activityEvent with optional flow event and missing flowId',
  function (t) {
    var request = {
      gatherMetricsContext: metricsContext.gather,
      headers: {
        'user-agent': 'foo'
      },
      payload: {
        metricsContext: {}
      }
    }
    return log.activityEvent('account.signed', request, {
      uid: 'bar'
    }).then(function () {
      t.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

      t.equal(logger.info.callCount, 1, 'logger.info was called once')
      t.equal(logger.info.args[0][0], 'activityEvent', 'call was activityEvent')

      t.equal(logger.error.callCount, 0, 'logger.error was not called')

      t.equal(statsd.write.callCount, 1, 'statsd.write was called once')

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
      gatherMetricsContext: metricsContext.gather,
      headers: {},
      payload: {
        metricsContext: {},
        service: 'blee'
      }
    }, {
      uid: 'ugg'
    }).then(function () {
      t.equal(logger.info.callCount, 1, 'logger.info was called once')
      var args = logger.info.args[0]
      t.equal(Object.keys(args[1]).length, 3, 'second argument had three properties')
      t.equal(args[1].service, 'blee', 'service property was correct')
      t.equal(args[1].uid, 'ugg', 'service property was correct')
      t.equal(args[1].event, 'wibble', 'service property was correct')

      t.equal(statsd.write.callCount, 1, 'statsd.write was called once')
      t.equal(statsd.write.args[0][0], args[1], 'statsd.write argument was correct')

      t.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
      t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      t.equal(logger.error.callCount, 0, 'logger.error was not called')
      t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      t.equal(logger.warn.callCount, 0, 'logger.warn was not called')

      logger.info.reset()
      statsd.write.reset()
    })
  }
)

test(
  'log.activityEvent with service query parameter',
  function (t) {
    return log.activityEvent('foo', {
      gatherMetricsContext: metricsContext.gather,
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
      t.equal(logger.info.callCount, 1, 'logger.info was called once')
      t.equal(logger.info.args[0][1].service, 'bar', 'service property was correct')

      t.equal(statsd.write.callCount, 1, 'statsd.write was called once')
      t.equal(statsd.write.args[0][0], logger.info.args[0][1], 'statsd.write argument was correct')

      t.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
      t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      t.equal(logger.error.callCount, 0, 'logger.error was not called')
      t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      t.equal(logger.warn.callCount, 0, 'logger.warn was not called')

      logger.info.reset()
      statsd.write.reset()
    })
  }
)

test(
  'log.activityEvent with extra data',
  function (t) {
    return log.activityEvent('foo', {
      gatherMetricsContext: metricsContext.gather,
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
      t.equal(logger.info.callCount, 1, 'logger.info was called once')
      var args = logger.info.args[0]
      t.equal(Object.keys(args[1]).length, 5, 'second argument had 5 properties')
      t.equal(args[1].baz, 'qux', 'first extra data property was correct')
      t.equal(args[1].wibble, 'blee', 'second extra data property was correct')

      t.equal(statsd.write.callCount, 1, 'statsd.write was called once')
      t.equal(statsd.write.args[0][0], args[1], 'statsd.write argument was correct')

      t.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
      t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      t.equal(logger.error.callCount, 0, 'logger.error was not called')
      t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      t.equal(logger.warn.callCount, 0, 'logger.warn was not called')

      logger.info.reset()
      statsd.write.reset()
    })
  }
)

test(
  'log.activityEvent with no data',
  function (t) {
    return log.activityEvent('foo', {
      gatherMetricsContext: metricsContext.gather,
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
      gatherMetricsContext: metricsContext.gather,
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
  t => {
    return log.flowEvent(undefined, {
      gatherMetricsContext: metricsContext.gather,
      headers: {
        'user-agent': 'foo'
      },
      payload: {
        metricsContext: {
          flowId: 'bar',
          service: 'baz'
        }
      }
    }).then(() => {
      t.equal(logger.error.callCount, 1, 'logger.error was called once')
      const args = logger.error.args[0]
      t.equal(args[0], 'log.flowEvent', 'correct op')
      t.equal(args[1].missingEvent, true, 'correct flag')

      t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      t.equal(logger.warn.callCount, 0, 'logger.warn was not called')
      t.equal(logger.info.callCount, 0, 'logger.info was not called')
      t.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')

      logger.error.reset()
    })
  }
)

test(
  'log.flowEvent with a bad request',
  t => {
    return log.flowEvent('account.signed', {
      gatherMetricsContext: metricsContext.gather,
      payload: {
        metricsContext: {
          flowId: 'foo',
          service: 'bar'
        }
      }
    }).then(() => {
      t.equal(logger.error.callCount, 1, 'logger.error was called once')
      const args = logger.error.args[0]
      t.equal(args[0], 'log.flowEvent', 'correct op')
      t.equal(args[1].event, 'account.signed', 'correct event name')
      t.equal(args[1].badRequest, true, 'correct flag')

      t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      t.equal(logger.warn.callCount, 0, 'logger.warn was not called')
      t.equal(logger.info.callCount, 0, 'logger.info was not called')
      t.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')

      logger.error.reset()
    })
  }
)

test(
  'log.flowEvent with content server account.signed event',
  t => {
    return log.flowEvent('account.signed', {
      gatherMetricsContext: metricsContext.gather,
      headers: {
        'user-agent': 'foo'
      },
      payload: {
        metricsContext: {
          flowId: 'bar',
          service: 'baz'
        },
        service: 'qux'
      },
      query: {
        service: 'content-server'
      }
    }).then(() => {
      t.equal(logger.error.callCount, 0, 'logger.error was not called')
      t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      t.equal(logger.warn.callCount, 0, 'logger.warn was not called')
      t.equal(logger.info.callCount, 0, 'logger.info was not called')
      t.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
    })
  }
)

test(
  'log.flowEvent properly logs with no errors',
  t => {
    return log.flowEvent('account.signed', {
      gatherMetricsContext: metricsContext.gather,
      headers: {
        'user-agent': 'foo'
      },
      payload: {
        metricsContext: {
          flowId: 'bar',
          service: 'baz'
        },
        service: 'qux'
      }
    }).then(() => {
      t.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

      t.equal(logger.info.callCount, 1, 'logger.info was called once')
      const args = logger.info.args[0]
      t.equal(args[0], 'flowEvent', 'correct event name')
      t.equal(args[1].event, 'account.signed', 'correct event name')
      t.equal(args[1].flow_id, 'bar', 'correct flow id')
      t.equal(args[1].service, 'baz', 'correct metrics data')

      t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      t.equal(logger.warn.callCount, 0, 'logger.warn was not called')
      t.equal(logger.error.callCount, 0, 'logger.error was not called')

      metricsContext.gather.reset()
      logger.info.reset()
    })
  }
)

test(
  'log.flowEvent with flow event and missing flowId',
  t => {
    return log.flowEvent('account.login', {
      gatherMetricsContext: metricsContext.gather,
      headers: {
        'user-agent': 'foo'
      },
      payload: {
        metricsContext: {}
      }
    }).then(() => {
      t.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

      t.equal(logger.info.callCount, 0, 'logger.info was not called')

      t.equal(logger.error.callCount, 1, 'logger.error was called once')
      const args = logger.error.args[0]
      t.equal(args.length, 2, 'logger.error was passed two arguments')
      t.equal(args[0], 'log.flowEvent')
      t.deepEqual(args[1], {
        op: 'log.flowEvent',
        event: 'account.login',
        missingFlowId: true
      }, 'error data was correct')

      metricsContext.gather.reset()
      logger.error.reset()
    })
  }
)

test(
  'log.flowEvent with optional flow event and missing flowId',
  t => {
    return log.flowEvent('account.keyfetch', {
      gatherMetricsContext: metricsContext.gather,
      headers: {
        'user-agent': 'foo'
      },
      payload: {
        metricsContext: {}
      }
    }).then(() => {
      t.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')
      t.equal(logger.info.callCount, 0, 'logger.info was not called')
      t.equal(logger.error.callCount, 0, 'logger.error was not called')

      metricsContext.gather.reset()
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
