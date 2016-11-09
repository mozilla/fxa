/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
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
const metricsContext = {
  gather: sinon.spy(function (data) {
    return P.resolve(this.payload && {
      flow_id: this.payload.metricsContext.flowId,
      flowCompleteSignal: this.payload.metricsContext.flowCompleteSignal,
      service: this.payload.metricsContext.service
    })
  }),
  clear: sinon.spy()
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

describe('log', () => {
  it(
    'initialised correctly',
    () => {
      assert.equal(mocks.mozlog.config.callCount, 1, 'mozlog.config was called once')
      var args = mocks.mozlog.config.args[0]
      assert.equal(args.length, 1, 'mozlog.config was passed one argument')
      assert.equal(Object.keys(args[0]).length, 4, 'number of mozlog.config arguments was correct')
      assert.equal(args[0].app, 'bar', 'app property was correct')
      assert.equal(args[0].level, 'foo', 'level property was correct')
      assert.equal(args[0].stream, process.stderr, 'stream property was correct')

      assert.equal(mocks.mozlog.callCount, 1, 'mozlog was called once')
      assert.ok(mocks.mozlog.config.calledBefore(mocks.mozlog), 'mozlog was called after mozlog.config')
      assert.equal(mocks.mozlog.args[0].length, 0, 'mozlog was passed no arguments')

      assert.equal(statsd.init.callCount, 1, 'statsd.init was called once')
      assert.equal(statsd.init.args[0].length, 0, 'statsd.init was passed no arguments')

      assert.equal(statsd.write.callCount, 0, 'statsd.write was not called')
      assert.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
      assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
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
      assert.equal(typeof log.flowEvent, 'function', 'log.flowEvent method was exported')
      assert.equal(typeof log.increment, 'function', 'log.increment method was exported')
      assert.equal(typeof log.stat, 'function', 'log.stat method was exported')
      assert.equal(typeof log.summary, 'function', 'log.summary method was exported')
    }
  )

  it(
    '.activityEvent',
    () => {
      var request = {
        gatherMetricsContext: metricsContext.gather,
        headers: {
          'user-agent': 'foo'
        },
        payload: {
          metricsContext: {}
        }
      }
      log.activityEvent('bar', request, {
        uid: 'baz'
      })

      assert.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')

      assert.equal(logger.info.callCount, 1, 'logger.info was called once')
      let args = logger.info.args[0]
      assert.equal(args.length, 2, 'logger.info was passed two arguments')
      assert.equal(args[0], 'activityEvent', 'first argument was correct')
      assert.equal(typeof args[1], 'object', 'second argument was object')
      assert.notEqual(args[1], null, 'second argument was not null')
      assert.equal(Object.keys(args[1]).length, 3, 'second argument had three properties')
      assert.equal(args[1].uid, 'baz', 'uid property was correct')

      assert.equal(statsd.write.callCount, 1, 'statsd.write was called once')
      args = statsd.write.args[0]
      assert.equal(args.length, 1, 'statsd.write was passed one argument')
      assert.equal(args[0], logger.info.args[0][1], 'statsd.write argument was correct')

      assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      assert.equal(logger.error.callCount, 0, 'logger.error was not called')
      assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')

      logger.info.reset()
      statsd.write.reset()
    }
  )

  it(
    '.activityEvent with service payload parameter',
    () => {
      log.activityEvent('wibble', {
        gatherMetricsContext: metricsContext.gather,
        headers: {},
        payload: {
          metricsContext: {},
          service: 'blee'
        }
      }, {
        uid: 'ugg'
      })

      assert.equal(logger.info.callCount, 1, 'logger.info was called once')
      const args = logger.info.args[0]
      assert.equal(Object.keys(args[1]).length, 3, 'second argument had three properties')
      assert.equal(args[1].service, 'blee', 'service property was correct')
      assert.equal(args[1].uid, 'ugg', 'service property was correct')
      assert.equal(args[1].event, 'wibble', 'service property was correct')

      assert.equal(statsd.write.callCount, 1, 'statsd.write was called once')
      assert.equal(statsd.write.args[0][0], args[1], 'statsd.write argument was correct')

      assert.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
      assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      assert.equal(logger.error.callCount, 0, 'logger.error was not called')
      assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')

      logger.info.reset()
      statsd.write.reset()
    }
  )

  it(
    '.activityEvent with service query parameter',
    () => {
      log.activityEvent('foo', {
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
      })

      assert.equal(logger.info.callCount, 1, 'logger.info was called once')
      assert.equal(logger.info.args[0][1].service, 'bar', 'service property was correct')

      assert.equal(statsd.write.callCount, 1, 'statsd.write was called once')
      assert.equal(statsd.write.args[0][0], logger.info.args[0][1], 'statsd.write argument was correct')

      assert.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
      assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      assert.equal(logger.error.callCount, 0, 'logger.error was not called')
      assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')

      logger.info.reset()
      statsd.write.reset()
    }
  )

  it(
    '.activityEvent with extra data',
    () => {
      log.activityEvent('foo', {
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
      })

      assert.equal(logger.info.callCount, 1, 'logger.info was called once')
      const args = logger.info.args[0]
      assert.equal(Object.keys(args[1]).length, 5, 'second argument had 5 properties')
      assert.equal(args[1].baz, 'qux', 'first extra data property was correct')
      assert.equal(args[1].wibble, 'blee', 'second extra data property was correct')

      assert.equal(statsd.write.callCount, 1, 'statsd.write was called once')
      assert.equal(statsd.write.args[0][0], args[1], 'statsd.write argument was correct')

      assert.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
      assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      assert.equal(logger.error.callCount, 0, 'logger.error was not called')
      assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')

      logger.info.reset()
      statsd.write.reset()
    }
  )

  it(
    '.activityEvent with no data',
    () => {
      log.activityEvent('foo', {
        gatherMetricsContext: metricsContext.gather,
        headers: {},
        payload: {
          metricsContext: {}
        }
      })

      assert.equal(logger.error.callCount, 1, 'logger.error was called once')
      const args = logger.error.args[0]
      assert.equal(args.length, 2, 'logger.error was passed two arguments')
      assert.equal(args[0], 'log.activityEvent', 'first argument was correct')
      assert.equal(Object.keys(args[1]).length, 2, 'second argument had two properties')
      assert.equal(args[1].data, undefined, 'data property was undefined')

      assert.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
      assert.equal(statsd.write.callCount, 0, 'statsd.write was not called')
      assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')
      assert.equal(logger.info.callCount, 0, 'logger.info was not called')

      logger.error.reset()
    }
  )

  it(
    '.activityEvent with no uid',
    () => {
      log.activityEvent('foo', {
        gatherMetricsContext: metricsContext.gather,
        headers: {},
        payload: {
          metricsContext: {}
        }
      }, {
        foo: 'bar'
      })

      assert.equal(logger.error.callCount, 1, 'logger.error was called once')
      const args = logger.error.args[0]
      assert.equal(Object.keys(args[1].data).length, 1, 'data property had one property')
      assert.equal(args[1].data.foo, 'bar', 'data property had correct property')

      assert.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
      assert.equal(statsd.write.callCount, 0, 'statsd.write was not called')
      assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
      assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
      assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')
      assert.equal(logger.info.callCount, 0, 'logger.info was not called')

      logger.error.reset()
    }
  )

  it(
    '.flowEvent with bad event name',
    () => {
      return log.flowEvent(undefined, {
        clearMetricsContext: metricsContext.clear,
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
        assert.equal(logger.error.callCount, 1, 'logger.error was called once')
        const args = logger.error.args[0]
        assert.equal(args[0], 'log.flowEvent', 'correct op')
        assert.equal(args[1].missingEvent, true, 'correct flag')

        assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
        assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
        assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')
        assert.equal(logger.info.callCount, 0, 'logger.info was not called')
        assert.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')

        logger.error.reset()
      })
    }
  )

  it(
    '.flowEvent with a bad request',
    () => {
      return log.flowEvent('account.signed', {
        clearMetricsContext: metricsContext.clear,
        gatherMetricsContext: metricsContext.gather,
        payload: {
          metricsContext: {
            flowId: 'foo',
            service: 'bar'
          }
        }
      }).then(() => {
        assert.equal(logger.error.callCount, 1, 'logger.error was called once')
        const args = logger.error.args[0]
        assert.equal(args[0], 'log.flowEvent', 'correct op')
        assert.equal(args[1].event, 'account.signed', 'correct event name')
        assert.equal(args[1].badRequest, true, 'correct flag')

        assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
        assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
        assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')
        assert.equal(logger.info.callCount, 0, 'logger.info was not called')
        assert.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')

        logger.error.reset()
      })
    }
  )

  it(
    '.flowEvent properly logs with no errors',
    () => {
      return log.flowEvent('account.signed', {
        clearMetricsContext: metricsContext.clear,
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
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

        assert.equal(logger.info.callCount, 1, 'logger.info was called once')
        const args = logger.info.args[0]
        assert.equal(args[0], 'flowEvent', 'correct event name')
        assert.equal(args[1].event, 'account.signed', 'correct event name')
        assert.equal(args[1].flow_id, 'bar', 'correct flow id')
        assert.equal(args[1].service, 'baz', 'correct metrics data')

        assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
        assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
        assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')
        assert.equal(logger.error.callCount, 0, 'logger.error was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')

        metricsContext.gather.reset()
        logger.info.reset()
      })
    }
  )

  it(
    '.flowEvent with matching flowCompleteSignal',
    () => {
      return log.flowEvent('account.login', {
        clearMetricsContext: metricsContext.clear,
        gatherMetricsContext: metricsContext.gather,
        headers: {
          'user-agent': 'foo'
        },
        payload: {
          metricsContext: {
            flowId: 'bar',
            service: 'baz',
            flowCompleteSignal: 'account.login'
          },
          service: 'qux'
        }
      }).then(() => {
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

        assert.equal(metricsContext.clear.callCount, 1, 'metricsContext.clear was called once')
        assert.equal(metricsContext.clear.args[0].length, 0, 'metricsContext.clear was passed no arguments')

        assert.equal(logger.info.callCount, 2, 'logger.info was called twice')
        let args = logger.info.args[0]
        assert.equal(args[0], 'flowEvent', 'correct event type first time')
        assert.equal(args[1].event, 'account.login', 'correct event name first time')
        assert.equal(args[1].flow_id, 'bar', 'correct flow id first time')
        assert.equal(args[1].service, 'baz', 'correct metrics data first time')
        args = logger.info.args[1]
        assert.equal(args[0], 'flowEvent', 'correct event type second time')
        assert.equal(args[1].event, 'flow.complete', 'correct event name second time')
        assert.equal(args[1].flow_id, 'bar', 'correct flow id second time')
        assert.equal(args[1].service, 'baz', 'correct metrics data second time')

        assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
        assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
        assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')
        assert.equal(logger.error.callCount, 0, 'logger.error was not called')

        metricsContext.gather.reset()
        metricsContext.clear.reset()
        logger.info.reset()
      })
    }
  )

  it(
    '.flowEvent with non-matching flowCompleteSignal',
    () => {
      return log.flowEvent('account.login', {
        clearMetricsContext: metricsContext.clear,
        gatherMetricsContext: metricsContext.gather,
        headers: {
          'user-agent': 'foo'
        },
        payload: {
          metricsContext: {
            flowId: 'bar',
            service: 'baz',
            flowCompleteSignal: 'account.signed'
          },
          service: 'qux'
        }
      }).then(() => {
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')
        assert.equal(logger.info.callCount, 1, 'logger.info was called once')

        assert.equal(logger.debug.callCount, 0, 'logger.debug was not called')
        assert.equal(logger.critical.callCount, 0, 'logger.critical was not called')
        assert.equal(logger.warn.callCount, 0, 'logger.warn was not called')
        assert.equal(logger.error.callCount, 0, 'logger.error was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')

        metricsContext.gather.reset()
        logger.info.reset()
      })
    }
  )

  it(
    '.flowEvent with flow event and missing flowId',
    () => {
      return log.flowEvent('account.login', {
        clearMetricsContext: metricsContext.clear,
        gatherMetricsContext: metricsContext.gather,
        headers: {
          'user-agent': 'foo'
        },
        payload: {
          metricsContext: {}
        }
      }).then(() => {
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

        assert.equal(logger.info.callCount, 0, 'logger.info was not called')

        assert.equal(logger.error.callCount, 1, 'logger.error was called once')
        const args = logger.error.args[0]
        assert.equal(args.length, 2, 'logger.error was passed two arguments')
        assert.equal(args[0], 'log.flowEvent')
        assert.deepEqual(args[1], {
          op: 'log.flowEvent',
          event: 'account.login',
          missingFlowId: true
        }, 'error data was correct')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')

        metricsContext.gather.reset()
        logger.error.reset()
      })
    }
  )

  it(
    '.flowEvent with optional flow event and missing flowId',
    () => {
      return log.flowEvent('account.keyfetch', {
        clearMetricsContext: metricsContext.clear,
        gatherMetricsContext: metricsContext.gather,
        headers: {
          'user-agent': 'foo'
        },
        payload: {
          metricsContext: {}
        }
      }).then(() => {
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(logger.info.callCount, 0, 'logger.info was not called')
        assert.equal(logger.error.callCount, 0, 'logger.error was not called')

        metricsContext.gather.reset()
      })
    }
  )

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
      assert(!args[1].err.email, 'email should not be reported in error object')

      logger.error.reset()
    }
  )
})
