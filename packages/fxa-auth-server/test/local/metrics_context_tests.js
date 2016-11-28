/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const crypto = require('crypto')
const sinon = require('sinon')
const mocks = require('../mocks')
const log = mocks.spyLog()
const Memcached = require('memcached')
const metricsContextModule = require('../../lib/metrics/context')
const metricsContext = metricsContextModule(log, {
  memcached: {
    address: '127.0.0.1:1121',
    idle: 500,
    lifetime: 30
  }
})
const P = require('../../lib/promise')

describe('metricsConext', () => {

  it(
    'metricsContext interface is correct',
    () => {
      assert.equal(typeof metricsContextModule, 'function', 'function is exported')
      assert.equal(typeof metricsContextModule.schema, 'object', 'metricsContext.schema is object')
      assert.notEqual(metricsContextModule.schema, null, 'metricsContext.schema is not null')

      assert.equal(typeof metricsContext, 'object', 'metricsContext is object')
      assert.notEqual(metricsContext, null, 'metricsContext is not null')
      assert.equal(Object.keys(metricsContext).length, 5, 'metricsContext has 5 properties')

      assert.equal(typeof metricsContext.stash, 'function', 'metricsContext.stash is function')
      assert.equal(metricsContext.stash.length, 1, 'metricsContext.stash expects 1 argument')

      assert.equal(typeof metricsContext.gather, 'function', 'metricsContext.gather is function')
      assert.equal(metricsContext.gather.length, 1, 'metricsContext.gather expects 1 argument')

      assert.equal(typeof metricsContext.clear, 'function', 'metricsContext.clear is function')
      assert.equal(metricsContext.clear.length, 0, 'metricsContext.gather expects no arguments')

      assert.equal(typeof metricsContext.validate, 'function', 'metricsContext.validate is function')
      assert.equal(metricsContext.validate.length, 0, 'metricsContext.validate expects no arguments')

      assert.equal(typeof metricsContext.setFlowCompleteSignal, 'function', 'metricsContext.setFlowCompleteSignal is function')
      assert.equal(metricsContext.setFlowCompleteSignal.length, 1, 'metricsContext.setFlowCompleteSignal expects 1 argument')

    }
  )

  it(
    'metricsContext.stash',
    () => {
      const uid = Buffer.alloc(32, 'cd')
      const id = 'foo'
      const hash = crypto.createHash('sha256')
      hash.update(uid)
      hash.update(id)
      sinon.stub(Memcached.prototype, 'setAsync', function () {
        return P.resolve('wibble')
      })
      metricsContext.stash.call({
        payload: {
          metricsContext: 'bar'
        }
      }, {
        uid: uid,
        id: id
      }).then(result => {
        assert.equal(result, 'wibble', 'result is correct')

        assert.equal(Memcached.prototype.setAsync.callCount, 1, 'memcached.setAsync was called once')
        assert.equal(Memcached.prototype.setAsync.args[0].length, 3, 'memcached.setAsync was passed three arguments')
        assert.equal(Memcached.prototype.setAsync.args[0][0], hash.digest('base64'), 'first argument was correct')
        assert.equal(Memcached.prototype.setAsync.args[0][1], 'bar', 'second argument was correct')
        assert.equal(Memcached.prototype.setAsync.args[0][2], 30, 'third argument was correct')

        assert.equal(log.error.callCount, 0, 'log.error was not called')

        Memcached.prototype.setAsync.restore()

      })
    }
  )

  it(
    'metricsContext.stash error',
    () => {
      sinon.stub(Memcached.prototype, 'setAsync', function () {
        return P.reject('wibble')
      })
      metricsContext.stash.call({
        payload: {
          metricsContext: 'bar'
        }
      }, {
        uid: Buffer.alloc(32, 'cd'),
        id: 'foo'
      }).then(result => {
        assert.equal(result, undefined, 'result is undefined')

        assert.equal(Memcached.prototype.setAsync.callCount, 1, 'memcached.setAsync was called once')

        assert.equal(log.error.callCount, 1, 'log.error was called once')
        assert.equal(log.error.args[0].length, 1, 'log.error was passed one argument')
        assert.equal(log.error.args[0][0].op, 'metricsContext.stash', 'argument op property was correct')
        assert.equal(log.error.args[0][0].err, 'wibble', 'argument err property was correct')
        assert.strictEqual(log.error.args[0][0].hasToken, true, 'hasToken property was correct')
        assert.strictEqual(log.error.args[0][0].hasId, true, 'hasId property was correct')
        assert.strictEqual(log.error.args[0][0].hasUid, true, 'hasUid property was correct')

        Memcached.prototype.setAsync.restore()
        log.error.reset()

      })
    }
  )

  it(
    'metricsContext.stash with bad token',
    () => {
      sinon.stub(Memcached.prototype, 'setAsync', function () {
        return P.resolve('wibble')
      })
      metricsContext.stash.call({
        payload: {
          metricsContext: 'bar'
        }
      }, {
        id: 'foo'
      }).then(result => {
        assert.equal(result, undefined, 'result is undefined')

        assert.equal(log.error.callCount, 1, 'log.error was called once')
        assert.equal(log.error.args[0].length, 1, 'log.error was passed one argument')
        assert.equal(log.error.args[0][0].op, 'metricsContext.stash', 'op property was correct')
        assert.equal(log.error.args[0][0].err.message, 'Invalid token', 'err.message property was correct')
        assert.strictEqual(log.error.args[0][0].hasToken, true, 'hasToken property was correct')
        assert.strictEqual(log.error.args[0][0].hasId, true, 'hasId property was correct')
        assert.strictEqual(log.error.args[0][0].hasUid, false, 'hasUid property was correct')

        assert.equal(Memcached.prototype.setAsync.callCount, 0, 'memcached.setAsync was not called')

        Memcached.prototype.setAsync.restore()
        log.error.reset()

      })
    }
  )

  it(
    'metricsContext.stash without metadata',
    () => {
      sinon.stub(Memcached.prototype, 'setAsync', function () {
        return P.resolve('wibble')
      })
      metricsContext.stash.call({
        payload: {}
      }, {
        uid: Buffer.alloc(32, 'cd'),
        id: 'foo'
      }).then(result => {
        assert.equal(result, undefined, 'result is undefined')

        assert.equal(Memcached.prototype.setAsync.callCount, 0, 'memcached.setAsync was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')

        Memcached.prototype.setAsync.restore()

      })
    }
  )

  it(
    'metricsContext.gather with metadata',
    () => {
      sinon.stub(Memcached.prototype, 'getAsync', function () {
        return P.resolve({
          flowId: 'not this flow id',
          flowBeginTime: 0
        })
      })
      var time = Date.now() - 1
      metricsContext.gather.call({
        payload: {
          metricsContext: {
            flowId: 'mock flow id',
            flowBeginTime: time,
            flowCompleteSignal: 'mock flow complete signal',
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
      }, {}).then(function (result) {
        assert.equal(typeof result, 'object', 'result is object')
        assert.notEqual(result, null, 'result is not null')
        assert.equal(Object.keys(result).length, 13, 'result has 13 properties')
        assert.ok(result.time > time, 'result.time seems correct')
        assert.equal(result.flow_id, 'mock flow id', 'result.flow_id is correct')
        assert.ok(result.flow_time > 0, 'result.flow_time is greater than zero')
        assert.ok(result.flow_time < time, 'result.flow_time is less than the current time')
        assert.equal(result.flowCompleteSignal, 'mock flow complete signal', 'result.flowCompleteSignal is correct')
        assert.equal(result.context, 'mock context', 'result.context is correct')
        assert.equal(result.entrypoint, 'mock entry point', 'result.entrypoint is correct')
        assert.equal(result.migration, 'mock migration', 'result.migration is correct')
        assert.equal(result.service, 'mock service', 'result.service is correct')
        assert.equal(result.utm_campaign, 'mock utm_campaign', 'result.utm_campaign is correct')
        assert.equal(result.utm_content, 'mock utm_content', 'result.utm_content is correct')
        assert.equal(result.utm_medium, 'mock utm_medium', 'result.utm_medium is correct')
        assert.equal(result.utm_source, 'mock utm_source', 'result.utm_source is correct')
        assert.equal(result.utm_term, 'mock utm_term', 'result.utm_term is correct')

        assert.equal(Memcached.prototype.getAsync.callCount, 0, 'memcached.getAsync was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')

        Memcached.prototype.getAsync.restore()

      })
    }
  )

  it(
    'metricsContext.gather with bad flowBeginTime',
    () => {
      metricsContext.gather.call({
        payload: {
          metricsContext: {
            flowBeginTime: Date.now() + 10000
          }
        }
      }, {}).then(function (result) {
        assert.equal(typeof result, 'object', 'result is object')
        assert.notEqual(result, null, 'result is not null')
        assert.strictEqual(result.flow_time, 0, 'result.time is zero')

        assert.equal(log.error.callCount, 0, 'log.error was not called')

      })
    }
  )

  it(
    'metricsContext.gather with DNT header',
    () => {
      var time = Date.now() - 1
      metricsContext.gather.call({
        headers: {
          dnt: '1'
        },
        payload: {
          metricsContext: {
            flowId: 'mock flow id',
            flowBeginTime: time,
            flowCompleteSignal: 'mock flow complete signal',
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
      }, {}).then(function (result) {
        assert.equal(Object.keys(result).length, 8, 'result has 8 properties')
        assert.equal(result.utm_campaign, undefined, 'result.utm_campaign is undefined')
        assert.equal(result.utm_content, undefined, 'result.utm_content is undefined')
        assert.equal(result.utm_medium, undefined, 'result.utm_medium is undefined')
        assert.equal(result.utm_source, undefined, 'result.utm_source is undefined')
        assert.equal(result.utm_term, undefined, 'result.utm_term is undefined')

        assert.equal(log.error.callCount, 0, 'log.error was not called')

      })
    }
  )

  it(
    'metricsContext.gather with token',
    () => {
      const time = Date.now() - 1
      const uid = Buffer.alloc(32, '77')
      const id = 'wibble'
      const hash = crypto.createHash('sha256')
      hash.update(uid)
      hash.update(id)
      sinon.stub(Memcached.prototype, 'getAsync', function () {
        return P.resolve({
          flowId: 'flowId',
          flowBeginTime: time,
          flowCompleteSignal: 'flowCompleteSignal',
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
      metricsContext.gather.call({
        auth: {
          credentials: {
            uid: uid,
            id: id
          }
        }
      }, {}).then(function (result) {
        assert.equal(Memcached.prototype.getAsync.callCount, 1, 'memcached.getAsync was called once')
        assert.equal(Memcached.prototype.getAsync.args[0].length, 1, 'memcached.getAsync was passed one argument')
        assert.equal(Memcached.prototype.getAsync.args[0][0], hash.digest('base64'), 'memcached.getAsync argument was correct')

        assert.equal(typeof result, 'object', 'result is object')
        assert.notEqual(result, null, 'result is not null')
        assert.equal(Object.keys(result).length, 13, 'result has 13 properties')
        assert.ok(result.time > time, 'result.time seems correct')
        assert.equal(result.flow_id, 'flowId', 'result.flow_id is correct')
        assert.ok(result.flow_time > 0, 'result.flow_time is greater than zero')
        assert.ok(result.flow_time < time, 'result.flow_time is less than the current time')
        assert.equal(result.flowCompleteSignal, 'flowCompleteSignal', 'result.flowCompleteSignal is correct')
        assert.equal(result.context, 'context', 'result.context is correct')
        assert.equal(result.entrypoint, 'entrypoint', 'result.entry point is correct')
        assert.equal(result.migration, 'migration', 'result.migration is correct')
        assert.equal(result.service, 'service', 'result.service is correct')
        assert.equal(result.utm_campaign, 'utm_campaign', 'result.utm_campaign is correct')
        assert.equal(result.utm_content, 'utm_content', 'result.utm_content is correct')
        assert.equal(result.utm_medium, 'utm_medium', 'result.utm_medium is correct')
        assert.equal(result.utm_source, 'utm_source', 'result.utm_source is correct')
        assert.equal(result.utm_term, 'utm_term', 'result.utm_term is correct')

        assert.equal(log.error.callCount, 0, 'log.error was not called')

        Memcached.prototype.getAsync.restore()

      })
    }
  )

  it(
    'metricsContext.gather with fake token',
    () => {
      const time = Date.now() - 1
      const uid = Buffer.alloc(32, '77')
      const id = 'wibble'
      const hash = crypto.createHash('sha256')
      hash.update(uid)
      hash.update(id)
      sinon.stub(Memcached.prototype, 'getAsync', function () {
        return P.resolve({
          flowId: 'flowId',
          flowBeginTime: time
        })
      })
      metricsContext.gather.call({
        payload: {
          uid: uid.toString('hex'),
          code: id
        }
      }, {}).then(function (result) {
        assert.equal(Memcached.prototype.getAsync.callCount, 1, 'memcached.getAsync was called once')
        assert.equal(Memcached.prototype.getAsync.args[0].length, 1, 'memcached.getAsync was passed one argument')
        assert.equal(Memcached.prototype.getAsync.args[0][0], hash.digest('base64'), 'memcached.getAsync argument was correct')

        assert.equal(typeof result, 'object', 'result is object')
        assert.notEqual(result, null, 'result is not null')
        assert.equal(Object.keys(result).length, 13, 'result has 13 properties')
        assert.ok(result.time > time, 'result.time seems correct')
        assert.equal(result.flow_id, 'flowId', 'result.flow_id is correct')
        assert.ok(result.flow_time > 0, 'result.flow_time is greater than zero')
        assert.ok(result.flow_time < time, 'result.flow_time is less than the current time')

        assert.equal(log.error.callCount, 0, 'log.error was not called')

        Memcached.prototype.getAsync.restore()

      })
    }
  )

  it(
    'metricsContext.gather with bad token',
    () => {
      sinon.stub(Memcached.prototype, 'getAsync', function () {
        return P.resolve({
          flowId: 'flowId',
          flowBeginTime: Date.now()
        })
      })
      metricsContext.gather.call({
        auth: {
          credentials: {
            uid: Buffer.alloc(32, 'cd')
          }
        }
      }, {}).then(function (result) {
        assert.equal(typeof result, 'object', 'result is object')
        assert.notEqual(result, null, 'result is not null')
        assert.equal(Object.keys(result).length, 0, 'result is empty')

        assert.equal(log.error.callCount, 1, 'log.error was called once')
        assert.equal(log.error.args[0].length, 1, 'log.error was passed one argument')
        assert.equal(log.error.args[0][0].op, 'metricsContext.gather', 'op property was correct')
        assert.equal(log.error.args[0][0].err.message, 'Invalid token', 'err.message property was correct')
        assert.strictEqual(log.error.args[0][0].hasToken, true, 'hasToken property was correct')
        assert.strictEqual(log.error.args[0][0].hasId, false, 'hasId property was correct')
        assert.strictEqual(log.error.args[0][0].hasUid, true, 'hasUid property was correct')

        Memcached.prototype.getAsync.restore()
        log.error.reset()

      })
    }
  )

  it(
    'metricsContext.gather with no token',
    () => {
      sinon.stub(Memcached.prototype, 'getAsync', function () {
        return P.resolve({
          flowId: 'flowId',
          flowBeginTime: Date.now()
        })
      })
      metricsContext.gather.call({
        auth: {}
      }, {}).then(function (result) {
        assert.equal(typeof result, 'object', 'result is object')
        assert.notEqual(result, null, 'result is not null')
        assert.equal(Object.keys(result).length, 0, 'result is empty')

        assert.equal(log.error.callCount, 1, 'log.error was called once')
        assert.equal(log.error.args[0].length, 1, 'log.error was passed one argument')
        assert.equal(log.error.args[0][0].op, 'metricsContext.gather', 'op property was correct')
        assert.equal(log.error.args[0][0].err.message, 'Missing token', 'err.message property was correct')
        assert.equal(log.error.args[0][0].token, undefined, 'token property was correct')

        Memcached.prototype.getAsync.restore()
        log.error.reset()

      })
    }
  )

  it(
    'metricsContext.gather with metadata and token',
    () => {
      var time = Date.now() - 1
      sinon.stub(Memcached.prototype, 'getAsync', function () {
        return P.resolve({
          flowId: 'foo',
          flowBeginTime: time
        })
      })
      metricsContext.gather.call({
        auth: {
          credentials: {
            uid: Buffer.alloc(8, 'ff'),
            id: 'bar'
          }
        },
        payload: {
          metricsContext: {
            flowId: 'baz',
            flowBeginTime: time
          }
        }
      }, {}).then(function (result) {
        assert.equal(typeof result, 'object', 'result is object')
        assert.notEqual(result, null, 'result is not null')
        assert.equal(result.flow_id, 'baz', 'result.flow_id is correct')

        assert.equal(Memcached.prototype.getAsync.callCount, 0, 'memcached.getAsync was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')

        Memcached.prototype.getAsync.restore()

      })
    }
  )

  it(
    'metricsContext.gather with get error',
    () => {
      sinon.stub(Memcached.prototype, 'getAsync', function () {
        return P.reject('foo')
      })
      metricsContext.gather.call({
        auth: {
          credentials: {
            uid: Buffer.alloc(8, 'ff'),
            id: 'bar'
          }
        }
      }, {}).then(function () {
        assert.equal(log.error.callCount, 1, 'log.error was called once')
        assert.equal(log.error.args[0].length, 1, 'log.error was passed one argument')
        assert.equal(log.error.args[0][0].op, 'metricsContext.gather', 'argument op property was correct')
        assert.equal(log.error.args[0][0].err, 'foo', 'argument err property was correct')

        assert.equal(Memcached.prototype.getAsync.callCount, 1, 'memcached.getAsync was called once')

        Memcached.prototype.getAsync.restore()
        log.error.reset()

      })
    }
  )

  it(
    'metricsContext.stash with config.memcached.address === "none"',
    () => {
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
        uid: Buffer.alloc(8, 'ff'),
        id: 'bar'
      }, {
        payload: {
          metricsContext: 'baz'
        }
      }).then(result => {
        assert.equal(result, undefined, 'result is undefined')

        assert.equal(Memcached.prototype.setAsync.callCount, 0, 'memcached.setAsync was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')

        Memcached.prototype.setAsync.restore()

      })
    }
  )

  it(
    'metricsContext.gather with config.memcached.address === "none"',
    () => {
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
      metricsContextWithoutMemcached.gather.call({
        auth: {
          credentials: {
            uid: Buffer.alloc(8, 'ff'),
            id: 'baz'
          }
        }
      }, {}).then(function () {
        assert.equal(Memcached.prototype.getAsync.callCount, 0, 'memcached.getAsync was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')

        Memcached.prototype.getAsync.restore()
        log.error.reset()

      })
    }
  )

  it(
    'metricsContext.clear with token',
    () => {
      const uid = Buffer.alloc(32, '77')
      const id = 'wibble'
      const hash = crypto.createHash('sha256')
      hash.update(uid)
      hash.update(id)
      sinon.stub(Memcached.prototype, 'delAsync', () => P.resolve())
      return metricsContext.clear.call({
        auth: {
          credentials: {
            uid: uid,
            id: id
          }
        }
      }).then(() => {
        assert.equal(Memcached.prototype.delAsync.callCount, 1, 'memcached.delAsync was called once')
        assert.equal(Memcached.prototype.delAsync.args[0].length, 1, 'memcached.delAsync was passed one argument')
        assert.equal(Memcached.prototype.delAsync.args[0][0], hash.digest('base64'), 'memcached.delAsync argument was correct')

        Memcached.prototype.delAsync.restore()
      })
    }
  )

  it(
    'metricsContext.clear with fake token',
    () => {
      const uid = Buffer.alloc(32, '66')
      const id = 'blee'
      const hash = crypto.createHash('sha256')
      hash.update(uid)
      hash.update(id)
      sinon.stub(Memcached.prototype, 'delAsync', () => P.resolve())
      return metricsContext.clear.call({
        payload: {
          uid: uid.toString('hex'),
          code: id
        }
      }).then(() => {
        assert.equal(Memcached.prototype.delAsync.callCount, 1, 'memcached.delAsync was called once')
        assert.equal(Memcached.prototype.delAsync.args[0].length, 1, 'memcached.delAsync was passed one argument')
        assert.equal(Memcached.prototype.delAsync.args[0][0], hash.digest('base64'), 'memcached.delAsync argument was correct')

        Memcached.prototype.delAsync.restore()
      })
    }
  )

  it(
    'metricsContext.clear with no token',
    () => {
      sinon.stub(Memcached.prototype, 'delAsync', () => P.resolve())
      return metricsContext.clear.call({}).then(() => {
        assert.equal(Memcached.prototype.delAsync.callCount, 0, 'memcached.delAsync was not called')

        Memcached.prototype.delAsync.restore()
      }).catch(err => assert.fail(err))
    }
  )

  it(
    'metricsContext.clear with memcached error',
    () => {
      const uid = Buffer.alloc(32, '77')
      const id = 'wibble'
      const hash = crypto.createHash('sha256')
      hash.update(uid)
      hash.update(id)
      sinon.stub(Memcached.prototype, 'delAsync', () => P.reject('blee'))
      return metricsContext.clear.call({
        auth: {
          credentials: {
            uid: uid,
            id: id
          }
        }
      })
      .then(() => assert.fail('call to metricsContext.clear should have failed'))
      .catch(err => {
        assert.equal(err, 'blee', 'metricsContext.clear should have rejected with memcached error')
        assert.equal(Memcached.prototype.delAsync.callCount, 1, 'memcached.delAsync was called once')

        Memcached.prototype.delAsync.restore()
      })
    }
  )

  it(
    'metricsContext.clear with config.memcached.address === "none"',
    () => {
      const metricsContextWithoutMemcached = require('../../lib/metrics/context')(log, {
        memcached: {
          address: 'none',
          idle: 500,
          lifetime: 30
        }
      })
      const uid = Buffer.alloc(32, '77')
      const id = 'wibble'
      const hash = crypto.createHash('sha256')
      hash.update(uid)
      hash.update(id)
      sinon.stub(Memcached.prototype, 'delAsync', () => P.resolve())
      return metricsContextWithoutMemcached.clear.call({
        auth: {
          credentials: {
            uid: uid,
            id: id
          }
        }
      }).then(() => {
        assert.equal(Memcached.prototype.delAsync.callCount, 0, 'memcached.delAsync was not called')

        Memcached.prototype.delAsync.restore()
      })
    }
  )

  it(
    'metricsContext.validate with valid data',
    () => {
      const flowBeginTime = 1451566800000
      const flowId = '1234567890abcdef1234567890abcdef6a7c0469a1e3d6dfa7d9bed7ae209672'
      sinon.stub(Date, 'now', function() {
        return flowBeginTime + 59999
      })
      const mockLog = mocks.spyLog()
      const mockConfig = {
        metrics: {
          flow_id_expiry: 60000,
          flow_id_key: 'S3CR37'
        }
      }
      const mockRequest = {
        headers: {
          'user-agent': 'test-agent'
        },
        payload: {
          metricsContext: {
            context: 'fx_desktop_v3',
            entrypoint: 'menupanel',
            flowId,
            flowBeginTime,
            migration: 'sync11',
            service: 'sync'
          }
        }
      }

      const metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
      const result = metricsContext.validate.call(mockRequest)

      assert.strictEqual(result, true, 'result was true')
      assert.equal(mockRequest.payload.metricsContext.flowId, '1234567890abcdef1234567890abcdef6a7c0469a1e3d6dfa7d9bed7ae209672', 'valid flow data was not removed')
      assert.equal(mockLog.warn.callCount, 0, 'log.warn was not called')
      assert.equal(mockLog.info.callCount, 1, 'log.info was called once')
      assert.equal(mockLog.info.args[0].length, 1, 'log.info was passed one argument')
      assert.deepEqual(mockLog.info.args[0][0], {
        op: 'metrics.context.validate',
        valid: true,
        agent: 'test-agent'
      }, 'log.info was passed correct argument')

      Date.now.restore()
    }
  )

  it(
    'metricsContext.validate with missing data bundle',
    () => {
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
      var valid = metricsContext.validate.call(mockRequest)

      assert(!valid, 'the data is treated as invalid')
      assert.equal(mockLog.info.callCount, 0, 'log.info was not called')
      assert.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
      assert.ok(mockLog.warn.calledWithExactly({
        op: 'metrics.context.validate',
        valid: false,
        reason: 'missing context',
        agent: 'test-agent'
      }), 'log.warn was called with the expected log data')
    }
  )

  it(
    'metricsContext.validate with missing flowId',
    () => {
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
            context: 'fx_desktop_v3',
            entrypoint: 'menupanel',
            flowBeginTime: Date.now() - 1,
            migration: 'sync11',
            service: 'sync'
          }
        }
      }

      var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
      var valid = metricsContext.validate.call(mockRequest)

      assert(!valid, 'the data is treated as invalid')
      assert(!mockRequest.payload.metricsContext.flowBeginTime, 'the invalid flow data was removed')
      assert.equal(mockLog.info.callCount, 0, 'log.info was not called')
      assert.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
      assert.ok(mockLog.warn.calledWithExactly({
        op: 'metrics.context.validate',
        valid: false,
        reason: 'missing flowId',
        agent: 'test-agent'
      }), 'log.warn was called with the expected log data')
    }
  )

  it(
    'metricsContext.validate with missing flowBeginTime',
    () => {
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
            context: 'fx_desktop_v3',
            entrypoint: 'menupanel',
            flowId: 'f1031df1031df1031df1031df1031df1031df1031df1031df1031df1031df103',
            migration: 'sync11',
            service: 'sync'
          }
        }
      }

      var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
      var valid = metricsContext.validate.call(mockRequest)

      assert(!valid, 'the data is treated as invalid')
      assert(!mockRequest.payload.metricsContext.flowId, 'the invalid flow data was removed')
      assert.equal(mockLog.info.callCount, 0, 'log.info was not called')
      assert.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
      assert.ok(mockLog.warn.calledWithExactly({
        op: 'metrics.context.validate',
        valid: false,
        reason: 'missing flowBeginTime',
        agent: 'test-agent'
      }), 'log.warn was called with the expected log data')
    }
  )

  it(
    'metricsContext.validate with flowBeginTime that is too old',
    () => {
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
            context: 'fx_desktop_v3',
            entrypoint: 'menupanel',
            flowId: 'f1031df1031df1031df1031df1031df1031df1031df1031df1031df1031df103',
            flowBeginTime: Date.now() - mockConfig.metrics.flow_id_expiry - 1,
            migration: 'sync11',
            service: 'sync'
          }
        }
      }

      var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
      var valid = metricsContext.validate.call(mockRequest)

      assert(!valid, 'the data is treated as invalid')
      assert(!mockRequest.payload.metricsContext.flowId, 'the invalid flow data was removed')
      assert.equal(mockLog.info.callCount, 0, 'log.info was not called')
      assert.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
      assert.ok(mockLog.warn.calledWithExactly({
        op: 'metrics.context.validate',
        valid: false,
        reason: 'expired flowBeginTime',
        agent: 'test-agent'
      }), 'log.warn was called with the expected log data')
    }
  )

  it(
    'metricsContext.validate with invalid context',
    () => {
      const flowBeginTime = 1451566800000
      const flowId = '1234567890abcdef1234567890abcdef6a7c0469a1e3d6dfa7d9bed7ae209672'
      sinon.stub(Date, 'now', function() {
        return flowBeginTime + 59999
      })
      const mockLog = mocks.spyLog()
      const mockConfig = {
        metrics: {
          flow_id_expiry: 60000,
          flow_id_key: 'S3CR37'
        }
      }
      const mockRequest = {
        headers: {
          'user-agent': 'test-agent'
        },
        payload: {
          metricsContext: {
            context: '!',
            entrypoint: 'menupanel',
            flowId,
            flowBeginTime,
            migration: 'sync11',
            service: 'sync'
          }
        }
      }

      const metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
      const result = metricsContext.validate.call(mockRequest)

      assert.strictEqual(result, false, 'result was false')
      assert.strictEqual(mockRequest.payload.metricsContext.flowId, undefined, 'invalid flow data was removed')
      assert.equal(mockLog.info.callCount, 0, 'log.info was not called')
      assert.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
      assert.equal(mockLog.warn.args[0].length, 1, 'log.warn was passed one argument')
      assert.deepEqual(mockLog.warn.args[0][0], {
        op: 'metrics.context.validate',
        valid: false,
        reason: 'invalid data',
        agent: 'test-agent'
      }, 'log.warn was passed correct argument')

      Date.now.restore()
    }
  )

  it(
    'metricsContext.validate with invalid entrypoint',
    () => {
      const flowBeginTime = 1451566800000
      const flowId = '1234567890abcdef1234567890abcdef6a7c0469a1e3d6dfa7d9bed7ae209672'
      sinon.stub(Date, 'now', function() {
        return flowBeginTime + 59999
      })
      const mockLog = mocks.spyLog()
      const mockConfig = {
        metrics: {
          flow_id_expiry: 60000,
          flow_id_key: 'S3CR37'
        }
      }
      const mockRequest = {
        headers: {
          'user-agent': 'test-agent'
        },
        payload: {
          metricsContext: {
            context: 'fx_desktop_v3',
            entrypoint: '!',
            flowId,
            flowBeginTime,
            migration: 'sync11',
            service: 'sync'
          }
        }
      }

      const metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
      const result = metricsContext.validate.call(mockRequest)

      assert.strictEqual(result, false, 'result was false')
      assert.strictEqual(mockRequest.payload.metricsContext.flowId, undefined, 'invalid flow data was removed')
      assert.equal(mockLog.info.callCount, 0, 'log.info was not called')
      assert.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
      assert.equal(mockLog.warn.args[0].length, 1, 'log.warn was passed one argument')
      assert.deepEqual(mockLog.warn.args[0][0], {
        op: 'metrics.context.validate',
        valid: false,
        reason: 'invalid data',
        agent: 'test-agent'
      }, 'log.warn was passed correct argument')

      Date.now.restore()
    }
  )

  it(
    'metricsContext.validate with invalid migration',
    () => {
      const flowBeginTime = 1451566800000
      const flowId = '1234567890abcdef1234567890abcdef6a7c0469a1e3d6dfa7d9bed7ae209672'
      sinon.stub(Date, 'now', function() {
        return flowBeginTime + 59999
      })
      const mockLog = mocks.spyLog()
      const mockConfig = {
        metrics: {
          flow_id_expiry: 60000,
          flow_id_key: 'S3CR37'
        }
      }
      const mockRequest = {
        headers: {
          'user-agent': 'test-agent'
        },
        payload: {
          metricsContext: {
            context: 'fx_desktop_v3',
            entrypoint: 'menupanel',
            flowId,
            flowBeginTime,
            migration: 'sync111',
            service: 'sync'
          }
        }
      }

      const metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
      const result = metricsContext.validate.call(mockRequest)

      assert.strictEqual(result, false, 'result was false')
      assert.strictEqual(mockRequest.payload.metricsContext.flowId, undefined, 'invalid flow data was removed')
      assert.equal(mockLog.info.callCount, 0, 'log.info was not called')
      assert.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
      assert.equal(mockLog.warn.args[0].length, 1, 'log.warn was passed one argument')
      assert.deepEqual(mockLog.warn.args[0][0], {
        op: 'metrics.context.validate',
        valid: false,
        reason: 'invalid data',
        agent: 'test-agent'
      }, 'log.warn was passed correct argument')

      Date.now.restore()
    }
  )

  it(
    'metricsContext.validate with invalid service',
    () => {
      const flowBeginTime = 1451566800000
      const flowId = '1234567890abcdef1234567890abcdef6a7c0469a1e3d6dfa7d9bed7ae209672'
      sinon.stub(Date, 'now', function() {
        return flowBeginTime + 59999
      })
      const mockLog = mocks.spyLog()
      const mockConfig = {
        metrics: {
          flow_id_expiry: 60000,
          flow_id_key: 'S3CR37'
        }
      }
      const mockRequest = {
        headers: {
          'user-agent': 'test-agent'
        },
        payload: {
          metricsContext: {
            context: 'fx_desktop_v3',
            entrypoint: 'menupanel',
            flowId,
            flowBeginTime,
            migration: 'sync11',
            service: 'foo'
          }
        }
      }

      const metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
      const result = metricsContext.validate.call(mockRequest)

      assert.strictEqual(result, false, 'result was false')
      assert.strictEqual(mockRequest.payload.metricsContext.flowId, undefined, 'invalid flow data was removed')
      assert.equal(mockLog.info.callCount, 0, 'log.info was not called')
      assert.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
      assert.equal(mockLog.warn.args[0].length, 1, 'log.warn was passed one argument')
      assert.deepEqual(mockLog.warn.args[0][0], {
        op: 'metrics.context.validate',
        valid: false,
        reason: 'invalid data',
        agent: 'test-agent'
      }, 'log.warn was passed correct argument')

      Date.now.restore()
    }
  )

  it(
    'metricsContext.validate without optional data',
    () => {
      const flowBeginTime = 1451566800000
      const flowId = '1234567890abcdef1234567890abcdef6a7c0469a1e3d6dfa7d9bed7ae209672'
      sinon.stub(Date, 'now', function() {
        return flowBeginTime + 59999
      })
      const mockLog = mocks.spyLog()
      const mockConfig = {
        metrics: {
          flow_id_expiry: 60000,
          flow_id_key: 'S3CR37'
        }
      }
      const mockRequest = {
        headers: {
          'user-agent': 'test-agent'
        },
        payload: {
          metricsContext: {
            flowId,
            flowBeginTime
          }
        }
      }

      const metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
      const result = metricsContext.validate.call(mockRequest)

      assert.strictEqual(result, true, 'result was true')
      assert.equal(mockRequest.payload.metricsContext.flowId, '1234567890abcdef1234567890abcdef6a7c0469a1e3d6dfa7d9bed7ae209672', 'valid flow data was not removed')
      assert.equal(mockLog.warn.callCount, 0, 'log.warn was not called')
      assert.equal(mockLog.info.callCount, 1, 'log.info was called')

      Date.now.restore()
    }
  )

  it(
    'metricsContext.validate with an invalid flow signature',
    () => {
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
            context: 'fx_desktop_v3',
            entrypoint: 'menupanel',
            flowId: 'f1031df1031df1031df1031df1031df1031df1031df1031df1031df1031df103',
            flowBeginTime: Date.now() - 1,
            migration: 'sync11',
            service: 'sync'
          }
        }
      }

      var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
      var valid = metricsContext.validate.call(mockRequest)

      assert(!valid, 'the data is treated as invalid')
      assert(!mockRequest.payload.metricsContext.flowId, 'the invalid flow data was removed')
      assert.equal(mockLog.info.callCount, 0, 'log.info was not called')
      assert.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
      assert.ok(mockLog.warn.calledWithExactly({
        op: 'metrics.context.validate',
        valid: false,
        reason: 'invalid signature',
        agent: 'test-agent'
      }), 'log.warn was called with the expected log data')
    }
  )

  it(
    'metricsContext.validate with flow signature from different key',
    () => {
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
            context: 'fx_desktop_v3',
            entrypoint: 'menupanel',
            flowId: expectedSalt + expectedHmac,
            flowBeginTime: expectedTime,
            migration: 'sync11',
            service: 'sync'
          }
        }
      }
      sinon.stub(Date, 'now', function() {
        return expectedTime + 20000
      })

      try {
        var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
        var valid = metricsContext.validate.call(mockRequest)
      } finally {
        Date.now.restore()
      }

      assert(!valid, 'the data is treated as invalid')
      assert(!mockRequest.payload.metricsContext.flowId, 'the invalid flow data was removed')
      assert.equal(mockLog.info.callCount, 0, 'log.info was not called')
      assert.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
      assert.ok(mockLog.warn.calledWithExactly({
        op: 'metrics.context.validate',
        valid: false,
        reason: 'invalid signature',
        agent: 'Firefox'
      }), 'log.warn was called with the expected log data')
    }
  )

  it(
    'metricsContext.validate with flow signature from different timestamp',
    () => {
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
            context: 'fx_desktop_v3',
            entrypoint: 'menupanel',
            flowId: expectedSalt + expectedHmac,
            flowBeginTime: expectedTime - 1,
            migration: 'sync11',
            service: 'sync'
          }
        }
      }
      sinon.stub(Date, 'now', function() {
        return expectedTime + 20000
      })

      try {
        var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
        var valid = metricsContext.validate.call(mockRequest)
      } finally {
        Date.now.restore()
      }

      assert(!valid, 'the data is treated as invalid')
      assert(!mockRequest.payload.metricsContext.flowId, 'the invalid flow data was removed')
      assert.equal(mockLog.info.callCount, 0, 'log.info was not called')
      assert.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
      assert.ok(mockLog.warn.calledWithExactly({
        op: 'metrics.context.validate',
        valid: false,
        reason: 'invalid signature',
        agent: 'Firefox'
      }), 'log.warn was called with the expected log data')
    }
  )

  it(
    'metricsContext.validate with flow signature from different user agent',
    () => {
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
            context: 'fx_desktop_v3',
            entrypoint: 'menupanel',
            flowId: expectedSalt + expectedHmac,
            flowBeginTime: expectedTime,
            migration: 'sync11',
            service: 'sync'
          }
        }
      }
      sinon.stub(Date, 'now', function() {
        return expectedTime + 20000
      })

      try {
        var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
        var valid = metricsContext.validate.call(mockRequest)
      } finally {
        Date.now.restore()
      }

      assert(!valid, 'the data is treated as invalid')
      assert(!mockRequest.payload.metricsContext.flowId, 'the invalid flow data was removed')
      assert.equal(mockLog.info.callCount, 0, 'log.info was not called')
      assert.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
      assert.ok(mockLog.warn.calledWithExactly({
        op: 'metrics.context.validate',
        valid: false,
        reason: 'invalid signature',
        agent: 'ThisIsNotFirefox'
      }), 'log.warn was called with the expected log data')
    }
  )

  it(
    'setFlowCompleteSignal',
    () => {
      const request = {
        payload: {
          metricsContext: {}
        }
      }
      metricsContext.setFlowCompleteSignal.call(request, 'wibble')
      assert.deepEqual(request.payload.metricsContext, { flowCompleteSignal: 'wibble' }, 'flowCompleteSignal was set correctly')
    }
  )

  it(
    'setFlowCompleteSignal without metricsContext',
    () => {
      const request = {
        payload: {}
      }
      metricsContext.setFlowCompleteSignal.call(request, 'wibble')
      assert.deepEqual(request.payload, {}, 'flowCompleteSignal was not set')
    }
  )

})
