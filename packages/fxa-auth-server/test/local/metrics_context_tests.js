/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var sinon = require('sinon')
var test = require('../ptaptest')
var mocks = require('../mocks')
var log = mocks.spyLog()
var Memcached = require('memcached')
var metricsContext = require('../../lib/metrics/context')(log, {
  memcached: {
    address: '127.0.0.1:1121',
    idle: 500,
    lifetime: 30
  }
})
var P = require('../../lib/promise')

test(
  'metricsContext interface is correct',
  function (t) {
    t.equal(typeof metricsContext, 'object', 'metricsContext is object')
    t.notEqual(metricsContext, null, 'metricsContext is not null')
    t.equal(Object.keys(metricsContext).length, 4, 'metricsContext has 4 properties')

    t.equal(typeof metricsContext.schema, 'object', 'metricsContext.schema is object')
    t.notEqual(metricsContext.schema, null, 'metricsContext.schema is not null')

    t.equal(typeof metricsContext.stash, 'function', 'metricsContext.stash is function')
    t.equal(metricsContext.stash.length, 3, 'metricsContext.stash expects 3 arguments')

    t.equal(typeof metricsContext.gather, 'function', 'metricsContext.gather is function')
    t.equal(metricsContext.gather.length, 3, 'metricsContext.gather expects 3 arguments')

    t.equal(typeof metricsContext.validate, 'function', 'metricsContext.validate is function')
    t.equal(metricsContext.validate.length, 1, 'metricsContext.validate expects 1 argument')

    t.end()
  }
)

test(
  'metricsContext.stash',
  function (t) {
    sinon.stub(Memcached.prototype, 'setAsync', function () {
      return P.resolve('wibble')
    })
    metricsContext.stash({
      uid: 'foo',
      id: 'bar'
    }, 'baz', 'qux').then(function (result) {
      t.deepEqual(result, [ 'wibble' ], 'result is correct')

      t.equal(Memcached.prototype.setAsync.callCount, 1, 'memcached.setAsync was called once')
      t.equal(Memcached.prototype.setAsync.args[0].length, 3, 'memcached.setAsync was passed three arguments')
      t.equal(Memcached.prototype.setAsync.args[0][0], 'foo:bar:baz', 'first argument was correct')
      t.equal(Memcached.prototype.setAsync.args[0][1], 'qux', 'second argument was correct')
      t.equal(Memcached.prototype.setAsync.args[0][2], 30, 'third argument was correct')

      t.equal(log.error.callCount, 0, 'log.error was not called')

      Memcached.prototype.setAsync.restore()

      t.end()
    })
  }
)

test(
  'metricsContext.stash with two events',
  function (t) {
    sinon.stub(Memcached.prototype, 'setAsync', function () {
      return P.resolve('wibble')
    })
    metricsContext.stash({
      uid: 'foo',
      id: 'bar'
    }, [ 'baz', 'qux' ], 'blee').then(function (result) {
      t.deepEqual(result, [ 'wibble', 'wibble' ], 'result is correct')

      t.equal(Memcached.prototype.setAsync.callCount, 2, 'memcached.setAsync was called twice')
      t.equal(Memcached.prototype.setAsync.args[0][0], 'foo:bar:baz', 'first argument was correct in first call')
      t.equal(Memcached.prototype.setAsync.args[0][1], 'blee', 'second argument was correct in first call')
      t.equal(Memcached.prototype.setAsync.args[0][2], 30, 'third argument was correct in first call')
      t.equal(Memcached.prototype.setAsync.args[1][0], 'foo:bar:qux', 'first argument was correct in second call')
      t.equal(Memcached.prototype.setAsync.args[1][1], 'blee', 'second argument was correct in second call')
      t.equal(Memcached.prototype.setAsync.args[1][2], 30, 'third argument was correct in second call')

      t.equal(log.error.callCount, 0, 'log.error was not called')

      Memcached.prototype.setAsync.restore()

      t.end()
    })
  }
)

test(
  'metricsContext.stash error',
  function (t) {
    sinon.stub(Memcached.prototype, 'setAsync', function () {
      return P.reject('wibble')
    })
    metricsContext.stash({
      uid: 'foo',
      id: 'bar'
    }, 'baz', 'qux').then(function (result) {
      t.deepEqual(result, [ undefined ], 'result is undefined')

      t.equal(Memcached.prototype.setAsync.callCount, 1, 'memcached.setAsync was called once')

      t.equal(log.error.callCount, 1, 'log.error was called once')
      t.equal(log.error.args[0].length, 1, 'log.error was passed one argument')
      t.equal(log.error.args[0][0].op, 'metricsContext.stash', 'argument op property was correct')
      t.equal(log.error.args[0][0].err, 'wibble', 'argument err property was correct')

      Memcached.prototype.setAsync.restore()
      log.error.reset()

      t.end()
    })
  }
)

test(
  'metricsContext.stash without token',
  function (t) {
    sinon.stub(Memcached.prototype, 'setAsync', function () {
      return P.resolve('wibble')
    })
    metricsContext.stash(null, 'foo', 'bar').then(function (result) {
      t.equal(result, undefined, 'result is undefined')

      t.equal(log.error.callCount, 1, 'log.error was called once')
      t.equal(log.error.args[0].length, 1, 'log.error was passed one argument')
      t.equal(log.error.args[0][0].op, 'metricsContext.stash', 'op property was correct')
      t.equal(log.error.args[0][0].err.message, 'Invalid argument', 'err.message property was correct')
      t.equal(log.error.args[0][0].token, null, 'token property was correct')
      t.deepEqual(log.error.args[0][0].events, ['foo'], 'events property was correct')

      t.equal(Memcached.prototype.setAsync.callCount, 0, 'memcached.setAsync was not called')

      Memcached.prototype.setAsync.restore()
      log.error.reset()

      t.end()
    })
  }
)

test(
  'metricsContext.stash without event',
  function (t) {
    sinon.stub(Memcached.prototype, 'setAsync', function () {
      return P.resolve('wibble')
    })
    metricsContext.stash({
      uid: 'foo',
      id: 'bar'
    }, '', 'baz').then(function (result) {
      t.equal(result, undefined, 'result is undefined')

      t.equal(log.error.callCount, 1, 'log.error was called once')
      t.equal(log.error.args[0].length, 1, 'log.error was passed one argument')
      t.equal(log.error.args[0][0].op, 'metricsContext.stash', 'op property was correct')
      t.equal(log.error.args[0][0].err.message, 'Invalid argument', 'err.message property was correct')
      t.equal(log.error.args[0][0].token.uid, 'foo', 'token.uid property was correct')
      t.equal(log.error.args[0][0].token.id, 'bar', 'token.id property was correct')
      t.equal(log.error.args[0][0].events, '', 'events property was correct')

      t.equal(Memcached.prototype.setAsync.callCount, 0, 'memcached.setAsync was not called')

      Memcached.prototype.setAsync.restore()
      log.error.reset()

      t.end()
    })
  }
)

test(
  'metricsContext.stash without metadata',
  function (t) {
    sinon.stub(Memcached.prototype, 'setAsync', function () {
      return P.resolve('wibble')
    })
    metricsContext.stash({
      uid: 'foo',
      id: 'bar'
    }, 'baz').then(function (result) {
      t.equal(result, undefined, 'result is undefined')

      t.equal(Memcached.prototype.setAsync.callCount, 0, 'memcached.setAsync was not called')
      t.equal(log.error.callCount, 0, 'log.error was not called')

      Memcached.prototype.setAsync.restore()

      t.end()
    })
  }
)

test(
  'metricsContext.gather without metadata or session token',
  function (t) {
    metricsContext.gather({}, {}).then(function (result) {
      t.equal(typeof result, 'object', 'result is object')
      t.notEqual(result, null, 'result is not null')
      t.equal(Object.keys(result).length, 0, 'result is empty')

      t.equal(log.error.callCount, 0, 'log.error was not called')

      t.end()
    })
  }
)

test(
  'metricsContext.gather with metadata',
  function (t) {
    sinon.stub(Memcached.prototype, 'getAsync', function () {
      return P.resolve({
        flowId: 'not this flow id',
        flowBeginTime: 0
      })
    })
    sinon.stub(Memcached.prototype, 'delAsync', function () {
      return P.resolve()
    })
    var time = Date.now() - 1
    metricsContext.gather({}, {
      payload: {
        metricsContext: {
          flowId: 'mock flow id',
          flowBeginTime: time,
          context: 'mock context',
          entrypoint: 'mock entry point',
          migration: 'mock migration',
          service: 'mock service',
          utmCampaign: 'mock utm_campaign',
          utmContent: 'mock utm_content',
          utmMedium: 'mock utm_medium',
          utmSource: 'mock utm_source',
          utmTerm: 'mock utm_term',
          ignore: 'mock ignorable property'
        }
      }
    }).then(function (result) {
      t.equal(typeof result, 'object', 'result is object')
      t.notEqual(result, null, 'result is not null')
      t.equal(Object.keys(result).length, 12, 'result has 12 properties')
      t.ok(result.time > time, 'result.time seems correct')
      t.equal(result.flow_id, 'mock flow id', 'result.flow_id is correct')
      t.ok(result.flow_time > 0, 'result.flow_time is greater than zero')
      t.ok(result.flow_time < time, 'result.flow_time is less than the current time')
      t.equal(result.context, 'mock context', 'result.context is correct')
      t.equal(result.entrypoint, 'mock entry point', 'result.entrypoint is correct')
      t.equal(result.migration, 'mock migration', 'result.migration is correct')
      t.equal(result.service, 'mock service', 'result.service is correct')
      t.equal(result.utm_campaign, 'mock utm_campaign', 'result.utm_campaign is correct')
      t.equal(result.utm_content, 'mock utm_content', 'result.utm_content is correct')
      t.equal(result.utm_medium, 'mock utm_medium', 'result.utm_medium is correct')
      t.equal(result.utm_source, 'mock utm_source', 'result.utm_source is correct')
      t.equal(result.utm_term, 'mock utm_term', 'result.utm_term is correct')

      t.equal(Memcached.prototype.getAsync.callCount, 0, 'memcached.getAsync was not called')
      t.equal(Memcached.prototype.delAsync.callCount, 0, 'memcached.delAsync was not called')
      t.equal(log.error.callCount, 0, 'log.error was not called')

      Memcached.prototype.getAsync.restore()
      Memcached.prototype.delAsync.restore()

      t.end()
    })
  }
)

test(
  'metricsContext.gather with bad flowBeginTime',
  function (t) {
    metricsContext.gather({}, {
      payload: {
        metricsContext: {
          flowBeginTime: Date.now() + 10000
        }
      }
    }).then(function (result) {
      t.equal(typeof result, 'object', 'result is object')
      t.notEqual(result, null, 'result is not null')
      t.strictEqual(result.flow_time, 0, 'result.time is zero')

      t.equal(log.error.callCount, 0, 'log.error was not called')

      t.end()
    })
  }
)

test(
  'metricsContext.gather with DNT header',
  function (t) {
    var time = Date.now() - 1
    metricsContext.gather({}, {
      headers: {
        dnt: '1'
      },
      payload: {
        metricsContext: {
          flowId: 'mock flow id',
          flowBeginTime: time,
          context: 'mock context',
          entrypoint: 'mock entry point',
          migration: 'mock migration',
          service: 'mock service',
          utmCampaign: 'mock utm_campaign',
          utmContent: 'mock utm_content',
          utmMedium: 'mock utm_medium',
          utmSource: 'mock utm_source',
          utmTerm: 'mock utm_term',
          ignore: 'mock ignorable property'
        }
      }
    }).then(function (result) {
      t.equal(Object.keys(result).length, 7, 'result has 7 properties')
      t.equal(result.utm_campaign, undefined, 'result.utm_campaign is undefined')
      t.equal(result.utm_content, undefined, 'result.utm_content is undefined')
      t.equal(result.utm_medium, undefined, 'result.utm_medium is undefined')
      t.equal(result.utm_source, undefined, 'result.utm_source is undefined')
      t.equal(result.utm_term, undefined, 'result.utm_term is undefined')

      t.equal(log.error.callCount, 0, 'log.error was not called')

      t.end()
    })
  }
)

test(
  'metricsContext.gather with session token',
  function (t) {
    var time = Date.now() - 1
    sinon.stub(Memcached.prototype, 'getAsync', function () {
      return P.resolve({
        flowId: 'flowId',
        flowBeginTime: time,
        context: 'context',
        entrypoint: 'entrypoint',
        migration: 'migration',
        service: 'service',
        utmCampaign: 'utm_campaign',
        utmContent: 'utm_content',
        utmMedium: 'utm_medium',
        utmSource: 'utm_source',
        utmTerm: 'utm_term',
        ignore: 'ignore me'
      })
    })
    sinon.stub(Memcached.prototype, 'delAsync', function () {
      return P.resolve()
    })
    metricsContext.gather({}, {
      auth: {
        credentials: {
          uid: 'foo',
          id: 'bar'
        }
      }
    }, 'baz').then(function (result) {
      t.equal(Memcached.prototype.getAsync.callCount, 1, 'memcached.getAsync was called once')
      t.equal(Memcached.prototype.getAsync.args[0].length, 1, 'memcached.getAsync was passed one argument')
      t.equal(Memcached.prototype.getAsync.args[0][0], 'foo:bar:baz', 'memcached.getAsync argument was correct')

      t.equal(Memcached.prototype.delAsync.callCount, 1, 'memcached.delAsync was called once')
      t.equal(Memcached.prototype.delAsync.args[0].length, 1, 'memcached.delAsync was passed one argument')
      t.equal(Memcached.prototype.delAsync.args[0][0], 'foo:bar:baz', 'memcached.delAsync argument was correct')

      t.equal(typeof result, 'object', 'result is object')
      t.notEqual(result, null, 'result is not null')
      t.equal(Object.keys(result).length, 12, 'result has 12 properties')
      t.ok(result.time > time, 'result.time seems correct')
      t.equal(result.flow_id, 'flowId', 'result.flow_id is correct')
      t.ok(result.flow_time > 0, 'result.flow_time is greater than zero')
      t.ok(result.flow_time < time, 'result.flow_time is less than the current time')
      t.equal(result.context, 'context', 'result.context is correct')
      t.equal(result.entrypoint, 'entrypoint', 'result.entry point is correct')
      t.equal(result.migration, 'migration', 'result.migration is correct')
      t.equal(result.service, 'service', 'result.service is correct')
      t.equal(result.utm_campaign, 'utm_campaign', 'result.utm_campaign is correct')
      t.equal(result.utm_content, 'utm_content', 'result.utm_content is correct')
      t.equal(result.utm_medium, 'utm_medium', 'result.utm_medium is correct')
      t.equal(result.utm_source, 'utm_source', 'result.utm_source is correct')
      t.equal(result.utm_term, 'utm_term', 'result.utm_term is correct')

      t.equal(log.error.callCount, 0, 'log.error was not called')

      Memcached.prototype.getAsync.restore()
      Memcached.prototype.delAsync.restore()

      t.end()
    })
  }
)

test(
  'metricsContext.gather with metadata and session token',
  function (t) {
    var time = Date.now() - 1
    sinon.stub(Memcached.prototype, 'getAsync', function () {
      return P.resolve({
        flowId: 'foo',
        flowBeginTime: time
      })
    })
    sinon.stub(Memcached.prototype, 'delAsync', function () {
      return P.resolve()
    })
    metricsContext.gather({}, {
      auth: {
        credentials: {
          uid: 'bar',
          id: 'baz'
        }
      },
      payload: {
        metricsContext: {
          flowId: 'qux',
          flowBeginTime: time
        }
      }
    }, 'blee').then(function (result) {
      t.equal(typeof result, 'object', 'result is object')
      t.notEqual(result, null, 'result is not null')
      t.equal(result.flow_id, 'qux', 'result.flow_id is correct')

      t.equal(Memcached.prototype.delAsync.callCount, 1, 'memcached.delAsync was called once')
      t.equal(Memcached.prototype.delAsync.args[0].length, 1, 'memcached.delAsync was called once')
      t.equal(Memcached.prototype.delAsync.args[0][0], 'bar:baz:blee', 'memcached.delAsync argument was correct')

      t.equal(Memcached.prototype.getAsync.callCount, 0, 'memcached.getAsync was not called')
      t.equal(log.error.callCount, 0, 'log.error was not called')

      Memcached.prototype.getAsync.restore()
      Memcached.prototype.delAsync.restore()

      t.end()
    })
  }
)

test(
  'metricsContext.gather with get error',
  function (t) {
    sinon.stub(Memcached.prototype, 'getAsync', function () {
      return P.reject('foo')
    })
    sinon.stub(Memcached.prototype, 'delAsync', function () {
      return P.resolve()
    })
    metricsContext.gather({}, {
      auth: {
        credentials: {
          uid: 'bar',
          id: 'baz'
        }
      }
    }, 'qux').then(function () {
      t.equal(log.error.callCount, 1, 'log.error was called once')
      t.equal(log.error.args[0].length, 1, 'log.error was passed one argument')
      t.equal(log.error.args[0][0].op, 'memcached.get', 'argument op property was correct')
      t.equal(log.error.args[0][0].err, 'foo', 'argument err property was correct')

      t.equal(Memcached.prototype.getAsync.callCount, 1, 'memcached.getAsync was called once')
      t.equal(Memcached.prototype.delAsync.callCount, 1, 'memcached.delAsync was called once')

      Memcached.prototype.getAsync.restore()
      Memcached.prototype.delAsync.restore()
      log.error.reset()

      t.end()
    })
  }
)

test(
  'metricsContext.gather with del error',
  function (t) {
    sinon.stub(Memcached.prototype, 'getAsync', function () {
      return P.resolve({
        flowId: 'foo',
        flowBeginTime: 42
      })
    })
    sinon.stub(Memcached.prototype, 'delAsync', function () {
      return P.reject('bar')
    })
    metricsContext.gather({}, {
      auth: {
        credentials: {
          uid: 'baz',
          id: 'qux'
        }
      }
    }, 'blee').then(function (result) {
      t.equal(typeof result, 'object', 'result is object')
      t.notEqual(result, null, 'result is not null')
      t.equal(result.flow_id, 'foo', 'result.flow_id is correct')

      t.equal(log.error.callCount, 1, 'log.error was called once')
      t.equal(log.error.args[0].length, 1, 'log.error was passed one argument')
      t.equal(log.error.args[0][0].op, 'memcached.del', 'argument op property was correct')
      t.equal(log.error.args[0][0].err, 'bar', 'argument err property was correct')

      t.equal(Memcached.prototype.getAsync.callCount, 1, 'memcached.getAsync was called once')
      t.equal(Memcached.prototype.delAsync.callCount, 1, 'memcached.delAsync was called once')

      Memcached.prototype.getAsync.restore()
      Memcached.prototype.delAsync.restore()
      log.error.reset()

      t.end()
    })
  }
)

test(
  'metricsContext.stash with config.memcached.address === "none"',
  function (t) {
    var metricsContextWithoutMemcached = require('../../lib/metrics/context')(log, {
      memcached: {
        address: 'none',
        idle: 500,
        lifetime: 30
      }
    })
    sinon.stub(Memcached.prototype, 'setAsync', function () {
      return P.reject('wibble')
    })
    metricsContextWithoutMemcached.stash({
      uid: 'foo',
      id: 'bar'
    }, 'baz', 'qux').then(function (result) {
      t.deepEqual(result, [ undefined ], 'result is undefined')

      t.equal(Memcached.prototype.setAsync.callCount, 0, 'memcached.setAsync was not called')
      t.equal(log.error.callCount, 0, 'log.error was not called')

      Memcached.prototype.setAsync.restore()

      t.end()
    })
  }
)

test(
  'metricsContext.gather with config.memcached.address === "none"',
  function (t) {
    var metricsContextWithoutMemcached = require('../../lib/metrics/context')(log, {
      memcached: {
        address: 'none',
        idle: 500,
        lifetime: 30
      }
    })
    sinon.stub(Memcached.prototype, 'getAsync', function () {
      return P.resolve({
        flowId: 'foo',
        flowBeginTime: 42
      })
    })
    sinon.stub(Memcached.prototype, 'delAsync', function () {
      return P.resolve()
    })
    metricsContextWithoutMemcached.gather({}, {
      auth: {
        credentials: {
          uid: 'bar',
          id: 'baz'
        }
      }
    }, 'qux').then(function () {
      t.equal(Memcached.prototype.getAsync.callCount, 0, 'memcached.getAsync was not called')
      t.equal(Memcached.prototype.delAsync.callCount, 0, 'memcached.getAsync was not called')
      t.equal(log.error.callCount, 0, 'log.error was not called')

      Memcached.prototype.getAsync.restore()
      Memcached.prototype.delAsync.restore()
      log.error.reset()

      t.end()
    })
  }
)

test(
  'metricsContext.validate with missing data bundle',
  function (t) {
    var mockLog = mocks.spyLog()
    var mockConfig = {
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'test'
      }
    }
    var mockRequest = {
      headers: {
        'user-agent': 'test-agent'
      },
      payload: {
        email: 'test@example.com'
        // note that 'metricsContext' key is absent
      }
    }

    var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
    var valid = metricsContext.validate(mockRequest)

    t.notOk(valid, 'the data is treated as invalid')
    t.equal(mockLog.info.callCount, 0, 'log.info was not called')
    t.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
    t.ok(mockLog.warn.calledWithExactly({
      op: 'metrics.context.validate',
      valid: false,
      reason: 'missing context',
      agent: 'test-agent'
    }), 'log.warn was called with the expected log data')
    t.end()
  }
)

test(
  'metricsContext.validate with missing flowId',
  function (t) {
    var mockLog = mocks.spyLog()
    var mockConfig = {
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'test'
      }
    }
    var mockRequest = {
      headers: {
        'user-agent': 'test-agent'
      },
      payload: {
        metricsContext: {
          flowBeginTime: Date.now()
        }
      }
    }

    var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
    var valid = metricsContext.validate(mockRequest)

    t.notOk(valid, 'the data is treated as invalid')
    t.equal(mockLog.info.callCount, 0, 'log.info was not called')
    t.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
    t.ok(mockLog.warn.calledWithExactly({
      op: 'metrics.context.validate',
      valid: false,
      reason: 'missing flowId',
      agent: 'test-agent'
    }), 'log.warn was called with the expected log data')
    t.end()
  }
)

test(
  'metricsContext.validate with missing flowBeginTime',
  function (t) {
    var mockLog = mocks.spyLog()
    var mockConfig = {
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'test'
      }
    }
    var mockRequest = {
      headers: {
        'user-agent': 'test-agent'
      },
      payload: {
        metricsContext: {
          flowId: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103'
        }
      }
    }

    var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
    var valid = metricsContext.validate(mockRequest)

    t.notOk(valid, 'the data is treated as invalid')
    t.equal(mockLog.info.callCount, 0, 'log.info was not called')
    t.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
    t.ok(mockLog.warn.calledWithExactly({
      op: 'metrics.context.validate',
      valid: false,
      reason: 'missing flowBeginTime',
      agent: 'test-agent'
    }), 'log.warn was called with the expected log data')
    t.end()
  }
)

test(
  'metricsContext.validate with flowBeginTime that is too old',
  function (t) {
    var mockLog = mocks.spyLog()
    var mockConfig = {
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'test'
      }
    }
    var mockRequest = {
      headers: {
        'user-agent': 'test-agent'
      },
      payload: {
        metricsContext: {
          flowId: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          flowBeginTime: Date.now() - mockConfig.metrics.flow_id_expiry - 1
        }
      }
    }

    var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
    var valid = metricsContext.validate(mockRequest)

    t.notOk(valid, 'the data is treated as invalid')
    t.equal(mockLog.info.callCount, 0, 'log.info was not called')
    t.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
    t.ok(mockLog.warn.calledWithExactly({
      op: 'metrics.context.validate',
      valid: false,
      reason: 'expired flowBeginTime',
      agent: 'test-agent'
    }), 'log.warn was called with the expected log data')
    t.end()
  }
)

test(
  'metricsContext.validate with an invalid flow signature',
  function (t) {
    var mockLog = mocks.spyLog()
    var mockConfig = {
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'test'
      }
    }
    var mockRequest = {
      headers: {
        'user-agent': 'test-agent'
      },
      payload: {
        metricsContext: {
          flowId: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          flowBeginTime: Date.now()
        }
      }
    }

    var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
    var valid = metricsContext.validate(mockRequest)

    t.notOk(valid, 'the data is treated as invalid')
    t.equal(mockLog.info.callCount, 0, 'log.info was not called')
    t.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
    t.ok(mockLog.warn.calledWithExactly({
      op: 'metrics.context.validate',
      valid: false,
      reason: 'invalid signature',
      agent: 'test-agent'
    }), 'log.warn was called with the expected log data')
    t.end()
  }
)

test(
  'metricsContext.validate with flow signature from different key',
  function (t) {
    var expectedTime = 1451566800000
    var expectedSalt = '4d6f7a696c6c6146697265666f782121'
    var expectedHmac = 'c89d56556d22039fbbf54d34e0baf206'
    var mockLog = mocks.spyLog()
    var mockConfig = {
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'ThisIsTheWrongKey'
      }
    }
    var mockRequest = {
      headers: {
        'user-agent': 'Firefox'
      },
      payload: {
        metricsContext: {
          flowId: expectedSalt + expectedHmac,
          flowBeginTime: expectedTime
        }
      }
    }
    sinon.stub(Date, 'now', function() {
      return expectedTime + 20000
    })

    try {
      var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
      var valid = metricsContext.validate(mockRequest)
    } finally {
      Date.now.restore()
    }

    t.notOk(valid, 'the data is treated as invalid')
    t.equal(mockLog.info.callCount, 0, 'log.info was not called')
    t.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
    t.ok(mockLog.warn.calledWithExactly({
      op: 'metrics.context.validate',
      valid: false,
      reason: 'invalid signature',
      agent: 'Firefox'
    }), 'log.warn was called with the expected log data')
    t.end()
  }
)

test(
  'metricsContext.validate with flow signature from different timestamp',
  function (t) {
    var expectedTime = 1451566800000
    var expectedSalt = '4d6f7a696c6c6146697265666f782121'
    var expectedHmac = 'c89d56556d22039fbbf54d34e0baf206'
    var mockLog = mocks.spyLog()
    var mockConfig = {
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'S3CR37'
      }
    }
    var mockRequest = {
      headers: {
        'user-agent': 'Firefox'
      },
      payload: {
        metricsContext: {
          flowId: expectedSalt + expectedHmac,
          flowBeginTime: expectedTime - 1
        }
      }
    }
    sinon.stub(Date, 'now', function() {
      return expectedTime + 20000
    })

    try {
      var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
      var valid = metricsContext.validate(mockRequest)
    } finally {
      Date.now.restore()
    }

    t.notOk(valid, 'the data is treated as invalid')
    t.equal(mockLog.info.callCount, 0, 'log.info was not called')
    t.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
    t.ok(mockLog.warn.calledWithExactly({
      op: 'metrics.context.validate',
      valid: false,
      reason: 'invalid signature',
      agent: 'Firefox'
    }), 'log.warn was called with the expected log data')
    t.end()
  }
)

test(
  'metricsContext.validate with flow signature from different user agent',
  function (t) {
    var expectedTime = 1451566800000
    var expectedSalt = '4d6f7a696c6c6146697265666f782121'
    var expectedHmac = 'c89d56556d22039fbbf54d34e0baf206'
    var mockLog = mocks.spyLog()
    var mockConfig = {
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'S3CR37'
      }
    }
    var mockRequest = {
      headers: {
        'user-agent': 'ThisIsNotFirefox'
      },
      payload: {
        metricsContext: {
          flowId: expectedSalt + expectedHmac,
          flowBeginTime: expectedTime
        }
      }
    }
    sinon.stub(Date, 'now', function() {
      return expectedTime + 20000
    })

    try {
      var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
      var valid = metricsContext.validate(mockRequest)
    } finally {
      Date.now.restore()
    }

    t.notOk(valid, 'the data is treated as invalid')
    t.equal(mockLog.info.callCount, 0, 'log.info was not called')
    t.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
    t.ok(mockLog.warn.calledWithExactly({
      op: 'metrics.context.validate',
      valid: false,
      reason: 'invalid signature',
      agent: 'ThisIsNotFirefox'
    }), 'log.warn was called with the expected log data')
    t.end()
  }
)
