/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var path = require('path')
var sinon = require('sinon')
var proxyquire = require('proxyquire')

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
var mocks = {
  mozlog: sinon.spy(function () {
    return logger
  })
}
mocks.mozlog.config = sinon.spy()
mocks[path.resolve(__dirname, '../../lib') + '/./metrics/statsd'] = function () {
  return statsd
}
var log = proxyquire('../../lib/log', mocks)('foo', 'bar')

test(
  'initialised correctly',
  function (t) {
    t.equal(mocks.mozlog.config.callCount, 1, 'mozlog.config was called once')
    var args = mocks.mozlog.config.args[0]
    t.equal(args.length, 1, 'mozlog.config was passed one argument')
    t.equal(Object.keys(args[0]).length, 3, 'mozlog.config argument had with three properties')
    t.equal(args[0].app, 'bar', 'app property was correct')
    t.equal(args[0].level, 'foo', 'level property was correct')
    t.equal(args[0].stream, process.stderr, 'stream property was correct')

    t.equal(mocks.mozlog.callCount, 1, 'mozlog was called once')
    t.ok(mocks.mozlog.config.calledBefore(mocks.mozlog), 'mozlog was called after mozlog.config')
    t.equal(mocks.mozlog.args[0].length, 0, 'mozlog was passed no arguments')

    t.equal(statsd.init.callCount, 1, 'statsd.init was called once')
    t.equal(statsd.init.args[0].length, 0, 'statsd.init was passed no arguments')

    t.equal(statsd.write.callCount, 0, 'statsd.write was not called')
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
    t.equal(typeof log.event, 'function', 'log.event method was exported')
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
    log.activityEvent('wibble', {
      headers: {}
    }, {
      uid: 42
    })

    t.equal(logger.info.callCount, 1, 'logger.info was called once')
    var args = logger.info.args[0]
    t.equal(args.length, 2, 'logger.info was passed two arguments')
    t.equal(args[0], 'activityEvent', 'first argument was correct')
    t.equal(Object.keys(args[1]).length, 2, 'second argument had two properties')
    t.equal(args[1].event, 'wibble', 'event property was correct')
    t.equal(args[1].uid, 42, 'uid property was correct')

    t.equal(statsd.write.callCount, 1, 'statsd.write was called once')
    args = statsd.write.args[0]
    t.equal(args.length, 1, 'statsd.write was passed one argument')
    t.equal(args[0], logger.info.args[0][1], 'statsd.write argument was correct')

    t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
    t.equal(logger.error.callCount, 0, 'logger.error was not called')
    t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
    t.equal(logger.warn.callCount, 0, 'logger.warn was not called')

    t.end()

    logger.info.reset()
    statsd.write.reset()
  }
)

test(
  'log.activityEvent with User-Agent request header',
  function (t) {
    log.activityEvent('foo', {
      headers: {
        'user-agent': 'bar'
      }
    }, {
      uid: 'baz'
    })

    t.equal(logger.info.callCount, 1, 'logger.info was called once')
    var args = logger.info.args[0]
    t.equal(Object.keys(args[1]).length, 3, 'second argument had three properties')
    t.equal(args[1].event, 'foo', 'event property was correct')
    t.equal(args[1].userAgent, 'bar', 'userAgent property was correct')
    t.equal(args[1].uid, 'baz', 'uid property was correct')

    t.equal(statsd.write.callCount, 1, 'statsd.write was called once')
    t.equal(statsd.write.args[0][0], args[1], 'statsd.write argument was correct')

    t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
    t.equal(logger.error.callCount, 0, 'logger.error was not called')
    t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
    t.equal(logger.warn.callCount, 0, 'logger.warn was not called')

    t.end()

    logger.info.reset()
    statsd.write.reset()
  }
)

test(
  'log.activityEvent with service payload parameter',
  function (t) {
    log.activityEvent('foo', {
      headers: {},
      payload: {
        service: 'bar'
      }
    }, {
      uid: 'baz'
    })

    t.equal(logger.info.callCount, 1, 'logger.info was called once')
    var args = logger.info.args[0]
    t.equal(Object.keys(args[1]).length, 3, 'second argument had three properties')
    t.equal(args[1].service, 'bar', 'service property was correct')

    t.equal(statsd.write.callCount, 1, 'statsd.write was called once')
    t.equal(statsd.write.args[0][0], args[1], 'statsd.write argument was correct')

    t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
    t.equal(logger.error.callCount, 0, 'logger.error was not called')
    t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
    t.equal(logger.warn.callCount, 0, 'logger.warn was not called')

    t.end()

    logger.info.reset()
    statsd.write.reset()
  }
)

test(
  'log.activityEvent with extra data',
  function (t) {
    log.activityEvent('foo', {
      headers: {}
    }, {
      bar: 'baz',
      uid: 42,
      qux: 'wibble'
    })

    t.equal(logger.info.callCount, 1, 'logger.info was called once')
    var args = logger.info.args[0]
    t.equal(Object.keys(args[1]).length, 4, 'second argument had four properties')
    t.equal(args[1].bar, 'baz', 'first extra data property was correct')
    t.equal(args[1].qux, 'wibble', 'second extra data property was correct')

    t.equal(statsd.write.callCount, 1, 'statsd.write was called once')
    t.equal(statsd.write.args[0][0], args[1], 'statsd.write argument was correct')

    t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
    t.equal(logger.error.callCount, 0, 'logger.error was not called')
    t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
    t.equal(logger.warn.callCount, 0, 'logger.warn was not called')

    t.end()

    logger.info.reset()
    statsd.write.reset()
  }
)

test(
  'log.activityEvent with no data',
  function (t) {
    log.activityEvent('foo', {
      headers: {}
    })

    t.equal(logger.error.callCount, 1, 'logger.error was called once')
    var args = logger.error.args[0]
    t.equal(args.length, 2, 'logger.error was passed two arguments')
    t.equal(args[0], 'log.activityEvent', 'first argument was correct')
    t.equal(Object.keys(args[1]).length, 2, 'second argument had two properties')
    t.equal(args[1].data, undefined, 'data property was undefined')

    t.equal(statsd.write.callCount, 0, 'statsd.write was not called')
    t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
    t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
    t.equal(logger.warn.callCount, 0, 'logger.warn was not called')
    t.equal(logger.info.callCount, 0, 'logger.info was not called')

    t.end()

    logger.error.reset()
  }
)

test(
  'log.activityEvent with no uid',
  function (t) {
    log.activityEvent('foo', {
      headers: {}
    }, {
      foo: 'bar'
    })

    t.equal(logger.error.callCount, 1, 'logger.error was called once')
    var args = logger.error.args[0]
    t.equal(Object.keys(args[1].data).length, 1, 'data property had one property')
    t.equal(args[1].data.foo, 'bar', 'data property had correct property')

    t.equal(statsd.write.callCount, 0, 'statsd.write was not called')
    t.equal(logger.debug.callCount, 0, 'logger.debug was not called')
    t.equal(logger.critical.callCount, 0, 'logger.critical was not called')
    t.equal(logger.warn.callCount, 0, 'logger.warn was not called')
    t.equal(logger.info.callCount, 0, 'logger.info was not called')

    t.end()

    logger.error.reset()
  }
)

