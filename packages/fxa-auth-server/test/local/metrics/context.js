/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const ROOT_DIR = '../../..'

const { assert } = require('chai')
const crypto = require('crypto')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const mocks = require('../../mocks')
const P = require(`${ROOT_DIR}/lib/promise`)

const modulePath = `${ROOT_DIR}/lib/metrics/context`
const metricsContextModule = require(modulePath)

function hashToken (token) {
  const hash = crypto.createHash('sha256')
  hash.update(token.uid)
  hash.update(token.id)

  return hash.digest('base64')
}

describe('metricsContext', () => {
  let results, cache, cacheFactory, log, config, metricsContext

  beforeEach(() => {
    results = {
      del: P.resolve(),
      get: P.resolve(),
      set: P.resolve()
    }
    cache = {
      add: sinon.spy(() => results.add),
      del: sinon.spy(() => results.del),
      get: sinon.spy(() => results.get)
    }
    cacheFactory = sinon.spy(() => cache)
    log = mocks.mockLog()
    config = {}
    metricsContext = proxyquire(modulePath, { '../cache': cacheFactory })(log, config)
  })

  it('metricsContext interface is correct', () => {
    assert.isFunction(metricsContextModule)
    assert.isObject(metricsContextModule.schema)
    assert.isNotNull(metricsContextModule.schema)

    assert.isObject(metricsContext)
    assert.isNotNull(metricsContext)
    assert.lengthOf(Object.keys(metricsContext), 7)

    assert.isFunction(metricsContext.stash)
    assert.lengthOf(metricsContext.stash, 1)

    assert.isFunction(metricsContext.get)
    assert.lengthOf(metricsContext.get, 1)

    assert.isFunction(metricsContext.gather)
    assert.lengthOf(metricsContext.gather, 1)

    assert.isFunction(metricsContext.propagate)
    assert.lengthOf(metricsContext.propagate, 2)

    assert.isFunction(metricsContext.clear)
    assert.lengthOf(metricsContext.clear, 0)

    assert.isFunction(metricsContext.validate)
    assert.lengthOf(metricsContext.validate, 0)

    assert.isFunction(metricsContext.setFlowCompleteSignal)
    assert.lengthOf(metricsContext.setFlowCompleteSignal, 2)
  })

  it('instantiated cache correctly', () => {
    assert.equal(cacheFactory.callCount, 1)
    const args = cacheFactory.args[0]
    assert.equal(args.length, 3)
    assert.equal(args[0], log)
    assert.equal(args[1], config)
    assert.equal(args[2], 'fxa-metrics~')
  })

  it(
    'metricsContext.stash',
    () => {
      results.add = P.resolve('wibble')
      const token = {
        uid: Array(64).fill('c').join(''),
        id: 'foo'
      }
      return metricsContext.stash.call({
        payload: {
          metricsContext: {
            foo: 'bar'
          },
          service: 'baz'
        },
        query: {}
      }, token).then(result => {
        assert.equal(result, 'wibble', 'result is correct')

        assert.equal(cache.add.callCount, 1, 'cache.add was called once')
        assert.equal(cache.add.args[0].length, 2, 'cache.add was passed two arguments')
        assert.equal(cache.add.args[0][0], hashToken(token), 'first argument was correct')
        assert.deepEqual(cache.add.args[0][1], {
          foo: 'bar',
          service: 'baz'
        }, 'second argument was correct')

        assert.equal(cache.get.callCount, 0, 'cache.get was not called')
        assert.equal(log.warn.callCount, 0, 'log.warn was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      })
    }
  )

  it(
    'metricsContext.stash with clashing data',
    () => {
      results.add = P.reject('wibble')
      const token = {
        uid: Array(64).fill('c').join(''),
        id: 'foo'
      }
      return metricsContext.stash.call({
        payload: {
          metricsContext: {
            foo: 'bar'
          },
          service: 'baz'
        },
        query: {}
      }, token).then(result => {
        assert.strictEqual(result, undefined, 'result is undefined')
        assert.equal(cache.add.callCount, 1, 'cache.add was called once')
        assert.equal(log.warn.callCount, 1, 'log.warn was called once')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      })
    }
  )

  it(
    'metricsContext.stash with service query param',
    () => {
      results.add = P.resolve('wibble')
      const token = {
        uid: Array(64).fill('c').join(''),
        id: 'foo'
      }
      return metricsContext.stash.call({
        payload: {
          metricsContext: {
            foo: 'bar'
          }
        },
        query: {
          service: 'qux'
        }
      }, token).then(result => {
        assert.equal(cache.add.callCount, 1, 'cache.add was called once')
        assert.equal(cache.add.args[0][1].service, 'qux', 'service property was correct')

        assert.equal(log.error.callCount, 0, 'log.error was not called')
      })
    }
  )

  it(
    'metricsContext.stash with bad token',
    () => {
      return metricsContext.stash.call({
        payload: {
          metricsContext: {
            foo: 'bar'
          }
        },
        query: {}
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

        assert.equal(cache.add.callCount, 0, 'cache.add was not called')
      })
    }
  )

  it(
    'metricsContext.stash without metadata',
    () => {
      return metricsContext.stash.call({
        payload: {},
        query: {}
      }, {
        uid: Array(64).fill('c').join(''),
        id: 'foo'
      }).then(result => {
        assert.equal(result, undefined, 'result is undefined')

        assert.equal(cache.add.callCount, 0, 'cache.add was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      })
    }
  )

  it('metricsContext.get with payload', async () => {
    results.get = P.resolve({
      flowId: 'not this flow id',
      flowBeginTime: 0
    })

    const result = await metricsContext.get({
      payload: {
        metricsContext: {
          flowId: 'mock flow id',
          flowBeginTime: 42
        }
      }
    })

    assert.deepEqual(result, {
      flowId: 'mock flow id',
      flowBeginTime: 42
    })

    assert.equal(cache.get.callCount, 0)
    assert.equal(log.error.callCount, 0)
  })

  it('metricsContext.get with payload', async () => {
    results.get = P.resolve({
      flowId: 'not this flow id',
      flowBeginTime: 0
    })
    const result = await metricsContext.get({
      payload: {
        metricsContext: {
          flowId: 'mock flow id',
          flowBeginTime: 42
        }
      }
    })

    assert.isObject(result)
    assert.deepEqual(result, {
      flowId: 'mock flow id',
      flowBeginTime: 42
    })

    assert.equal(cache.get.callCount, 0)
    assert.equal(log.error.callCount, 0)
  })

  it('metricsContext.get with token', async () => {
    results.get = P.resolve({
      flowId: 'flowId',
      flowBeginTime: 1977
    })

    const token = {
      uid: Array(64).fill('7').join(''),
      id: 'wibble'
    }

    const result = await metricsContext.get({
      auth: {
        credentials: token
      }
    })

    assert.deepEqual(result, {
      flowId: 'flowId',
      flowBeginTime: 1977
    })

    assert.equal(cache.get.callCount, 1)
    assert.lengthOf(cache.get.args[0], 1)
    assert.equal(cache.get.args[0][0], hashToken(token))

    assert.equal(log.error.callCount, 0)
  })

  it('metricsContext.get with fake token', async () => {
    results.get = P.resolve({
      flowId: 'flowId',
      flowBeginTime: 1977
    })

    const uid = Array(64).fill('7').join('')
    const id = 'wibble'

    const token = { uid, id }

    const result = await metricsContext.get({
      payload: {
        uid,
        code: id
      }
    })

    assert.deepEqual(result, {
      flowId: 'flowId',
      flowBeginTime: 1977
    })

    assert.equal(cache.get.callCount, 1)
    assert.lengthOf(cache.get.args[0], 1)
    assert.equal(cache.get.args[0][0], hashToken(token))
    assert.deepEqual(cache.get.args[0][0], hashToken({ uid, id }))

    assert.equal(log.error.callCount, 0)
  })

  it('metricsContext.get with bad token', async () => {
    const result = await metricsContext.get({
      auth: {
        credentials: {
          uid: Array(64).fill('c').join('')
        }
      }
    })

    assert.deepEqual(result, {})

    assert.equal(log.error.callCount, 1)
    assert.lengthOf(log.error.args[0], 1)
    assert.equal(log.error.args[0][0].op, 'metricsContext.get')
    assert.equal(log.error.args[0][0].err.message, 'Invalid token')
    assert.strictEqual(log.error.args[0][0].hasToken, true)
    assert.strictEqual(log.error.args[0][0].hasId, false)
    assert.strictEqual(log.error.args[0][0].hasUid, true)
  })

  it('metricsContext.get with no token and no payload', async () => {
    const result = await metricsContext.get({
      auth: {}
    })

    assert.deepEqual(result, {})

    assert.equal(log.error.callCount, 0)
  })

  it('metricsContext.get with token and payload', async () => {
    results.get = P.resolve({
      flowId: 'foo',
      flowBeginTime: 1977
    })

    const result = await metricsContext.get({
      auth: {
        credentials: {
          uid: Array(16).fill('f').join(''),
          id: 'bar'
        }
      },
      payload: {
        metricsContext: {
          flowId: 'baz',
          flowBeginTime: 42
        }
      }
    })

    assert.deepEqual(result, {
      flowId: 'baz',
      flowBeginTime: 42
    })

    assert.equal(cache.get.callCount, 0)
    assert.equal(log.error.callCount, 0)
  })

  it('metricsContext.get with cache.get error', async () => {
    results.get = P.reject('foo')
    const result = await metricsContext.get({
      auth: {
        credentials: {
          uid: Array(16).fill('f').join(''),
          id: 'bar'
        }
      }
    })

    assert.deepEqual(result, {})

    assert.equal(cache.get.callCount, 1)

    assert.equal(log.error.callCount, 1)
    assert.lengthOf(log.error.args[0], 1)
    assert.equal(log.error.args[0][0].op, 'metricsContext.get')
    assert.equal(log.error.args[0][0].err, 'foo')
    assert.strictEqual(log.error.args[0][0].hasToken, true)
    assert.strictEqual(log.error.args[0][0].hasId, true)
    assert.strictEqual(log.error.args[0][0].hasUid, true)
  })

  it(
    'metricsContext.gather with metadata',
    () => {
      results.get = P.resolve({
        flowId: 'not this flow id',
        flowBeginTime: 0
      })
      const time = Date.now() - 1
      return metricsContext.gather.call({
        app: {
          metricsContext: P.resolve({
            deviceId: 'mock device id',
            flowId: 'mock flow id',
            flowBeginTime: time,
            flowCompleteSignal: 'mock flow complete signal',
            flowType: 'mock flow type',
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
          })
        }
      }, {}).then(function (result) {
        assert.equal(typeof result, 'object', 'result is object')
        assert.notEqual(result, null, 'result is not null')
        assert.equal(Object.keys(result).length, 13, 'result has 13 properties')
        assert.ok(result.time > time, 'result.time seems correct')
        assert.equal(result.device_id, 'mock device id', 'result.device_id is correct')
        assert.equal(result.flow_id, 'mock flow id', 'result.flow_id is correct')
        assert.ok(result.flow_time > 0, 'result.flow_time is greater than zero')
        assert.ok(result.flow_time < time, 'result.flow_time is less than the current time')
        assert.equal(result.flowBeginTime, time, 'result.flowBeginTime is correct')
        assert.equal(result.flowCompleteSignal, 'mock flow complete signal', 'result.flowCompleteSignal is correct')
        assert.equal(result.flowType, 'mock flow type', 'result.flowType is correct')
        assert.equal(result.service, 'mock service', 'result.service is correct')
        assert.equal(result.utm_campaign, 'mock utm_campaign', 'result.utm_campaign is correct')
        assert.equal(result.utm_content, 'mock utm_content', 'result.utm_content is correct')
        assert.equal(result.utm_medium, 'mock utm_medium', 'result.utm_medium is correct')
        assert.equal(result.utm_source, 'mock utm_source', 'result.utm_source is correct')
        assert.equal(result.utm_term, 'mock utm_term', 'result.utm_term is correct')

        assert.equal(cache.get.callCount, 0, 'cache.get was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      })
    }
  )

  it(
    'metricsContext.gather with DNT header',
    () => {
      return metricsContext.gather.call({
        headers: {
          dnt: '1'
        },
        app: {
          metricsContext: P.resolve({
            deviceId: 'mock device id',
            flowId: 'mock flow id',
            flowBeginTime: Date.now(),
            flowCompleteSignal: 'mock flow complete signal',
            flowType: 'mock flow type',
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
          })
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
    'metricsContext.gather with bad flowBeginTime',
    () => {
      return metricsContext.gather.call({
        app: {
          metricsContext: P.resolve({
            flowBeginTime: Date.now() + 10000
          })
        }
      }, {}).then(function (result) {
        assert.equal(typeof result, 'object', 'result is object')
        assert.notEqual(result, null, 'result is not null')
        assert.strictEqual(result.flow_time, 0, 'result.time is zero')

        assert.equal(log.error.callCount, 0, 'log.error was not called')

      })
    }
  )

  it('metricsContext.propagate', () => {
    results.get = P.resolve('wibble')
    results.add = P.resolve()
    const oldToken = {
      uid: Array(64).fill('c').join(''),
      id: 'foo'
    }
    const newToken = {
      uid: Array(64).fill('d').join(''),
      id: 'bar'
    }
    return metricsContext.propagate(oldToken, newToken)
      .then(() => {
        assert.equal(cache.get.callCount, 1)
        let args = cache.get.args[0]
        assert.lengthOf(args, 1)
        assert.equal(args[0], hashToken(oldToken))

        assert.equal(cache.add.callCount, 1)
        args = cache.add.args[0]
        assert.lengthOf(args, 2)
        assert.equal(args[0], hashToken(newToken))
        assert.equal(args[1], 'wibble')

        assert.equal(cache.del.callCount, 0)
        assert.equal(log.warn.callCount, 0)
        assert.equal(log.error.callCount, 0)
      })
  })

  it('metricsContext.propagate with clashing data', () => {
    results.get = P.resolve('wibble')
    results.add = P.reject('blee')
    const oldToken = {
      uid: Array(64).fill('c').join(''),
      id: 'foo'
    }
    const newToken = {
      uid: Array(64).fill('d').join(''),
      id: 'bar'
    }
    return metricsContext.propagate(oldToken, newToken)
      .then(() => {
        assert.equal(cache.get.callCount, 1)
        assert.equal(cache.add.callCount, 1)
        assert.equal(log.warn.callCount, 1)
        assert.equal(cache.del.callCount, 0)
        assert.equal(log.error.callCount, 0)
      })
  })

  it('metricsContext.propagate with get error', () => {
    results.get = P.reject('wibble')
    results.add = P.resolve()
    const oldToken = {
      uid: Array(64).fill('c').join(''),
      id: 'foo'
    }
    const newToken = {
      uid: Array(64).fill('d').join(''),
      id: 'bar'
    }
    return metricsContext.propagate(oldToken, newToken)
      .then(() => {
        assert.equal(cache.get.callCount, 1)
        assert.equal(log.error.callCount, 1)
        assert.equal(cache.add.callCount, 0)
        assert.equal(log.warn.callCount, 0)
        assert.equal(cache.del.callCount, 0)
      })
  })

  it(
    'metricsContext.clear with token',
    () => {
      const token = {
        uid: Array(64).fill('7').join(''),
        id: 'wibble'
      }
      return metricsContext.clear.call({
        auth: {
          credentials: token
        }
      }).then(() => {
        assert.equal(cache.del.callCount, 1, 'cache.del was called once')
        assert.equal(cache.del.args[0].length, 1, 'cache.del was passed one argument')
        assert.equal(cache.del.args[0][0], hashToken(token), 'cache.del argument was correct')
      })
    }
  )

  it(
    'metricsContext.clear with fake token',
    () => {
      const uid = Array(64).fill('6').join('')
      const id = 'blee'
      return metricsContext.clear.call({
        payload: {
          uid: uid,
          code: id
        }
      }).then(() => {
        assert.equal(cache.del.callCount, 1, 'cache.del was called once')
        assert.equal(cache.del.args[0].length, 1, 'cache.del was passed one argument')
        assert.deepEqual(cache.del.args[0][0], hashToken({ uid, id }), 'cache.del argument was correct')
      })
    }
  )

  it(
    'metricsContext.clear with no token',
    () => {
      return metricsContext.clear.call({}).then(() => {
        assert.equal(cache.del.callCount, 0, 'cache.del was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).catch(err => assert.fail(err))
    }
  )

  it(
    'metricsContext.clear with memcached error',
    () => {
      const token = {
        uid: Array(64).fill('7').join(''),
        id: 'wibble'
      }
      results.del = P.reject(new Error('blee'))
      return metricsContext.clear.call({
        auth: {
          credentials: token
        }
      })
      .then(() => assert.fail('call to metricsContext.clear should have failed'))
      .catch(err => {
        assert.equal(err.message, 'blee', 'metricsContext.clear should have rejected with memcached error')
        assert.equal(cache.del.callCount, 1, 'cache.del was called once')
      })
    }
  )

  it(
    'metricsContext.validate with valid data',
    () => {
      const flowBeginTime = 1451566800000
      const flowId = '1234567890abcdef1234567890abcdef06146f1d05e7ae215885a4e45b66ff1f'
      sinon.stub(Date, 'now', function() {
        return flowBeginTime + 59999
      })
      const mockLog = mocks.mockLog()
      const mockConfig = {
        memcached: {},
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

      const metricsContext = require(modulePath)(mockLog, mockConfig)
      const result = metricsContext.validate.call(mockRequest)

      assert.strictEqual(result, true, 'result was true')
      assert.equal(mockRequest.payload.metricsContext.flowId, '1234567890abcdef1234567890abcdef06146f1d05e7ae215885a4e45b66ff1f', 'valid flow data was not removed')
      assert.equal(mockLog.warn.callCount, 0, 'log.warn was not called')
      assert.equal(mockLog.info.callCount, 1, 'log.info was called once')
      assert.equal(mockLog.info.args[0].length, 1, 'log.info was passed one argument')
      assert.deepEqual(mockLog.info.args[0][0], {
        op: 'metrics.context.validate',
        valid: true
      }, 'log.info was passed correct argument')

      Date.now.restore()
    }
  )

  it(
    'metricsContext.validate with missing payload',
    () => {
      var mockLog = mocks.mockLog()
      var mockConfig = {
        memcached: {},
        metrics: {
          flow_id_expiry: 60000,
          flow_id_key: 'test'
        }
      }
      var mockRequest = {
        headers: {
          'user-agent': 'test-agent'
        }
      }

      var metricsContext = require('../../../lib/metrics/context')(mockLog, mockConfig)
      var valid = metricsContext.validate.call(mockRequest)

      assert(! valid, 'the data is treated as invalid')
      assert.equal(mockLog.info.callCount, 0, 'log.info was not called')
      assert.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
      assert.ok(mockLog.warn.calledWithExactly({
        op: 'metrics.context.validate',
        valid: false,
        reason: 'missing payload'
      }), 'log.warn was called with the expected log data')
    }
  )

  it(
    'metricsContext.validate with missing data bundle',
    () => {
      var mockLog = mocks.mockLog()
      var mockConfig = {
        memcached: {},
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

      var metricsContext = require(modulePath)(mockLog, mockConfig)
      var valid = metricsContext.validate.call(mockRequest)

      assert(! valid, 'the data is treated as invalid')
      assert.equal(mockLog.info.callCount, 0, 'log.info was not called')
      assert.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
      assert.ok(mockLog.warn.calledWithExactly({
        op: 'metrics.context.validate',
        valid: false,
        reason: 'missing context'
      }), 'log.warn was called with the expected log data')
    }
  )

  it(
    'metricsContext.validate with missing flowId',
    () => {
      var mockLog = mocks.mockLog()
      var mockConfig = {
        memcached: {},
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
            flowBeginTime: Date.now() - 1
          }
        }
      }

      var metricsContext = require(modulePath)(mockLog, mockConfig)
      var valid = metricsContext.validate.call(mockRequest)

      assert(! valid, 'the data is treated as invalid')
      assert(! mockRequest.payload.metricsContext.flowBeginTime, 'the invalid flow data was removed')
      assert.equal(mockLog.info.callCount, 0, 'log.info was not called')
      assert.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
      assert.ok(mockLog.warn.calledWithExactly({
        op: 'metrics.context.validate',
        valid: false,
        reason: 'missing flowId'
      }), 'log.warn was called with the expected log data')
    }
  )

  it(
    'metricsContext.validate with missing flowBeginTime',
    () => {
      var mockLog = mocks.mockLog()
      var mockConfig = {
        memcached: {},
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
            flowId: 'f1031df1031df1031df1031df1031df1031df1031df1031df1031df1031df103'
          }
        }
      }

      var metricsContext = require(modulePath)(mockLog, mockConfig)
      var valid = metricsContext.validate.call(mockRequest)

      assert(! valid, 'the data is treated as invalid')
      assert(! mockRequest.payload.metricsContext.flowId, 'the invalid flow data was removed')
      assert.equal(mockLog.info.callCount, 0, 'log.info was not called')
      assert.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
      assert.ok(mockLog.warn.calledWithExactly({
        op: 'metrics.context.validate',
        valid: false,
        reason: 'missing flowBeginTime'
      }), 'log.warn was called with the expected log data')
    }
  )

  it(
    'metricsContext.validate with flowBeginTime that is too old',
    () => {
      var mockLog = mocks.mockLog()
      var mockConfig = {
        memcached: {},
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
            flowId: 'f1031df1031df1031df1031df1031df1031df1031df1031df1031df1031df103',
            flowBeginTime: Date.now() - mockConfig.metrics.flow_id_expiry - 1
          }
        }
      }

      var metricsContext = require(modulePath)(mockLog, mockConfig)
      var valid = metricsContext.validate.call(mockRequest)

      assert(! valid, 'the data is treated as invalid')
      assert(! mockRequest.payload.metricsContext.flowId, 'the invalid flow data was removed')
      assert.equal(mockLog.info.callCount, 0, 'log.info was not called')
      assert.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
      assert.ok(mockLog.warn.calledWithExactly({
        op: 'metrics.context.validate',
        valid: false,
        reason: 'expired flowBeginTime'
      }), 'log.warn was called with the expected log data')
    }
  )

  it(
    'metricsContext.validate with an invalid flow signature',
    () => {
      var mockLog = mocks.mockLog()
      var mockConfig = {
        memcached: {},
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
            flowId: 'f1031df1031df1031df1031df1031df1031df1031df1031df1031df1031df103',
            flowBeginTime: Date.now() - 1
          }
        }
      }

      var metricsContext = require(modulePath)(mockLog, mockConfig)
      var valid = metricsContext.validate.call(mockRequest)

      assert(! valid, 'the data is treated as invalid')
      assert(! mockRequest.payload.metricsContext.flowId, 'the invalid flow data was removed')
      assert.equal(mockLog.info.callCount, 0, 'log.info was not called')
      assert.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
      assert.ok(mockLog.warn.calledWithExactly({
        op: 'metrics.context.validate',
        valid: false,
        reason: 'invalid signature'
      }), 'log.warn was called with the expected log data')
    }
  )

  it(
    'metricsContext.validate with flow signature from different key',
    () => {
      var expectedTime = 1451566800000
      var expectedSalt = '4d6f7a696c6c6146697265666f782121'
      var expectedHmac = '2a204a6d26b009b26b3116f643d84c6f'
      var mockLog = mocks.mockLog()
      var mockConfig = {
        memcached: {},
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
        var metricsContext = require(modulePath)(mockLog, mockConfig)
        var valid = metricsContext.validate.call(mockRequest)
      } finally {
        Date.now.restore()
      }

      assert(! valid, 'the data is treated as invalid')
      assert(! mockRequest.payload.metricsContext.flowId, 'the invalid flow data was removed')
      assert.equal(mockLog.info.callCount, 0, 'log.info was not called')
      assert.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
      assert.ok(mockLog.warn.calledWithExactly({
        op: 'metrics.context.validate',
        valid: false,
        reason: 'invalid signature'
      }), 'log.warn was called with the expected log data')
    }
  )

  it(
    'metricsContext.validate with flow signature from different timestamp',
    () => {
      var expectedTime = 1451566800000
      var expectedSalt = '4d6f7a696c6c6146697265666f782121'
      var expectedHmac = '2a204a6d26b009b26b3116f643d84c6f'
      var mockLog = mocks.mockLog()
      var mockConfig = {
        memcached: {},
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
        var metricsContext = require(modulePath)(mockLog, mockConfig)
        var valid = metricsContext.validate.call(mockRequest)
      } finally {
        Date.now.restore()
      }

      assert(! valid, 'the data is treated as invalid')
      assert(! mockRequest.payload.metricsContext.flowId, 'the invalid flow data was removed')
      assert.equal(mockLog.info.callCount, 0, 'log.info was not called')
      assert.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
      assert.ok(mockLog.warn.calledWithExactly({
        op: 'metrics.context.validate',
        valid: false,
        reason: 'invalid signature'
      }), 'log.warn was called with the expected log data')
    }
  )

  it(
    'metricsContext.validate with flow signature including user agent',
    () => {
      var expectedTime = 1451566800000
      // This is the correct signature for the *old* recipe, where we used
      // to include the user agent string in the hash. The test is expected
      // to fail because we don't support that recipe any more.
      var expectedSalt = '4d6f7a696c6c6146697265666f782121'
      var expectedHmac = 'c89d56556d22039fbbf54d34e0baf206'
      var mockLog = mocks.mockLog()
      var mockConfig = {
        memcached: {},
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
            flowBeginTime: expectedTime
          }
        }
      }
      sinon.stub(Date, 'now', function() {
        return expectedTime + 20000
      })

      try {
        var metricsContext = require(modulePath)(mockLog, mockConfig)
        var valid = metricsContext.validate.call(mockRequest)
      } finally {
        Date.now.restore()
      }

      assert(! valid, 'the data is treated as invalid')
      assert(! mockRequest.payload.metricsContext.flowId, 'the invalid flow data was removed')
      assert.equal(mockLog.info.callCount, 0, 'log.info was not called')
      assert.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
      assert.ok(mockLog.warn.calledWithExactly({
        op: 'metrics.context.validate',
        valid: false,
        reason: 'invalid signature'
      }), 'log.warn was called with the expected log data')
    }
  )

  it('metricsContext.validate with flow signature compared without user agent', () => {
    const flowBeginTime = 1451566800000
    const flowId = '1234567890abcdef1234567890abcdef06146f1d05e7ae215885a4e45b66ff1f'
    sinon.stub(Date, 'now', () => flowBeginTime + 59999)
    const mockLog = mocks.mockLog()
    const mockConfig = {
      memcached: {},
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'S3CR37'
      }
    }
    const mockRequest = {
      headers: {
        'user-agent': 'some other user agent'
      },
      payload: {
        metricsContext: {
          flowId,
          flowBeginTime
        }
      }
    }

    const metricsContext = require(modulePath)(mockLog, mockConfig)
    const result = metricsContext.validate.call(mockRequest)

    assert.strictEqual(result, true, 'validate returned true')
    assert.equal(mockRequest.payload.metricsContext.flowId, '1234567890abcdef1234567890abcdef06146f1d05e7ae215885a4e45b66ff1f', 'valid flow data was not removed')
    assert.equal(mockLog.warn.callCount, 0, 'log.warn was not called')
    assert.equal(mockLog.info.callCount, 1, 'log.info was called once')

    Date.now.restore()
  })

  it(
    'setFlowCompleteSignal',
    () => {
      const request = {
        payload: {
          metricsContext: {}
        }
      }
      metricsContext.setFlowCompleteSignal.call(request, 'wibble', 'blee')
      assert.deepEqual(request.payload.metricsContext, {
        flowCompleteSignal: 'wibble',
        flowType: 'blee'
      }, 'flowCompleteSignal and flowType were set correctly')
    }
  )

  it(
    'setFlowCompleteSignal without metricsContext',
    () => {
      const request = {
        payload: {}
      }
      metricsContext.setFlowCompleteSignal.call(request, 'wibble', 'blee')
      assert.deepEqual(request.payload, {}, 'flowCompleteSignal and flowType were not set')
    }
  )

})
