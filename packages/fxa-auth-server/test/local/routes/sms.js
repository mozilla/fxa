/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const AppError = require('../../../lib/error')
const assert = require('insist')
const getRoute = require('../../routes_helpers').getRoute
const isA = require('joi')
const mocks = require('../../mocks')
const P = require('../../../lib/promise')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

const sms = {}

function makeRoutes (options, dependencies) {
  options = options || {}
  const log = options.log || mocks.mockLog()
  return proxyquire('../../../lib/routes/sms', dependencies || {})(
    log, isA, AppError, options.config, mocks.mockCustoms(), sms
  )
}

function runTest (route, request) {
  return new P((resolve, reject) => {
    route.handler(request, response => {
      if (response instanceof Error) {
        reject(response)
      } else {
        resolve(response)
      }
    })
  })
}

describe('/sms', () => {
  let log, config, routes, route, request

  beforeEach(() => {
    log = mocks.spyLog()
    config = {
      sms: {
        enabled: true
      }
    }
    routes = makeRoutes({ log, config })
    route = getRoute(routes, '/sms')
    request = mocks.mockRequest({
      credentials: {
        email: 'foo@example.org'
      },
      log: log,
      payload: {
        messageId: 42,
        metricsContext: {
          flowBeginTime: Date.now(),
          flowId: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
        }
      }
    })
  })

  describe('sms.send succeeds', () => {
    beforeEach(() => {
      sms.send = sinon.spy(() => P.resolve())
    })

    describe('USA phone number', () => {
      beforeEach(() => {
        request.payload.phoneNumber = '+18885083401'
        return runTest(route, request)
      })

      it('called log.begin correctly', () => {
        assert.equal(log.begin.callCount, 1)
        const args = log.begin.args[0]
        assert.equal(args.length, 2)
        assert.equal(args[0], 'sms.send')
        assert.equal(args[1], request)
      })

      it('called request.validateMetricsContext correctly', () => {
        assert.equal(request.validateMetricsContext.callCount, 1)
        const args = request.validateMetricsContext.args[0]
        assert.equal(args.length, 0)
      })

      it('called sms.send correctly', () => {
        assert.equal(sms.send.callCount, 1)
        const args = sms.send.args[0]
        assert.equal(args.length, 4)
        assert.equal(args[0], '+18885083401')
        assert.equal(args[1], '15036789977')
        assert.equal(args[2], 42)
        assert.equal(args[3], 'en-US')
      })

      it('called log.flowEvent correctly', () => {
        assert.equal(log.flowEvent.callCount, 1)

        const args = log.flowEvent.args[0]
        assert.equal(args.length, 1)
        assert.equal(args[0].event, 'sms.42.sent')
        assert.equal(args[0].flow_id, request.payload.metricsContext.flowId)
      })
    })

    describe('Canada phone number', () => {
      beforeEach(() => {
        request.payload.phoneNumber = '+14168483114'
        return runTest(route, request)
      })

      it('called log.begin once', () => {
        assert.equal(log.begin.callCount, 1)
      })

      it('called request.validateMetricsContext once', () => {
        assert.equal(request.validateMetricsContext.callCount, 1)
      })

      it('called sms.send correctly', () => {
        assert.equal(sms.send.callCount, 1)
        const args = sms.send.args[0]
        assert.equal(args[0], '+14168483114')
        assert.equal(args[1], '16474909977')
      })

      it('called log.flowEvent once', () => {
        assert.equal(log.flowEvent.callCount, 1)
      })
    })

    describe('UK phone number', () => {
      beforeEach(() => {
        request.payload.phoneNumber = '+442078553000'
        return runTest(route, request)
      })

      it('called log.begin once', () => {
        assert.equal(log.begin.callCount, 1)
      })

      it('called request.validateMetricsContext once', () => {
        assert.equal(request.validateMetricsContext.callCount, 1)
      })

      it('called sms.send correctly', () => {
        assert.equal(sms.send.callCount, 1)
        const args = sms.send.args[0]
        assert.equal(args[0], '+442078553000')
        assert.equal(args[1], 'Firefox')
      })

      it('called log.flowEvent once', () => {
        assert.equal(log.flowEvent.callCount, 1)
      })
    })

    describe('invalid phone number', () => {
      let err

      beforeEach(() => {
        request.payload.phoneNumber = '+15551234567'
        return runTest(route, request)
          .catch(e => {
            err = e
          })
      })

      it('called log.begin once', () => {
        assert.equal(log.begin.callCount, 1)
      })

      it('called request.validateMetricsContext once', () => {
        assert.equal(request.validateMetricsContext.callCount, 1)
      })

      it('did not call sms.send', () => {
        assert.equal(sms.send.callCount, 0)
      })

      it('did not call log.flowEvent', () => {
        assert.equal(log.flowEvent.callCount, 0)
      })

      it('threw the correct error data', () => {
        assert.ok(err instanceof AppError)
        assert.equal(err.errno, AppError.ERRNO.INVALID_PHONE_NUMBER)
        assert.equal(err.message, 'Invalid phone number')
      })
    })

    describe('invalid region', () => {
      let err

      beforeEach(() => {
        request.payload.phoneNumber = '+886287861100'
        return runTest(route, request)
          .catch(e => {
            err = e
          })
      })

      it('called log.begin once', () => {
        assert.equal(log.begin.callCount, 1)
      })

      it('called request.validateMetricsContext once', () => {
        assert.equal(request.validateMetricsContext.callCount, 1)
      })

      it('did not call sms.send', () => {
        assert.equal(sms.send.callCount, 0)
      })

      it('did not call log.flowEvent', () => {
        assert.equal(log.flowEvent.callCount, 0)
      })

      it('threw the correct error data', () => {
        assert.ok(err instanceof AppError)
        assert.equal(err.errno, AppError.ERRNO.INVALID_REGION)
        assert.equal(err.message, 'Invalid region')
        assert.equal(err.output.payload.region, 'TW')
      })
    })
  })

  describe('sms.send fails with 500 error', () => {
    let err

    beforeEach(() => {
      sms.send = sinon.spy(() => P.reject({
        status: 500,
        reason: 'wibble',
        reasonCode: 7
      }))
      request.payload.phoneNumber = '+18885083401'
      return runTest(route, request)
        .catch(e => {
          err = e
        })
    })

    it('called log.begin once', () => {
      assert.equal(log.begin.callCount, 1)
    })

    it('called request.validateMetricsContext once', () => {
      assert.equal(request.validateMetricsContext.callCount, 1)
    })

    it('called sms.send once', () => {
      assert.equal(sms.send.callCount, 1)
    })

    it('did not call log.flowEvent', () => {
      assert.equal(log.flowEvent.callCount, 0)
    })

    it('threw the correct error data', () => {
      assert.ok(err instanceof AppError)
      assert.equal(err.errno, AppError.ERRNO.MESSAGE_REJECTED)
      assert.equal(err.message, 'Message rejected')
      assert.equal(err.output.payload.reason, 'wibble')
      assert.equal(err.output.payload.reasonCode, 7)
    })
  })

  describe('sms.send fails with 400 error', () => {
    let err

    beforeEach(() => {
      sms.send = sinon.spy(() => P.reject({
        status: 400
      }))
      request.payload.phoneNumber = '+18885083401'
      return runTest(route, request)
        .catch(e => {
          err = e
        })
    })

    it('called log.begin once', () => {
      assert.equal(log.begin.callCount, 1)
    })

    it('called request.validateMetricsContext once', () => {
      assert.equal(request.validateMetricsContext.callCount, 1)
    })

    it('called sms.send once', () => {
      assert.equal(sms.send.callCount, 1)
    })

    it('did not call log.flowEvent', () => {
      assert.equal(log.flowEvent.callCount, 0)
    })

    it('threw the correct error data', () => {
      assert.ok(err instanceof AppError)
      assert.equal(err.errno, AppError.ERRNO.INVALID_MESSAGE_ID)
      assert.equal(err.message, 'Invalid message id')
    })
  })

  describe('sms.send fails with unknown error', () => {
    let err

    beforeEach(() => {
      sms.send = sinon.spy(() => P.reject())
      request.payload.phoneNumber = '+18885083401'
      return runTest(route, request)
        .catch(e => {
          err = e
        })
    })

    it('called log.begin once', () => {
      assert.equal(log.begin.callCount, 1)
    })

    it('called request.validateMetricsContext once', () => {
      assert.equal(request.validateMetricsContext.callCount, 1)
    })

    it('called sms.send once', () => {
      assert.equal(sms.send.callCount, 1)
    })

    it('did not call log.flowEvent', () => {
      assert.equal(log.flowEvent.callCount, 0)
    })

    it('threw the correct error data', () => {
      assert.ok(err instanceof AppError)
      assert.equal(err.errno, AppError.ERRNO.UNEXPECTED_ERROR)
      assert.equal(err.message, 'Unspecified error')
    })
  })
})

describe('/sms disabled', () => {
  let log, config, routes

  beforeEach(() => {
    log = mocks.spyLog()
    config = {
      sms: {
        enabled: false
      }
    }
    routes = makeRoutes({ log, config })
  })

  it('routes was empty array', () => {
    assert.ok(Array.isArray(routes))
    assert.equal(routes.length, 0)
  })
})

describe('/sms/status', () => {
  let log, config, geodb, geodbResult, routes, route, request

  beforeEach(() => {
    log = mocks.spyLog()
    config = {
      sms: {
        enabled: true,
        regions: /^US$/
      }
    }
    geodb = sinon.spy(() => geodbResult)
    routes = makeRoutes({ log, config }, { '../geodb': () => geodb })
    route = getRoute(routes, '/sms/status')
    request = mocks.mockRequest({
      credentials: {
        email: 'foo@example.org'
      },
      log: log
    })
  })

  describe('getGeoData returns US and sms.balance returns isOk:true', () => {
    let response

    beforeEach(() => {
      geodbResult = Promise.resolve({ location: { countryCode: 'US' } })
      sms.balance = sinon.spy(() => P.resolve({ isOk: true }))
      return runTest(route, request)
        .then(r => response = r)
    })

    it('returned the correct response', () => {
      assert.deepEqual(response, { ok: true })
    })

    it('called log.begin correctly', () => {
      assert.equal(log.begin.callCount, 1)
      const args = log.begin.args[0]
      assert.equal(args.length, 2)
      assert.equal(args[0], 'sms.status')
      assert.equal(args[1], request)
    })

    it('called geodb correctly', () => {
      assert.equal(geodb.callCount, 1)
      const args = geodb.args[0]
      assert.equal(args.length, 1)
      assert.equal(args[0], request.app.clientAddress)
    })

    it('called sms.balance correctly', () => {
      assert.equal(sms.balance.callCount, 1)
      assert.equal(sms.balance.args[0].length, 0)
    })

    it('did not call log.error', () => {
      assert.equal(log.error.callCount, 0)
    })
  })

  describe('getGeoData returns US and sms.balance returns isOk:false', () => {
    let response

    beforeEach(() => {
      geodbResult = Promise.resolve({ location: { countryCode: 'US' } })
      sms.balance = sinon.spy(() => P.resolve({ isOk: false }))
      return runTest(route, request)
        .then(r => response = r)
    })

    it('returned the correct response', () => {
      assert.deepEqual(response, { ok: false })
    })

    it('called log.begin once', () => {
      assert.equal(log.begin.callCount, 1)
    })

    it('called geodb once', () => {
      assert.equal(geodb.callCount, 1)
    })

    it('called sms.balance once', () => {
      assert.equal(sms.balance.callCount, 1)
    })

    it('did not call log.error', () => {
      assert.equal(log.error.callCount, 0)
    })
  })

  describe('getGeoData returns CA and sms.balance returns isOk:true', () => {
    let response

    beforeEach(() => {
      geodbResult = Promise.resolve({ location: { countryCode: 'CA' } })
      sms.balance = sinon.spy(() => P.resolve({ isOk: true }))
      return runTest(route, request)
        .then(r => response = r)
    })

    it('returned the correct response', () => {
      assert.deepEqual(response, { ok: false })
    })

    it('called log.begin once', () => {
      assert.equal(log.begin.callCount, 1)
    })

    it('called geodb once', () => {
      assert.equal(geodb.callCount, 1)
    })

    it('called sms.balance once', () => {
      assert.equal(sms.balance.callCount, 1)
    })

    it('did not call log.error', () => {
      assert.equal(log.error.callCount, 0)
    })
  })

  describe('sms.balance fails', () => {
    let err

    beforeEach(() => {
      geodbResult = Promise.resolve({ location: { countryCode: 'US' } })
      sms.balance = sinon.spy(() => P.reject(new Error('foo')))
      return runTest(route, request)
        .catch(e => err = e)
    })

    it('threw the correct error data', () => {
      assert.ok(err instanceof AppError)
      assert.equal(err.errno, AppError.ERRNO.UNEXPECTED_ERROR)
      assert.equal(err.message, 'Unspecified error')
    })

    it('called log.begin once', () => {
      assert.equal(log.begin.callCount, 1)
    })

    it('called geodb once', () => {
      assert.equal(geodb.callCount, 1)
    })

    it('called sms.balance once', () => {
      assert.equal(sms.balance.callCount, 1)
    })

    it('called log.error correctly', () => {
      assert.equal(log.error.callCount, 1)
      const args = log.error.args[0]
      assert.equal(args.length, 1)
      assert.equal(args[0].op, 'sms.balance')
      assert.ok(args[0].err instanceof Error)
      assert.equal(args[0].err.message, 'foo')
    })
  })

  describe('getGeoData fails', () => {
    let err

    beforeEach(() => {
      geodbResult = Promise.reject(new Error('bar'))
      sms.balance = sinon.spy(() => P.resolve({ isOk: true }))
      return runTest(route, request)
        .catch(e => err = e)
    })

    it('threw the correct error data', () => {
      assert.ok(err instanceof AppError)
      assert.equal(err.errno, AppError.ERRNO.UNEXPECTED_ERROR)
      assert.equal(err.message, 'Unspecified error')
    })

    it('called log.begin once', () => {
      assert.equal(log.begin.callCount, 1)
    })

    it('called geodb once', () => {
      assert.equal(geodb.callCount, 1)
    })

    it('called sms.balance once', () => {
      assert.equal(sms.balance.callCount, 1)
    })

    it('called log.error correctly', () => {
      assert.equal(log.error.callCount, 1)
      const args = log.error.args[0]
      assert.equal(args.length, 1)
      assert.equal(args[0].op, 'sms.getGeoData')
      assert.ok(args[0].err instanceof Error)
      assert.equal(args[0].err.message, 'bar')
    })
  })
})

