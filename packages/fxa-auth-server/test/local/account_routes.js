/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var sinon = require('sinon')

const assert = require('insist')
var mocks = require('../mocks')
var getRoute = require('../routes_helpers').getRoute
var proxyquire = require('proxyquire')

var P = require('../../lib/promise')
var uuid = require('uuid')
var crypto = require('crypto')
var isA = require('joi')
var error = require('../../lib/error')
var log = require('../../lib/log')

var TEST_EMAIL = 'foo@gmail.com'
var TEST_EMAIL_INVALID = 'example@dotless-domain'

var makeRoutes = function (options, requireMocks) {
  options = options || {}

  var config = options.config || {}
  config.verifierVersion = config.verifierVersion || 0
  config.smtp = config.smtp ||  {}
  config.memcached = config.memcached || {
    address: '127.0.0.1:1121',
    idle: 500,
    lifetime: 30
  }
  config.i18n = {
    supportedLanguages: ['en'],
    defaultLanguage: 'en'
  }
  config.lastAccessTimeUpdates = {}
  config.signinConfirmation = config.signinConfirmation || {}
  config.signinUnblock = config.signinUnblock || {}

  var log = options.log || mocks.mockLog()
  var Password = options.Password || require('../../lib/crypto/password')(log, config)
  var db = options.db || mocks.mockDB()
  var isPreVerified = require('../../lib/preverifier')(error, config)
  var customs = options.customs || {
    check: function () { return P.resolve(true) }
  }
  var checkPassword = options.checkPassword || require('../../lib/routes/utils/password_check')(log, config, Password, customs, db)
  var push = options.push || require('../../lib/push')(log, db, {})
  return proxyquire('../../lib/routes/account', requireMocks || {})(
    log,
    require('../../lib/crypto/random'),
    P,
    uuid,
    isA,
    error,
    db,
    options.mailer || {},
    Password,
    config,
    customs,
    isPreVerified,
    checkPassword,
    push,
    options.devices || require('../../lib/devices')(log, db, push)
  )
}

function runTest (route, request, assertions) {
  return new P(function (resolve, reject) {
    route.handler(request, function (response) {
      //resolve(response)
      if (response instanceof Error) {
        reject(response)
      } else {
        resolve(response)
      }
    })
  })
  .then(assertions)
}

describe('/recovery_email/status', function () {
  var config = {
    signinConfirmation: {}
  }
  var mockDB = mocks.mockDB()
  var pushCalled
  var mockLog = mocks.mockLog({
    increment: function (name) {
      if (name === 'recovery_email_reason.push') {
        pushCalled = true
      }
    }
  })
  var accountRoutes = makeRoutes({
    config: config,
    db: mockDB,
    log: mockLog
  })
  var route = getRoute(accountRoutes, '/recovery_email/status')

  describe('sign-in confirmation disabled', function () {
    config.signinConfirmation.enabled = false

    describe('invalid email', function () {
      var mockRequest = mocks.mockRequest({
        credentials: {
          email: TEST_EMAIL_INVALID
        }
      })

      it('unverified account', function () {
        mockRequest.auth.credentials.emailVerified = false

        return runTest(route, mockRequest).then(() => assert.ok(false), function (response) {
          assert.equal(mockDB.deleteAccount.callCount, 1)
          assert.equal(mockDB.deleteAccount.firstCall.args[0].email, TEST_EMAIL_INVALID)
          assert.equal(response.errno, error.ERRNO.INVALID_TOKEN)
        })
        .then(function () {
          mockDB.deleteAccount.reset()
        })
      })

      it('verified account', function () {
        mockRequest.auth.credentials.uid = uuid.v4('binary').toString('hex')
        mockRequest.auth.credentials.emailVerified = true
        mockRequest.auth.credentials.tokenVerified = true

        return runTest(route, mockRequest, function (response) {
          assert.equal(mockDB.deleteAccount.callCount, 0)
          assert.deepEqual(response, {
            email: TEST_EMAIL_INVALID,
            verified: true,
            emailVerified: true,
            sessionVerified: true
          })
        })
      })
    })

    it('valid email, verified account', function () {
      pushCalled = false
      var mockRequest = mocks.mockRequest({
        credentials: {
          uid: uuid.v4('binary').toString('hex'),
          email: TEST_EMAIL,
          emailVerified: true,
          tokenVerified: true
        },
        query: {
          reason: 'push'
        }
      })

      return runTest(route, mockRequest, function (response) {
        assert.equal(pushCalled, true)

        assert.deepEqual(response, {
          email: TEST_EMAIL,
          verified: true,
          emailVerified: true,
          sessionVerified: true
        })
      })
    })
  })

  describe('sign-in confirmation enabled', function () {
    config.signinConfirmation.enabled = true
    config.signinConfirmation.sample_rate = 1
    var mockRequest = mocks.mockRequest({
      credentials: {
        uid: uuid.v4('binary').toString('hex'),
        email: TEST_EMAIL
      }
    })

    it('verified account, verified session', function () {
      mockRequest.auth.credentials.emailVerified = true
      mockRequest.auth.credentials.tokenVerified = true

      return runTest(route, mockRequest, function (response) {
        assert.deepEqual(response, {
          email: TEST_EMAIL,
          verified: true,
          sessionVerified: true,
          emailVerified: true
        })
      })
    })

    it('verified account, unverified session, must verify session', function () {
      mockRequest.auth.credentials.emailVerified = true
      mockRequest.auth.credentials.tokenVerified = false
      mockRequest.auth.credentials.mustVerify = true

      return runTest(route, mockRequest, function (response) {
        assert.deepEqual(response, {
          email: TEST_EMAIL,
          verified: false,
          sessionVerified: false,
          emailVerified: true
        })
      })
    })

    it('verified account, unverified session, neednt verify session', function () {
      mockRequest.auth.credentials.emailVerified = true
      mockRequest.auth.credentials.tokenVerified = false
      mockRequest.auth.credentials.mustVerify = false

      return runTest(route, mockRequest, function (response) {
        assert.deepEqual(response, {
          email: TEST_EMAIL,
          verified: true,
          sessionVerified: false,
          emailVerified: true
        })
      })
    })
  })
})

describe('/recovery_email/resend_code', () => {
  const config = {
    signinConfirmation: {}
  }
  const mockDB = mocks.mockDB()
  const mockLog = mocks.mockLog()
  mockLog.flowEvent = sinon.spy(() => {
    return P.resolve()
  })
  const mockMailer = mocks.mockMailer()
  const mockMetricsContext = mocks.mockMetricsContext({
    gather: sinon.spy(function (data) {
      return P.resolve(this.payload && this.payload.metricsContext)
    })
  })
  const accountRoutes = makeRoutes({
    config: config,
    db: mockDB,
    log: mockLog,
    mailer: mockMailer
  })
  const route = getRoute(accountRoutes, '/recovery_email/resend_code')

  it('verification', () => {
    const mockRequest = mocks.mockRequest({
      log: mockLog,
      metricsContext: mockMetricsContext,
      credentials: {
        uid: uuid.v4('binary').toString('hex'),
        email: TEST_EMAIL,
        emailVerified: false,
        tokenVerified: false
      },
      query: {},
      payload: {
        metricsContext: {
          flowBeginTime: Date.now(),
          flowId: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          entrypoint: 'preferences',
          utmContent: 'some-content-string'
        }
      }
    })
    mockLog.flowEvent.reset()

    return runTest(route, mockRequest, response => {
      assert.equal(mockLog.flowEvent.callCount, 1, 'log.flowEvent called once')
      assert.equal(mockLog.flowEvent.args[0][0], 'email.verification.resent')
    })
  })

  it('confirmation', () => {
    const mockRequest = mocks.mockRequest({
      log: mockLog,
      metricsContext: mockMetricsContext,
      credentials: {
        uid: uuid.v4('binary').toString('hex'),
        email: TEST_EMAIL,
        emailVerified: true,
        tokenVerified: false
      },
      query: {},
      payload: {
        metricsContext: {
          flowBeginTime: Date.now(),
          flowId: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          entrypoint: 'preferences',
          utmContent: 'some-content-string'
        }
      }
    })
    mockLog.flowEvent.reset()

    return runTest(route, mockRequest, response => {
      assert.equal(mockLog.flowEvent.callCount, 1, 'log.flowEvent called once')
      assert.equal(mockLog.flowEvent.args[0][0], 'email.confirmation.resent')
    })
  })

})

describe('/account/reset', function () {
  it('should do things', () => {
    var uid = uuid.v4('binary')
    const mockLog = mocks.spyLog()
    const mockRequest = mocks.mockRequest({
      credentials: {
        uid: uid.toString('hex')
      },
      log: mockLog,
      payload: {
        authPW: crypto.randomBytes(32).toString('hex')
      }
    })
    var mockDB = mocks.mockDB({
      uid: uid,
      email: TEST_EMAIL,
      wrapWrapKb: crypto.randomBytes(32)
    })
    var mockCustoms = mocks.mockCustoms()
    var mockPush = mocks.mockPush()
    var accountRoutes = makeRoutes({
      config: {
        securityHistory: {
          enabled: true
        }
      },
      customs: mockCustoms,
      db: mockDB,
      log: mockLog,
      push: mockPush
    })
    var route = getRoute(accountRoutes, '/account/reset')

    var clientAddress = mockRequest.app.clientAddress
    return runTest(route, mockRequest, function (res) {
      assert.equal(mockDB.resetAccount.callCount, 1)

      assert.equal(mockPush.notifyPasswordReset.callCount, 1)
      assert.equal(mockPush.notifyPasswordReset.firstCall.args[0], uid.toString('hex'))

      assert.equal(mockDB.account.callCount, 1)
      assert.equal(mockCustoms.reset.callCount, 1)

      assert.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
      var args = mockLog.activityEvent.args[0]
      assert.equal(args.length, 3, 'log.activityEvent was passed three arguments')
      assert.equal(args[0], 'account.reset', 'first argument was event name')
      assert.equal(args[1], mockRequest, 'second argument was request object')
      assert.deepEqual(args[2], { uid: uid.toString('hex') }, 'third argument contained uid')

      assert.equal(mockDB.securityEvent.callCount, 1, 'db.securityEvent was called')
      var securityEvent = mockDB.securityEvent.args[0][0]
      assert.equal(securityEvent.uid, uid)
      assert.equal(securityEvent.ipAddr, clientAddress)
      assert.equal(securityEvent.name, 'account.reset')
    })
  })
})

describe('/account/device', function () {
  var config = {}
  var uid = uuid.v4('binary')
  var deviceId = crypto.randomBytes(16)
  var mockRequest = mocks.mockRequest({
    credentials: {
      deviceCallbackPublicKey: '',
      deviceCallbackURL: '',
      deviceId: deviceId,
      deviceName: 'my awesome device',
      deviceType: 'desktop',
      tokenId: crypto.randomBytes(16),
      uid: uid
    },
    payload: {
      id: deviceId.toString('hex'),
      name: 'my awesome device'
    }
  })
  var mockDevices = mocks.mockDevices()
  var mockLog = mocks.spyLog()
  var accountRoutes = makeRoutes({
    config: config,
    devices: mockDevices,
    log: mockLog
  })
  var route = getRoute(accountRoutes, '/account/device')

  it('identical data', function () {
    return runTest(route, mockRequest, function (response) {
      assert.equal(mockLog.increment.callCount, 1, 'a counter was incremented')
      assert.equal(mockLog.increment.firstCall.args[0], 'device.update.spurious')

      assert.deepEqual(response, mockRequest.payload)
    })
    .then(function () {
      mockLog.increment.reset()
    })
  })

  it('different data', function () {
    mockRequest.auth.credentials.deviceId = crypto.randomBytes(16)
    var payload = mockRequest.payload
    payload.name = 'my even awesomer device'
    payload.type = 'phone'
    payload.pushCallback = 'https://push.services.mozilla.com/123456'
    payload.pushPublicKey = 'SomeEncodedBinaryStuffThatDoesntGetValidedByThisTest'

    return runTest(route, mockRequest, function (response) {
      assert.equal(mockLog.increment.callCount, 5, 'the counters were incremented')
      assert.equal(mockLog.increment.getCall(0).args[0], 'device.update.sessionToken')
      assert.equal(mockLog.increment.getCall(1).args[0], 'device.update.name')
      assert.equal(mockLog.increment.getCall(2).args[0], 'device.update.type')
      assert.equal(mockLog.increment.getCall(3).args[0], 'device.update.pushCallback')
      assert.equal(mockLog.increment.getCall(4).args[0], 'device.update.pushPublicKey')

      assert.equal(mockDevices.upsert.callCount, 1, 'devices.upsert was called once')
      var args = mockDevices.upsert.args[0]
      assert.equal(args.length, 3, 'devices.upsert was passed three arguments')
      assert.equal(args[0], mockRequest, 'first argument was request object')
      assert.deepEqual(args[1].tokenId, mockRequest.auth.credentials.tokenId, 'second argument was session token')
      assert.deepEqual(args[1].uid, uid, 'sessionToken.uid was correct')
      assert.deepEqual(args[2], mockRequest.payload, 'third argument was payload')
    })
    .then(function () {
      mockLog.increment.reset()
      mockDevices.upsert.reset()
    })
  })

  it('with no id in payload', function () {
    mockRequest.payload.id = undefined

    return runTest(route, mockRequest, function (response) {
      assert.equal(mockLog.increment.callCount, 0, 'log.increment was not called')

      assert.equal(mockDevices.upsert.callCount, 1, 'devices.upsert was called once')
      var args = mockDevices.upsert.args[0]
      assert.equal(args[2].id, mockRequest.auth.credentials.deviceId.toString('hex'), 'payload.id defaulted to credentials.deviceId')
    })
    .then(function () {
      mockLog.increment.reset()
      mockDevices.upsert.reset()
    })
  })

  it('device updates disabled', function () {
    config.deviceUpdatesEnabled = false

    return runTest(route, mockRequest, function () {
      assert(false, 'should have thrown')
    })
    .then(() => assert.ok(false), function (err) {
      assert.equal(err.output.statusCode, 503, 'correct status code is returned')
      assert.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED, 'correct errno is returned')
    })
  })
})

describe('/account/devices/notify', function () {
  var config = {}
  var uid = uuid.v4('binary')
  var mockRequest = mocks.mockRequest({
    credentials: {
      uid: uid.toString('hex')
    }
  })
  var pushPayload = {
    isValid: true,
    version: 1,
    command: 'sync:collection_changed',
    data: {
      collections: ['clients']
    }
  }
  var mockPush = mocks.mockPush()
  var validate = sinon.spy(function (payload) { return payload.isValid })
  var mockAjv = function () {
    return {
      compile: function () {
        return validate
      }
    }
  }
  var sandbox = sinon.sandbox.create()
  var mockCustoms = mocks.mockCustoms()
  var accountRoutes = makeRoutes({
    config: config,
    customs: mockCustoms,
    push: mockPush
  }, {
    ajv: mockAjv
  })
  var route = getRoute(accountRoutes, '/account/devices/notify')

  it('bad payload', function () {
    mockRequest.payload = {
      to: ['bogusid1'],
      payload: {
        isValid: false
      }
    }
    return runTest(route, mockRequest, function () {
      assert(false, 'should have thrown')
    })
    .then(() => assert(false), function (err) {
      assert.equal(validate.callCount, 1, 'ajv validator function was called')
      assert.equal(mockPush.pushToDevices.callCount, 0, 'mockPush.pushToDevices was not called')
      assert.equal(err.errno, 107, 'Correct errno for invalid push payload')
    })
  })

  it('all devices', function () {
    mockRequest.payload = {
      to: 'all',
      excluded: ['bogusid'],
      TTL: 60,
      payload: pushPayload
    }
    return runTest(route, mockRequest, function (response) {
      assert.equal(mockCustoms.checkAuthenticated.callCount, 1, 'mockCustoms.checkAuthenticated was called once')
      assert.equal(mockPush.pushToAllDevices.callCount, 1, 'mockPush.pushToAllDevices was called once')
      var args = mockPush.pushToAllDevices.args[0]
      assert.equal(args.length, 3, 'mockPush.pushToAllDevices was passed three arguments')
      assert.equal(args[0], uid.toString('hex'), 'first argument was the device uid')
      assert.equal(args[1], 'devicesNotify', 'second argument was the devicesNotify reason')
      assert.deepEqual(args[2], {
        data: new Buffer(JSON.stringify(pushPayload)),
        excludedDeviceIds: ['bogusid'],
        TTL: 60
      }, 'third argument was the push options')
    })
  })

  it('specific devices', function () {
    mockCustoms.checkAuthenticated.reset()
    mockRequest.payload = {
      to: ['bogusid1', 'bogusid2'],
      TTL: 60,
      payload: pushPayload
    }
    return runTest(route, mockRequest, function (response) {
      assert.equal(mockCustoms.checkAuthenticated.callCount, 1, 'mockCustoms.checkAuthenticated was called once')
      assert.equal(mockPush.pushToDevices.callCount, 1, 'mockPush.pushToDevices was called once')
      var args = mockPush.pushToDevices.args[0]
      assert.equal(args.length, 4, 'mockPush.pushToDevices was passed four arguments')
      assert.equal(args[0], uid.toString('hex'), 'first argument was the device uid')
      assert.deepEqual(args[1], ['bogusid1', 'bogusid2'], 'second argument was the list of device ids')
      assert.equal(args[2], 'devicesNotify', 'third argument was the devicesNotify reason')
      assert.deepEqual(args[3], {
        data: new Buffer(JSON.stringify(pushPayload)),
        TTL: 60
      }, 'fourth argument was the push options')
    })
  })

  it('device driven notifications disabled', function () {
    config.deviceNotificationsEnabled = false
    mockRequest.payload = {
      to: 'all',
      excluded: ['bogusid'],
      TTL: 60,
      payload: pushPayload
    }

    return runTest(route, mockRequest, function () {
      assert(false, 'should have thrown')
    })
    .then(() => assert.ok(false), function (err) {
      assert.equal(err.output.statusCode, 503, 'correct status code is returned')
      assert.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED, 'correct errno is returned')
    })
  })

  it('throws error if customs blocked the request', function () {
    config.deviceNotificationsEnabled = true

    mockCustoms = mocks.mockCustoms({
      checkAuthenticated: sandbox.spy(function () {
        throw error.tooManyRequests(1)
      })
    })
    route = getRoute(makeRoutes({customs: mockCustoms}), '/account/devices/notify')

    return runTest(route, mockRequest, function (response) {
      assert(false, 'should have thrown')
    })
    .then(() => assert(false), function (err) {
      assert.equal(mockCustoms.checkAuthenticated.callCount, 1, 'mockCustoms.checkAuthenticated was called once')
      assert.equal(err.message, 'Client has sent too many requests')
    })
  })

  it('logs error if no devices found', () => {
    mockRequest.payload = {
      to: ['bogusid1', 'bogusid2'],
      TTL: 60,
      payload: pushPayload
    }

    var mockLog = mocks.spyLog()
    var mockPush = mocks.mockPush({
      pushToDevices: () => P.reject('Devices ids not found in devices')
    })
    var mockCustoms = {
      checkAuthenticated: () => P.resolve()
    }

    route = getRoute(makeRoutes({
      customs: mockCustoms,
      log: mockLog,
      push: mockPush
    }), '/account/devices/notify')

    return runTest(route, mockRequest, function (response) {
      assert.equal(JSON.stringify(response), '{}', 'response should not throw push errors')
    })
  })
})

describe('/account/device/destroy', function () {
  it('should work', () => {
    var uid = uuid.v4('binary')
    var deviceId = crypto.randomBytes(16).toString('hex')
    var mockLog = mocks.spyLog()
    var mockDB = mocks.mockDB()
    var mockRequest = mocks.mockRequest({
      credentials: {
        uid: uid.toString('hex'),
      },
      log: mockLog,
      payload: {
        id: deviceId
      }
    })
    var mockPush = mocks.mockPush()
    var accountRoutes = makeRoutes({
      db: mockDB,
      log: mockLog,
      push: mockPush
    })
    var route = getRoute(accountRoutes, '/account/device/destroy')

    return runTest(route, mockRequest, function () {
      assert.equal(mockDB.deleteDevice.callCount, 1)

      assert.equal(mockPush.notifyDeviceDisconnected.callCount, 1)
      assert.equal(mockPush.notifyDeviceDisconnected.firstCall.args[0], mockRequest.auth.credentials.uid)
      assert.equal(mockPush.notifyDeviceDisconnected.firstCall.args[1], deviceId)

      assert.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
      var args = mockLog.activityEvent.args[0]
      assert.equal(args.length, 3, 'log.activityEvent was passed three arguments')
      assert.equal(args[0], 'device.deleted', 'first argument was event name')
      assert.equal(args[1], mockRequest, 'second argument was request object')
      assert.deepEqual(args[2], { uid: uid.toString('hex'), device_id: deviceId }, 'third argument contained uid and deviceId')

      assert.equal(mockLog.notifyAttachedServices.callCount, 1)
      args = mockLog.notifyAttachedServices.args[0]
      assert.equal(args.length, 3)
      assert.equal(args[0], 'device:delete')
      assert.equal(args[1], mockRequest)
      var details = args[2]
      assert.equal(details.uid, uid.toString('hex'))
      assert.equal(details.id, deviceId)
      assert.ok(Date.now() - details.timestamp < 100)
    })
  })
})

describe('/account/create', function () {
  it('should create an account', () => {
    // We want to test what's actually written to stdout by the logger.
    const mockLog = log('ERROR', 'test', {
      stdout: {
        on: sinon.spy(),
        write: sinon.spy()
      },
      stderr: {
        on: sinon.spy(),
        write: sinon.spy()
      }
    })
    mockLog.activityEvent = sinon.spy(() => {
      return P.resolve()
    })
    const mockMetricsContext = mocks.mockMetricsContext({
      gather: sinon.spy(function (data) {
        return P.resolve(this.payload && this.payload.metricsContext)
      })
    })
    const mockRequest = mocks.mockRequest({
      log: mockLog,
      metricsContext: mockMetricsContext,
      payload: {
        email: TEST_EMAIL,
        authPW: crypto.randomBytes(32).toString('hex'),
        service: 'sync',
        metricsContext: {
          flowBeginTime: Date.now(),
          flowId: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          entrypoint: 'preferences',
          utmContent: 'some-content-string'
        }
      },
      query: {
        keys: 'true'
      }
    })
    var clientAddress = mockRequest.app.clientAddress
    var emailCode = crypto.randomBytes(16)
    var keyFetchTokenId = crypto.randomBytes(16)
    var sessionTokenId = crypto.randomBytes(16)
    var uid = uuid.v4('binary')
    var mockDB = mocks.mockDB({
      email: TEST_EMAIL,
      emailCode: emailCode,
      emailVerified: false,
      keyFetchTokenId: keyFetchTokenId,
      sessionTokenId: sessionTokenId,
      uid: uid,
      wrapWrapKb: 'wibble'
    }, {
      emailRecord: new error.unknownAccount()
    })
    var mockMailer = mocks.mockMailer()
    var mockPush = mocks.mockPush()
    var accountRoutes = makeRoutes({
      config: {
        securityHistory: {
          enabled: true
        }
      },
      db: mockDB,
      log: mockLog,
      mailer: mockMailer,
      Password: function () {
        return {
          unwrap: function () {
            return P.resolve('wibble')
          },
          verifyHash: function () {
            return P.resolve('wibble')
          }
        }
      },
      push: mockPush
    })
    var route = getRoute(accountRoutes, '/account/create')

    return runTest(route, mockRequest, function () {
      assert.equal(mockDB.createAccount.callCount, 1, 'createAccount was called')

      assert.equal(mockLog.stdout.write.callCount, 1, 'an sqs event was logged')
      var eventData = JSON.parse(mockLog.stdout.write.getCall(0).args[0])
      assert.equal(eventData.event, 'login', 'it was a login event')
      assert.equal(eventData.data.service, 'sync', 'it was for sync')
      assert.equal(eventData.data.email, TEST_EMAIL, 'it was for the correct email')
      assert.deepEqual(eventData.data.metricsContext, mockRequest.payload.metricsContext, 'it contained the correct metrics context metadata')

      assert.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
      var args = mockLog.activityEvent.args[0]
      assert.equal(args.length, 3, 'log.activityEvent was passed three arguments')
      assert.equal(args[0], 'account.created', 'first argument was event name')
      assert.equal(args[1], mockRequest, 'second argument was request object')
      assert.deepEqual(args[2], { uid: uid.toString('hex') }, 'third argument contained uid')

      assert.equal(mockMetricsContext.validate.callCount, 1, 'metricsContext.validate was called')
      assert.equal(mockMetricsContext.validate.args[0].length, 0, 'validate was called without arguments')

      assert.equal(mockMetricsContext.stash.callCount, 3, 'metricsContext.stash was called three times')

      args = mockMetricsContext.stash.args[0]
      assert.equal(args.length, 1, 'metricsContext.stash was passed one argument first time')
      assert.deepEqual(args[0].tokenId, sessionTokenId, 'argument was session token')
      assert.deepEqual(args[0].uid, uid, 'sessionToken.uid was correct')
      assert.equal(mockMetricsContext.stash.thisValues[0], mockRequest, 'this was request')

      args = mockMetricsContext.stash.args[1]
      assert.equal(args.length, 1, 'metricsContext.stash was passed one argument second time')
      assert.equal(args[0].id, emailCode.toString('hex'), 'argument was synthesized token')
      assert.deepEqual(args[0].uid, uid, 'token.uid was correct')
      assert.equal(mockMetricsContext.stash.thisValues[1], mockRequest, 'this was request')

      args = mockMetricsContext.stash.args[2]
      assert.equal(args.length, 1, 'metricsContext.stash was passed one argument third time')
      assert.deepEqual(args[0].tokenId, keyFetchTokenId, 'argument was key fetch token')
      assert.deepEqual(args[0].uid, uid, 'keyFetchToken.uid was correct')
      assert.equal(mockMetricsContext.stash.thisValues[2], mockRequest, 'this was request')

      assert.equal(mockMetricsContext.setFlowCompleteSignal.callCount, 1, 'metricsContext.setFlowCompleteSignal was called once')
      args = mockMetricsContext.setFlowCompleteSignal.args[0]
      assert.equal(args.length, 1, 'metricsContext.setFlowCompleteSignal was passed one argument')
      assert.deepEqual(args[0], 'account.signed', 'argument was event name')

      var securityEvent = mockDB.securityEvent
      assert.equal(securityEvent.callCount, 1, 'db.securityEvent is called')
      securityEvent = securityEvent.args[0][0]
      assert.equal(securityEvent.name, 'account.create')
      assert.equal(securityEvent.uid, uid)
      assert.equal(securityEvent.ipAddr, clientAddress)
    })
  })
})

describe('/account/login', function () {
  var config = {
    newLoginNotificationEnabled: true,
    securityHistory: {
      enabled: true
    },
    signinConfirmation: {},
    signinUnblock: {
      allowedEmailAddresses: /^.*$/,
      codeLifetime: 1000,
      enabled: true
    }
  }
  // We want to test what's actually written to stdout by the logger.
  const mockLog = log('ERROR', 'test', {
    stdout: {
      on: sinon.spy(),
      write: sinon.spy()
    },
    stderr: {
      on: sinon.spy(),
      write: sinon.spy()
    }
  })
  mockLog.activityEvent = sinon.spy(() => {
    return P.resolve()
  })
  mockLog.flowEvent = sinon.spy(() => {
    return P.resolve()
  })
  const mockMetricsContext = mocks.mockMetricsContext({
    gather: sinon.spy(function (data) {
      return P.resolve(this.payload && this.payload.metricsContext)
    })
  })

  const mockRequest = mocks.mockRequest({
    log: mockLog,
    metricsContext: mockMetricsContext,
    payload: {
      authPW: crypto.randomBytes(32).toString('hex'),
      email: TEST_EMAIL,
      service: 'sync',
      reason: 'signin',
      metricsContext: {
        context: 'fx_desktop_v3',
        flowBeginTime: Date.now(),
        flowId: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
        entrypoint: 'preferences',
        utmContent: 'some-content-string'
      }
    },
    query: {
      keys: 'true'
    }
  })
  const mockRequestNoKeys = mocks.mockRequest({
    log: mockLog,
    metricsContext: mockMetricsContext,
    payload: {
      authPW: crypto.randomBytes(32).toString('hex'),
      email: 'test@mozilla.com',
      service: 'dcdb5ae7add825d2',
      reason: 'signin',
      metricsContext: {
        flowBeginTime: Date.now(),
        flowId: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
        service: 'dcdb5ae7add825d2'
      }
    },
    query: {}
  })
  const mockRequestWithUnblockCode = mocks.mockRequest({
    log: mockLog,
    query: {},
    payload: {
      authPW: crypto.randomBytes(32).toString('hex'),
      email: 'test@mozilla.com',
      unblockCode: 'ABCD1234',
      service: 'dcdb5ae7add825d2',
      reason: 'signin',
      metricsContext: {
        flowBeginTime: Date.now(),
        flowId: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
        service: 'dcdb5ae7add825d2'
      }
    }
  })
  var keyFetchTokenId = crypto.randomBytes(16)
  var sessionTokenId = crypto.randomBytes(16)
  var uid = uuid.v4('binary')
  var mockDB = mocks.mockDB({
    email: TEST_EMAIL,
    emailVerified: true,
    keyFetchTokenId: keyFetchTokenId,
    sessionTokenId: sessionTokenId,
    uid: uid
  })
  var mockMailer = mocks.mockMailer()
  var mockPush = mocks.mockPush()
  var mockCustoms = {
    check: () => P.resolve(),
    flag: () => P.resolve()
  }
  var accountRoutes = makeRoutes({
    checkPassword: function () {
      return P.resolve(true)
    },
    config: config,
    customs: mockCustoms,
    db: mockDB,
    log: mockLog,
    mailer: mockMailer,
    push: mockPush
  })
  var route = getRoute(accountRoutes, '/account/login')

  const defaultEmailRecord = mockDB.emailRecord

  beforeEach(() => {
    mockLog.activityEvent.reset()
    mockLog.flowEvent.reset()
    mockLog.stdout.write.reset()
    mockMailer.sendNewDeviceLoginNotification.reset()
    mockDB.createSessionToken.reset()
    mockDB.sessions.reset()
    mockMetricsContext.stash.reset()
    mockMetricsContext.validate.reset()
    mockMetricsContext.setFlowCompleteSignal.reset()
  })

  describe('sign-in confirmation disabled', function () {

    beforeEach(() => {
      mockDB.emailRecord = defaultEmailRecord
      mockDB.emailRecord.reset()
    })
    it('sign-in does not require verification', function () {
      return runTest(route, mockRequest, function (response) {
        assert.equal(mockDB.emailRecord.callCount, 1, 'db.emailRecord was called')
        assert.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')
        var tokenData = mockDB.createSessionToken.getCall(0).args[0]
        assert.ok(!tokenData.mustVerify, 'sessionToken was created verified')
        assert.ok(!tokenData.tokenVerificationId, 'sessionToken was created verified')
        assert.equal(mockDB.sessions.callCount, 1, 'db.sessions was called')

        assert.equal(mockLog.stdout.write.callCount, 1, 'an sqs event was logged')
        var eventData = JSON.parse(mockLog.stdout.write.getCall(0).args[0])
        assert.equal(eventData.event, 'login', 'it was a login event')
        assert.equal(eventData.data.service, 'sync', 'it was for sync')
        assert.equal(eventData.data.email, TEST_EMAIL, 'it was for the correct email')
        assert.deepEqual(eventData.data.metricsContext, mockRequest.payload.metricsContext, 'it contained the metrics context')

        assert.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
        let args = mockLog.activityEvent.args[0]
        assert.equal(args.length, 3, 'log.activityEvent was passed three arguments')
        assert.equal(args[0], 'account.login', 'first argument was event name')
        assert.equal(args[1], mockRequest, 'second argument was request object')
        assert.deepEqual(args[2], {uid: uid.toString('hex')}, 'third argument contained uid')

        assert.equal(mockLog.flowEvent.callCount, 1, 'log.flowEvent was called once')
        args = mockLog.flowEvent.args[0]
        assert.equal(args.length, 2, 'log.flowEvent was passed two arguments')
        assert.equal(args[0], 'account.login', 'first argument was event name')
        assert.equal(args[1], mockRequest, 'second argument was request object')

        assert.equal(mockMetricsContext.validate.callCount, 1, 'metricsContext.validate was called')
        assert.equal(mockMetricsContext.validate.args[0].length, 0, 'validate was called without arguments')

        assert.equal(mockMetricsContext.stash.callCount, 2, 'metricsContext.stash was called twice')

        args = mockMetricsContext.stash.args[0]
        assert.equal(args.length, 1, 'metricsContext.stash was passed one argument first time')
        assert.deepEqual(args[0].tokenId, sessionTokenId, 'argument was session token')
        assert.deepEqual(args[0].uid, uid, 'sessionToken.uid was correct')
        assert.equal(mockMetricsContext.stash.thisValues[0], mockRequest, 'this was request')

        args = mockMetricsContext.stash.args[1]
        assert.equal(args.length, 1, 'metricsContext.stash was passed one argument second time')
        assert.deepEqual(args[0].tokenId, keyFetchTokenId, 'argument was key fetch token')
        assert.deepEqual(args[0].uid, uid, 'keyFetchToken.uid was correct')
        assert.equal(mockMetricsContext.stash.thisValues[1], mockRequest, 'this was request')

        assert.equal(mockMetricsContext.setFlowCompleteSignal.callCount, 1, 'metricsContext.setFlowCompleteSignal was called once')
        args = mockMetricsContext.setFlowCompleteSignal.args[0]
        assert.equal(args.length, 1, 'metricsContext.setFlowCompleteSignal was passed one argument')
        assert.deepEqual(args[0], 'account.signed', 'argument was event name')

        assert.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 1, 'mailer.sendNewDeviceLoginNotification was called')
        assert.equal(mockMailer.sendNewDeviceLoginNotification.getCall(0).args[1].location.city, 'Mountain View')
        assert.equal(mockMailer.sendNewDeviceLoginNotification.getCall(0).args[1].location.country, 'United States')
        assert.equal(mockMailer.sendNewDeviceLoginNotification.getCall(0).args[1].timeZone, 'America/Los_Angeles')
        assert.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
        assert.ok(response.verified, 'response indicates account is verified')
        assert.ok(!response.verificationMethod, 'verificationMethod doesn\'t exist')
        assert.ok(!response.verificationReason, 'verificationReason doesn\'t exist')
      }).then(function () {
        mockLog.activityEvent.reset()
        mockLog.flowEvent.reset()
        mockMailer.sendNewDeviceLoginNotification.reset()
        mockDB.createSessionToken.reset()
        mockMetricsContext.stash.reset()
        mockMetricsContext.setFlowCompleteSignal.reset()
      })
    })

    describe('sign-in unverified account', function () {
      it('sends email code', function () {
        var emailCode = crypto.randomBytes(16)
        mockDB.emailRecord = function () {
          return P.resolve({
            authSalt: crypto.randomBytes(32),
            data: crypto.randomBytes(32),
            email: TEST_EMAIL,
            emailVerified: false,
            emailCode: emailCode,
            kA: crypto.randomBytes(32),
            lastAuthAt: function () {
              return Date.now()
            },
            uid: uid,
            wrapWrapKb: crypto.randomBytes(32)
          })
        }

        return runTest(route, mockRequest, function (response) {
          assert.equal(mockMailer.sendVerifyCode.callCount, 1, 'mailer.sendVerifyCode was called')

          // Verify that the email code was sent
          var verifyCallArgs = mockMailer.sendVerifyCode.getCall(0).args
          assert.equal(verifyCallArgs[1], emailCode, 'mailer.sendVerifyCode was called with emailCode')
          assert.equal(mockLog.flowEvent.callCount, 2, 'log.flowEvent was called twice')
          assert.equal(mockLog.flowEvent.args[0][0], 'account.login', 'first event was login')
          assert.equal(mockLog.flowEvent.args[1][0], 'email.verification.sent', 'second event was sent')
          assert.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
          assert.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
          assert.equal(response.verified, false, 'response indicates account is unverified')
          assert.equal(response.verificationMethod, 'email', 'verificationMethod is email')
          assert.equal(response.verificationReason, 'signup', 'verificationReason is signup')
          assert.equal(response.emailSent, true, 'email sent')
        }).then(function () {
          mockLog.flowEvent.reset()
          mockMailer.sendVerifyCode.reset()
          mockDB.createSessionToken.reset()
          mockMetricsContext.stash.reset()
        })
      })
    })
  })

  describe('sign-in confirmation enabled', function () {
    before(() => {
      config.signinConfirmation.enabled = true
      config.signinConfirmation.supportedClients = [ 'fx_desktop_v3' ]
      config.signinConfirmation.enabledEmailAddresses = /.+@mozilla\.com$/

      mockDB.emailRecord = function () {
        return P.resolve({
          authSalt: crypto.randomBytes(32),
          data: crypto.randomBytes(32),
          email: TEST_EMAIL,
          emailVerified: true,
          kA: crypto.randomBytes(32),
          lastAuthAt: function () {
            return Date.now()
          },
          uid: uid,
          wrapWrapKb: crypto.randomBytes(32)
        })
      }
    })

    it('always on', function () {
      config.signinConfirmation.sample_rate = 1

      return runTest(route, mockRequest, function (response) {
        assert.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')
        var tokenData = mockDB.createSessionToken.getCall(0).args[0]
        assert.ok(tokenData.mustVerify, 'sessionToken must be verified before use')
        assert.ok(tokenData.tokenVerificationId, 'sessionToken was created unverified')
        assert.equal(mockMailer.sendVerifyCode.callCount, 0, 'mailer.sendVerifyCode was not called')
        assert.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        assert.ok(!response.verified, 'response indicates account is not verified')
        assert.equal(response.verificationMethod, 'email', 'verificationMethod is email')
        assert.equal(response.verificationReason, 'login', 'verificationReason is login')

        assert.equal(mockLog.flowEvent.callCount, 2, 'log.flowEvent was called twice')
        assert.equal(mockLog.flowEvent.args[0][0], 'account.login', 'first event was login')
        assert.equal(mockLog.flowEvent.args[1][0], 'email.confirmation.sent', 'second event was sent')

        assert.equal(mockMetricsContext.stash.callCount, 3, 'metricsContext.stash was called three times')
        var args = mockMetricsContext.stash.args[1]
        assert.equal(args.length, 1, 'metricsContext.stash was passed one argument second time')
        assert.ok(/^[0-9a-f]{32}$/.test(args[0].id), 'argument was synthesized token')
        assert.deepEqual(args[0].uid, uid, 'token.uid was correct')
        assert.equal(mockMetricsContext.stash.thisValues[1], mockRequest, 'this was request')

        assert.equal(mockMailer.sendVerifyLoginEmail.callCount, 1, 'mailer.sendVerifyLoginEmail was called')
        assert.equal(mockMailer.sendVerifyLoginEmail.getCall(0).args[2].location.city, 'Mountain View')
        assert.equal(mockMailer.sendVerifyLoginEmail.getCall(0).args[2].location.country, 'United States')
        assert.equal(mockMailer.sendVerifyLoginEmail.getCall(0).args[2].timeZone, 'America/Los_Angeles')
      }).then(function () {
        mockLog.flowEvent.reset()
        mockMailer.sendVerifyLoginEmail.reset()
        mockDB.createSessionToken.reset()
        mockMetricsContext.stash.reset()
      })
    })

    it('on for email regex match, keys requested', function () {
      mockRequest.payload.email = 'test@mozilla.com'
      mockDB.emailRecord = function () {
        return P.resolve({
          authSalt: crypto.randomBytes(32),
          data: crypto.randomBytes(32),
          email: 'test@mozilla.com',
          emailVerified: true,
          kA: crypto.randomBytes(32),
          lastAuthAt: function () {
            return Date.now()
          },
          uid: uid,
          wrapWrapKb: crypto.randomBytes(32)
        })
      }

      return runTest(route, mockRequest, function (response) {
        assert.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')
        var tokenData = mockDB.createSessionToken.getCall(0).args[0]
        assert.ok(tokenData.mustVerify, 'sessionToken must be verified before use')
        assert.ok(tokenData.tokenVerificationId, 'sessionToken was created unverified')
        assert.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        assert.equal(mockMailer.sendVerifyLoginEmail.callCount, 1, 'mailer.sendVerifyLoginEmail was called')
        assert.ok(!response.verified, 'response indicates account is not verified')
        assert.equal(response.verificationMethod, 'email', 'verificationMethod is email')
        assert.equal(response.verificationReason, 'login', 'verificationReason is login')
      }).then(function () {
        mockMailer.sendVerifyLoginEmail.reset()
        mockDB.createSessionToken.reset()
        mockMetricsContext.setFlowCompleteSignal.reset()
      })
    })

    it('off for email regex match, keys not requested', function () {
      mockDB.emailRecord = function () {
        return P.resolve({
          authSalt: crypto.randomBytes(32),
          data: crypto.randomBytes(32),
          email: 'test@mozilla.com',
          emailVerified: true,
          kA: crypto.randomBytes(32),
          lastAuthAt: function () {
            return Date.now()
          },
          uid: uid,
          wrapWrapKb: crypto.randomBytes(32)
        })
      }

      return runTest(route, mockRequestNoKeys, function (response) {
        assert.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')
        var tokenData = mockDB.createSessionToken.getCall(0).args[0]
        assert.ok(!tokenData.mustVerify, 'sessionToken does not have to be verified')
        assert.ok(tokenData.tokenVerificationId, 'sessionToken was created unverified')
        // Note that *neither* email is sent in this case,
        // since it can't have been a new device connection.
        assert.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        assert.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')

        assert.equal(mockMetricsContext.setFlowCompleteSignal.callCount, 1, 'metricsContext.setFlowCompleteSignal was called once')
        assert.deepEqual(mockMetricsContext.setFlowCompleteSignal.args[0][0], 'account.login', 'argument was event name')

        assert.ok(response.verified, 'response indicates account is verified')
        assert.ok(!response.verificationMethod, 'verificationMethod doesn\'t exist')
        assert.ok(!response.verificationReason, 'verificationReason doesn\'t exist')
      }).then(function () {
        mockDB.createSessionToken.reset()
        mockMetricsContext.setFlowCompleteSignal.reset()
      })
    })

    it('off for email regex mismatch', function () {
      config.signinConfirmation.sample_rate = 0
      mockRequest.payload.email = 'moz@fire.fox'
      mockDB.emailRecord = function () {
        return P.resolve({
          authSalt: crypto.randomBytes(32),
          data: crypto.randomBytes(32),
          email: 'moz@fire.fox',
          emailVerified: true,
          kA: crypto.randomBytes(32),
          lastAuthAt: function () {
            return Date.now()
          },
          uid: uid,
          wrapWrapKb: crypto.randomBytes(32)
        })
      }
      return runTest(route, mockRequest, function (response) {
        assert.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')
        var tokenData = mockDB.createSessionToken.getCall(0).args[0]
        assert.ok(!tokenData.mustVerify, 'sessionToken was created verified')
        assert.ok(!tokenData.tokenVerificationId, 'sessionToken was created verified')
        assert.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 1, 'mailer.sendNewDeviceLoginNotification was called')
        assert.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
        assert.ok(response.verified, 'response indicates account is verified')
        assert.ok(!response.verificationMethod, 'verificationMethod doesn\'t exist')
        assert.ok(!response.verificationReason, 'verificationReason doesn\'t exist')
      }).then(function () {
        mockMailer.sendNewDeviceLoginNotification.reset()
        mockDB.createSessionToken.reset()
      })
    })

    it('off for unsupported client', function () {
      config.signinConfirmation.supportedClients = [ 'fx_desktop_v999' ]

      return runTest(route, mockRequest, function (response) {
        assert.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')
        var tokenData = mockDB.createSessionToken.getCall(0).args[0]
        assert.ok(!tokenData.mustVerify, 'sessionToken was created verified')
        assert.ok(!tokenData.tokenVerificationId, 'sessionToken was created verified')
        assert.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 1, 'mailer.sendNewDeviceLoginNotification was called')
        assert.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
        assert.ok(response.verified, 'response indicates account is verified')
        assert.ok(!response.verificationMethod, 'verificationMethod doesn\'t exist')
        assert.ok(!response.verificationReason, 'verificationReason doesn\'t exist')
      }).then(function () {
        mockMailer.sendNewDeviceLoginNotification.reset()
        mockDB.createSessionToken.reset()
      })
    })

    it('on for suspicious requests', function () {
      mockRequest.payload.email = 'dodgy@mcdodgeface.com'
      mockRequest.app.isSuspiciousRequest = true
      mockDB.emailRecord = function () {
        return P.resolve({
          authSalt: crypto.randomBytes(32),
          data: crypto.randomBytes(32),
          email: 'dodgy@mcdodgeface.com',
          emailVerified: true,
          kA: crypto.randomBytes(32),
          lastAuthAt: function () {
            return Date.now()
          },
          uid: uid,
          wrapWrapKb: crypto.randomBytes(32)
        })
      }

      return runTest(route, mockRequest, function (response) {
        assert.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')
        var tokenData = mockDB.createSessionToken.getCall(0).args[0]
        assert.ok(tokenData.mustVerify, 'sessionToken must be verified before use')
        assert.ok(tokenData.tokenVerificationId, 'sessionToken was created unverified')
        assert.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        assert.equal(mockMailer.sendVerifyLoginEmail.callCount, 1, 'mailer.sendVerifyLoginEmail was called')
        assert.ok(!response.verified, 'response indicates account is not verified')
        assert.equal(response.verificationMethod, 'email', 'verificationMethod is email')
        assert.equal(response.verificationReason, 'login', 'verificationReason is login')
      }).then(function () {
        mockMailer.sendVerifyLoginEmail.reset()
        mockDB.createSessionToken.reset()
        delete mockRequest.app.isSuspiciousRequest
      })
    })

    it('unverified account gets account confirmation email', function () {
      config.signinConfirmation.supportedClients = [ 'fx_desktop_v3' ]
      mockRequest.payload.email = 'test@mozilla.com'
      mockDB.emailRecord = function () {
        return P.resolve({
          authSalt: crypto.randomBytes(32),
          data: crypto.randomBytes(32),
          email: mockRequest.payload.email,
          emailVerified: false,
          kA: crypto.randomBytes(32),
          lastAuthAt: function () {
            return Date.now()
          },
          uid: uid,
          wrapWrapKb: crypto.randomBytes(32)
        })
      }

      return runTest(route, mockRequest, function (response) {
        assert.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')
        var tokenData = mockDB.createSessionToken.getCall(0).args[0]
        assert.ok(tokenData.mustVerify, 'sessionToken must be verified before use')
        assert.ok(tokenData.tokenVerificationId, 'sessionToken was created unverified')
        assert.equal(mockMailer.sendVerifyCode.callCount, 1, 'mailer.sendVerifyCode was called')
        assert.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        assert.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
        assert.ok(!response.verified, 'response indicates account is not verified')
        assert.equal(response.verificationMethod, 'email', 'verificationMethod is email')
        assert.equal(response.verificationReason, 'signup', 'verificationReason is signup')
      }).then(function () {
        mockMailer.sendVerifyCode.reset()
        mockDB.createSessionToken.reset()
      })
    })

    describe('sign-in with unverified account', function () {
      before(() => {
        mockDB.emailRecord = function () {
          return P.resolve({
            authSalt: crypto.randomBytes(32),
            data: crypto.randomBytes(32),
            email: 'test@mozilla.com',
            emailVerified: false,
            kA: crypto.randomBytes(32),
            lastAuthAt: function () {
              return Date.now()
            },
            uid: uid,
            wrapWrapKb: crypto.randomBytes(32)
          })
        }
      })

      it('sends verify account email', function () {
        return runTest(route, mockRequest, function (response) {
          assert.equal(mockMailer.sendVerifyCode.callCount, 1, 'mailer.sendVerifyCode was called')
          assert.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
          assert.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
          assert.equal(response.verified, false, 'response indicates account is unverified')
          assert.equal(response.verificationMethod, 'email', 'verificationMethod is email')
          assert.equal(response.verificationReason, 'signup', 'verificationReason is signup')
          assert.equal(response.emailSent, true, 'email not sent')
        }).then(function () {
          mockMailer.sendVerifyCode.reset()
        })
      })
    })
  })

  it('creating too many sessions causes an error to be logged', function () {
    mockDB.emailRecord = defaultEmailRecord
    mockDB.emailRecord.reset()
    const oldSessions = mockDB.sessions
    mockDB.sessions = sinon.spy(function () {
      return P.resolve(new Array(200))
    })
    mockLog.error = sinon.spy()
    mockRequest.app.clientAddress = '63.245.221.32'
    return runTest(route, mockRequest, function () {
      assert.equal(mockLog.error.callCount, 0, 'log.error was not called')
    }).then(function () {
      mockDB.sessions = sinon.spy(function () {
        return P.resolve(new Array(201))
      })
      mockLog.error.reset()
      return runTest(route, mockRequest, function () {
        assert.equal(mockLog.error.callCount, 1, 'log.error was called')
        assert.equal(mockLog.error.firstCall.args[0].op, 'Account.login')
        assert.equal(mockLog.error.firstCall.args[0].numSessions, 201)
        mockDB.sessions = oldSessions
      })
    })
  })

  describe('checks security history', function () {
    var record
    var clientAddress = mockRequest.app.clientAddress
    before(() => {
      mockLog.info = sinon.spy(function (arg) {
        if (arg.op.indexOf('Account.history') === 0) {
          record = arg
        }
      })
    })

    it('with a seen ip address', function () {
      record = undefined
      var securityQuery
      mockDB.securityEvents = sinon.spy(function (arg) {
        securityQuery = arg
        return P.resolve([
          {
            name: 'account.login',
            createdAt: Date.now(),
            verified: true
          }
        ])
      })
      return runTest(route, mockRequest, function (response) {
        assert.equal(mockDB.securityEvents.callCount, 1, 'db.securityEvents was called')
        assert.equal(securityQuery.uid, uid)
        assert.equal(securityQuery.ipAddr, clientAddress)

        assert.equal(!!record, true, 'log.info was called for Account.history')
        assert.equal(record.op, 'Account.history.verified')
        assert.equal(record.uid, uid.toString('hex'))
        assert.equal(record.events, 1)
        assert.equal(record.recency, 'day')
      })
    })

    it('with a seen, unverified ip address', function () {
      record = undefined
      var securityQuery
      mockDB.securityEvents = sinon.spy(function (arg) {
        securityQuery = arg
        return P.resolve([
          {
            name: 'account.login',
            createdAt: Date.now(),
            verified: false
          }
        ])
      })
      return runTest(route, mockRequest, function (response) {
        assert.equal(mockDB.securityEvents.callCount, 1, 'db.securityEvents was called')
        assert.equal(securityQuery.uid, uid)
        assert.equal(securityQuery.ipAddr, clientAddress)

        assert.equal(!!record, true, 'log.info was called for Account.history')
        assert.equal(record.op, 'Account.history.unverified')
        assert.equal(record.uid, uid.toString('hex'))
        assert.equal(record.events, 1)
      })
    })

    it('with a new ip address', function () {
      record = undefined

      var securityQuery
      mockDB.securityEvents = sinon.spy(function (arg) {
        securityQuery = arg
        return P.resolve([])
      })
      return runTest(route, mockRequest, function (response) {
        assert.equal(mockDB.securityEvents.callCount, 1, 'db.securityEvents was called')
        assert.equal(securityQuery.uid, uid)
        assert.equal(securityQuery.ipAddr, clientAddress)

        assert.equal(record, undefined, 'log.info was not called for Account.history.verified')
      })
    })
  })

  it('records security event', function () {
    var clientAddress = mockRequest.app.clientAddress
    var securityQuery
    mockDB.securityEvent = sinon.spy(function (arg) {
      securityQuery = arg
      return P.resolve()
    })
    return runTest(route, mockRequest, function (response) {
      assert.equal(mockDB.securityEvent.callCount, 1, 'db.securityEvent was called')
      assert.equal(securityQuery.uid, uid)
      assert.equal(securityQuery.ipAddr, clientAddress)
      assert.equal(securityQuery.name, 'account.login')
    })
  })

  describe('blocked by customs', () => {

    describe('can unblock', () => {
      const oldCheck = mockCustoms.check

      before(() => {
        mockCustoms.check = () => P.reject(error.requestBlocked(true))
      })

      after(() => {
        mockCustoms.check = oldCheck
      })

      it('signin unblock disabled', () => {
        config.signinUnblock.enabled = false
        mockLog.flowEvent.reset()
        return runTest(route, mockRequest).then(() => assert.ok(false), err => {
          assert.equal(err.errno, error.ERRNO.REQUEST_BLOCKED, 'correct errno is returned')
          assert.equal(err.output.statusCode, 400, 'correct status code is returned')
          assert.equal(err.output.payload.verificationMethod, undefined, 'no verificationMethod')
          assert.equal(err.output.payload.verificationReason, undefined, 'no verificationReason')
          assert.equal(mockLog.flowEvent.callCount, 1, 'log.flowEvent called once')
          assert.equal(mockLog.flowEvent.args[0][0], 'account.login.blocked', 'first event is blocked')

          mockLog.flowEvent.reset()
        })
      })

      describe('signin unblock enabled', () => {
        before(() => {
          config.signinUnblock.enabled = true
          mockLog.flowEvent.reset()
        })

        it('without unblock code', () => {
          return runTest(route, mockRequest).then(() => assert.ok(false), err => {
            assert.equal(err.errno, error.ERRNO.REQUEST_BLOCKED, 'correct errno is returned')
            assert.equal(err.output.statusCode, 400, 'correct status code is returned')
            assert.equal(err.output.payload.verificationMethod, 'email-captcha')
            assert.equal(err.output.payload.verificationReason, 'login')
            assert.equal(mockLog.flowEvent.callCount, 1, 'log.flowEvent called once')
            assert.equal(mockLog.flowEvent.args[0][0], 'account.login.blocked', 'first event is blocked')
            mockLog.flowEvent.reset()
          })
        })

        describe('with unblock code', () => {
          mockLog.flowEvent.reset()

          it('invalid code', () => {
            mockDB.consumeUnblockCode = () => P.reject(error.invalidUnblockCode())
            return runTest(route, mockRequestWithUnblockCode).then(() => assert.ok(false), err => {
              assert.equal(err.errno, error.ERRNO.INVALID_UNBLOCK_CODE, 'correct errno is returned')
              assert.equal(err.output.statusCode, 400, 'correct status code is returned')
              assert.equal(mockLog.flowEvent.callCount, 2, 'log.flowEvent called twice')
              assert.equal(mockLog.flowEvent.args[1][0], 'account.login.invalidUnblockCode', 'second event is invalid')

              mockLog.flowEvent.reset()
            })
          })

          it('expired code', () => {
            mockDB.consumeUnblockCode = () => P.resolve({ createdAt: Date.now() - config.signinUnblock.codeLifetime - 1 })
            return runTest(route, mockRequestWithUnblockCode).then(() => assert.ok(false), err => {
              assert.equal(err.errno, error.ERRNO.INVALID_UNBLOCK_CODE, 'correct errno is returned')
              assert.equal(err.output.statusCode, 400, 'correct status code is returned')

              assert.equal(mockLog.flowEvent.callCount, 2, 'log.flowEvent called twice')
              assert.equal(mockLog.flowEvent.args[1][0], 'account.login.invalidUnblockCode', 'second event is invalid')

              mockLog.activityEvent.reset()
              mockLog.flowEvent.reset()
            })
          })

          it('valid code', () => {
            mockDB.consumeUnblockCode = () => P.resolve({ createdAt: Date.now() })
            return runTest(route, mockRequestWithUnblockCode, (res) => {
              assert.equal(mockLog.flowEvent.callCount, 4)
              assert.equal(mockLog.flowEvent.args[0][0], 'account.login.blocked', 'first event was account.login.blocked')
              assert.equal(mockLog.flowEvent.args[1][0], 'account.login.confirmedUnblockCode', 'second event was account.login.confirmedUnblockCode')
              assert.equal(mockLog.flowEvent.args[2][0], 'account.login', 'third event was account.login')
            })
          })
        })
      })
    })

    describe('cannot unblock', () => {
      const oldCheck = mockCustoms.check
      before(() => {
        mockCustoms.check = () => P.reject(error.requestBlocked(false))
        config.signinUnblock.enabled = true
      })

      after(() => {
        mockCustoms.check = oldCheck
      })

      it('without an unblock code', () => {
        return runTest(route, mockRequest).then(() => assert.ok(false), err => {
          assert.equal(err.errno, error.ERRNO.REQUEST_BLOCKED, 'correct errno is returned')
          assert.equal(err.output.statusCode, 400, 'correct status code is returned')
          assert.equal(err.output.payload.verificationMethod, undefined, 'no verificationMethod')
          assert.equal(err.output.payload.verificationReason, undefined, 'no verificationReason')
        })
      })

      it('with unblock code', () => {
        return runTest(route, mockRequestWithUnblockCode).then(() => assert.ok(false), err => {
          assert.equal(err.errno, error.ERRNO.REQUEST_BLOCKED, 'correct errno is returned')
          assert.equal(err.output.statusCode, 400, 'correct status code is returned')
          assert.equal(err.output.payload.verificationMethod, undefined, 'no verificationMethod')
          assert.equal(err.output.payload.verificationReason, undefined, 'no verificationReason')
        })
      })
    })
  })
})

describe('/recovery_email/verify_code', function () {
  var uid = uuid.v4('binary').toString('hex')
  const mockLog = mocks.spyLog()
  const mockRequest = mocks.mockRequest({
    log: mockLog,
    query: {},
    payload: {
      uid: uid,
      code: 'e3c5b0e3f5391e134596c27519979b93',
      service: 'sync'
    }
  })
  var dbData = {
    email: TEST_EMAIL,
    emailCode: Buffer(mockRequest.payload.code, 'hex'),
    emailVerified: false,
    uid: uid
  }
  var dbErrors = {
    verifyTokens: error.invalidVerificationCode({})
  }
  var mockDB = mocks.mockDB(dbData, dbErrors)
  var mockMailer = mocks.mockMailer()
  const mockPush = mocks.mockPush()
  var mockCustoms = mocks.mockCustoms()
  var accountRoutes = makeRoutes({
    checkPassword: function () {
      return P.resolve(true)
    },
    config: {},
    customs: mockCustoms,
    db: mockDB,
    log: mockLog,
    mailer: mockMailer,
    push: mockPush
  })
  var route = getRoute(accountRoutes, '/recovery_email/verify_code')
  describe('verifyTokens rejects with INVALID_VERIFICATION_CODE', function () {

    it('without a reminder payload', function () {
      return runTest(route, mockRequest, function (response) {
        assert.equal(mockDB.verifyTokens.callCount, 1, 'calls verifyTokens')
        assert.equal(mockDB.verifyEmail.callCount, 1, 'calls verifyEmail')
        assert.equal(mockCustoms.check.callCount, 1, 'calls customs.check')
        assert.equal(mockLog.notifyAttachedServices.callCount, 1, 'logs verified')

        assert.equal(mockMailer.sendPostVerifyEmail.callCount, 1, 'sendPostVerifyEmail was called once')

        assert.equal(mockLog.activityEvent.callCount, 1, 'activityEvent was called once')
        let args = mockLog.activityEvent.args[0]
        assert.equal(args.length, 3, 'activityEvent was passed three arguments')
        assert.equal(args[0], 'account.verified', 'first argument was event name')
        assert.equal(args[1], mockRequest, 'second argument was request object')
        assert.deepEqual(args[2], { uid: uid }, 'third argument contained uid')

        assert.equal(mockLog.flowEvent.callCount, 2, 'flowEvent was called twice')
        assert.equal(mockLog.flowEvent.args[0][0], 'email.verify_code.clicked', 'first event was clicked')
        args = mockLog.flowEvent.args[1]
        assert.equal(args.length, 2, 'flowEvent was passed two arguments')
        assert.equal(args[0], 'account.verified', 'first argument was event name')
        assert.equal(args[1], mockRequest, 'second argument was request object')

        assert.equal(mockPush.notifyUpdate.callCount, 1, 'mockPush.notifyUpdate should have been called once')
        args = mockPush.notifyUpdate.args[0]
        assert.equal(args.length, 2, 'mockPush.notifyUpdate should have been passed two arguments')
        assert.equal(args[0].toString('hex'), uid, 'first argument should have been uid')
        assert.equal(args[1], 'accountVerify', 'second argument should have been reason')

        assert.equal(JSON.stringify(response), '{}')
      })
      .then(function () {
        mockDB.verifyTokens.reset()
        mockDB.verifyEmail.reset()
        mockLog.activityEvent.reset()
        mockLog.flowEvent.reset()
        mockLog.notifyAttachedServices.reset()
        mockMailer.sendPostVerifyEmail.reset()
        mockPush.notifyUpdate.reset()
      })
    })

    it('with a reminder payload', function () {
      mockRequest.payload.reminder = 'second'

      return runTest(route, mockRequest, function (response) {
        assert.equal(mockLog.activityEvent.callCount, 1, 'activityEvent was called once')

        assert.equal(mockLog.flowEvent.callCount, 3, 'flowEvent was called thrice')
        assert.equal(mockLog.flowEvent.args[0][0], 'email.verify_code.clicked', 'first event was clicked')
        assert.equal(mockLog.flowEvent.args[1][0], 'account.verified', 'second event was account.verified')
        const args = mockLog.flowEvent.args[2]
        assert.equal(args.length, 2, 'flowEvent was passed two arguments')
        assert.equal(args[0], 'account.reminder', 'third event was account.reminder')
        assert.equal(args[1], mockRequest, 'second argument was request object')

        assert.equal(mockMailer.sendPostVerifyEmail.callCount, 1, 'sendPostVerifyEmail was called once')
        assert.equal(mockPush.notifyUpdate.callCount, 1, 'mockPush.notifyUpdate should have been called once')

        assert.equal(JSON.stringify(response), '{}')
      })
      .then(function () {
        mockDB.verifyTokens.reset()
        mockDB.verifyEmail.reset()
        mockLog.activityEvent.reset()
        mockLog.flowEvent.reset()
        mockLog.notifyAttachedServices.reset()
        mockMailer.sendPostVerifyEmail.reset()
        mockPush.notifyUpdate.reset()
      })
    })
  })

  describe('verifyTokens resolves', function () {

    before(() => {
      dbData.emailVerified = true
      dbErrors.verifyTokens = undefined
    })

    it('email verification', function () {
      return runTest(route, mockRequest, function (response) {
        assert.equal(mockDB.verifyTokens.callCount, 1, 'call db.verifyTokens')
        assert.equal(mockDB.verifyEmail.callCount, 0, 'does not call db.verifyEmail')
        assert.equal(mockLog.notifyAttachedServices.callCount, 0, 'does not call log.notifyAttachedServices')
        assert.equal(mockLog.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(mockPush.notifyUpdate.callCount, 0, 'mockPush.notifyUpdate should not have been called')
      })
      .then(function () {
        mockDB.verifyTokens.reset()
      })
    })

    it('sign-in confirmation', function () {
      dbData.emailCode = crypto.randomBytes(16)

      return runTest(route, mockRequest, function (response) {
        assert.equal(mockDB.verifyTokens.callCount, 1, 'call db.verifyTokens')
        assert.equal(mockDB.verifyEmail.callCount, 0, 'does not call db.verifyEmail')
        assert.equal(mockLog.notifyAttachedServices.callCount, 0, 'does not call log.notifyAttachedServices')

        assert.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
        var args = mockLog.activityEvent.args[0]
        assert.equal(args.length, 3, 'log.activityEvent was passed three arguments')
        assert.equal(args[0], 'account.confirmed', 'first argument was event name')
        assert.equal(args[1], mockRequest, 'second argument was request object')
        assert.deepEqual(args[2], { uid: uid }, 'third argument contained uid')

        assert.equal(mockPush.notifyUpdate.callCount, 1, 'mockPush.notifyUpdate should have been called once')
        args = mockPush.notifyUpdate.args[0]
        assert.equal(args.length, 2, 'mockPush.notifyUpdate should have been passed two arguments')
        assert.equal(args[0].toString('hex'), uid, 'first argument should have been uid')
        assert.equal(args[1], 'accountConfirm', 'second argument should have been reason')
      })
      .then(function () {
        mockDB.verifyTokens.reset()
        mockLog.activityEvent.reset()
        mockPush.notifyUpdate.reset()
      })
    })
  })
})

describe('/account/keys', function () {
  var keyFetchTokenId = crypto.randomBytes(16)
  var uid = uuid.v4('binary')
  const mockLog = mocks.spyLog()
  const mockRequest = mocks.mockRequest({
    credentials: {
      emailVerified: true,
      id: keyFetchTokenId.toString('hex'),
      keyBundle: crypto.randomBytes(16),
      tokenId: keyFetchTokenId,
      tokenVerificationId: undefined,
      tokenVerified: true,
      uid: uid
    },
    log: mockLog
  })
  var mockDB = mocks.mockDB()
  var accountRoutes = makeRoutes({
    db: mockDB,
    log: mockLog
  })
  var route = getRoute(accountRoutes, '/account/keys')

  it('verified token', function () {
    return runTest(route, mockRequest, function (response) {
      assert.deepEqual(response, {bundle: mockRequest.auth.credentials.keyBundle.toString('hex')}, 'response was correct')

      assert.equal(mockDB.deleteKeyFetchToken.callCount, 1, 'db.deleteKeyFetchToken was called once')
      var args = mockDB.deleteKeyFetchToken.args[0]
      assert.equal(args.length, 1, 'db.deleteKeyFetchToken was passed one argument')
      assert.equal(args[0], mockRequest.auth.credentials, 'db.deleteKeyFetchToken was passed key fetch token')

      assert.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
      args = mockLog.activityEvent.args[0]
      assert.equal(args.length, 3, 'log.activityEvent was passed three arguments')
      assert.equal(args[0], 'account.keyfetch', 'first argument was event name')
      assert.equal(args[1], mockRequest, 'second argument was request object')
      assert.deepEqual(args[2], {uid: uid.toString('hex')}, 'third argument contained uid')
    })
      .then(function () {
        mockLog.activityEvent.reset()
        mockDB.deleteKeyFetchToken.reset()
      })
  })

  it('unverified token', function () {
    mockRequest.auth.credentials.tokenVerificationId = crypto.randomBytes(16)
    mockRequest.auth.credentials.tokenVerified = false
    return runTest(route, mockRequest).then(() => assert.ok(false), response => {
      assert.equal(response.errno, 104, 'correct errno for unverified account')
      assert.equal(response.message, 'Unverified account', 'correct error message')
    })
      .then(function () {
        mockLog.activityEvent.reset()
      })
  })
})

describe('/account/destroy', function () {
  it('should delete the account', () => {
    var email = 'foo@example.com'
    var uid = uuid.v4('binary')
    var mockDB = mocks.mockDB({
      email: email,
      uid: uid
    })
    const mockLog = mocks.spyLog()
    const mockRequest = mocks.mockRequest({
      log: mockLog,
      payload: {
        email: email,
        authPW: new Array(65).join('f')
      }
    })
    var accountRoutes = makeRoutes({
      checkPassword: function () {
        return P.resolve(true)
      },
      config: {
        domain: 'wibble'
      },
      db: mockDB,
      log: mockLog
    })
    var route = getRoute(accountRoutes, '/account/destroy')

    return runTest(route, mockRequest, function () {
      assert.equal(mockDB.emailRecord.callCount, 1, 'db.emailRecord was called once')
      var args = mockDB.emailRecord.args[0]
      assert.equal(args.length, 2, 'db.emailRecord was passed two arguments')
      assert.equal(args[0], email, 'first argument was email address')
      assert.equal(args[1], true, 'second argument was customs.check result')

      assert.equal(mockDB.deleteAccount.callCount, 1, 'db.deleteAccount was called once')
      args = mockDB.deleteAccount.args[0]
      assert.equal(args.length, 1, 'db.deleteAccount was passed one argument')
      assert.equal(args[0].email, email, 'db.deleteAccount was passed email record')
      assert.deepEqual(args[0].uid, uid, 'email record had correct uid')

      assert.equal(mockLog.notifyAttachedServices.callCount, 1, 'log.notifyAttachedServices was called once')
      args = mockLog.notifyAttachedServices.args[0]
      assert.equal(args.length, 3, 'log.notifyAttachedServices was passed three arguments')
      assert.equal(args[0], 'delete', 'first argument was event name')
      assert.equal(args[1], mockRequest, 'second argument was request object')
      assert.equal(args[2].uid, uid.toString('hex') + '@wibble', 'third argument was event data')

      assert.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
      args = mockLog.activityEvent.args[0]
      assert.equal(args.length, 3, 'log.activityEvent was passed three arguments')
      assert.equal(args[0], 'account.deleted', 'first argument was event name')
      assert.equal(args[1], mockRequest, 'second argument was request object')
      assert.equal(args[2].uid, uid.toString('hex'), 'third argument was event data')
    })
  })
})

describe('/account/devices', function () {
  it('should return the devices list', () => {
    var mockRequest = mocks.mockRequest({
      credentials: {
        uid: crypto.randomBytes(16),
        tokenId: crypto.randomBytes(16)
      },
      payload: {}
    })
    var unnamedDevice = { sessionToken: crypto.randomBytes(16) }
    var mockDB = mocks.mockDB({
      devices: [
        { name: 'current session', type: 'mobile', sessionToken: mockRequest.auth.credentials.tokenId },
        { name: 'has no type', sessionToken: crypto.randomBytes(16) },
        { name: 'has device type', sessionToken: crypto.randomBytes(16), uaDeviceType: 'wibble' },
        unnamedDevice
      ]
    })
    var mockDevices = mocks.mockDevices()
    var accountRoutes = makeRoutes({
      db: mockDB,
      devices: mockDevices
    })
    var route = getRoute(accountRoutes, '/account/devices')

    return runTest(route, mockRequest, function (response) {
      assert.ok(Array.isArray(response), 'response is array')
      assert.equal(response.length, 4, 'response contains 4 items')

      assert.equal(response[0].name, 'current session')
      assert.equal(response[0].type, 'mobile')
      assert.equal(response[0].sessionToken, undefined)
      assert.equal(response[0].isCurrentDevice, true)

      assert.equal(response[1].name, 'has no type')
      assert.equal(response[1].type, 'desktop')
      assert.equal(response[1].sessionToken, undefined)
      assert.equal(response[1].isCurrentDevice, false)

      assert.equal(response[2].name, 'has device type')
      assert.equal(response[2].type, 'wibble')
      assert.equal(response[2].isCurrentDevice, false)

      assert.equal(response[3].name, null)

      assert.equal(mockDB.devices.callCount, 1, 'db.devices was called once')
      assert.equal(mockDB.devices.args[0].length, 1, 'db.devices was passed one argument')
      assert.deepEqual(mockDB.devices.args[0][0], mockRequest.auth.credentials.uid, 'db.devices was passed uid')

      assert.equal(mockDevices.synthesizeName.callCount, 1, 'mockDevices.synthesizeName was called once')
      assert.equal(mockDevices.synthesizeName.args[0].length, 1, 'mockDevices.synthesizeName was passed one argument')
      assert.equal(mockDevices.synthesizeName.args[0][0], unnamedDevice, 'mockDevices.synthesizeName was passed unnamed device')
    })
  })
})

describe('/account/login/send_unblock_code', function () {
  var uid = uuid.v4('binary').toString('hex')
  const mockLog = mocks.spyLog()
  var mockRequest = mocks.mockRequest({
    log: mockLog,
    payload: {
      email: TEST_EMAIL,
      metricsContext: {
        context: 'fx_desktop_v3',
        flowBeginTime: Date.now(),
        flowId: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
        entrypoint: 'preferences',
        utmContent: 'some-content-string'
      }
    }
  })
  var mockMailer = mocks.mockMailer()
  var mockDb = mocks.mockDB({
    uid: uid,
    email: TEST_EMAIL
  })
  var config = {
    signinUnblock: {
      allowedEmailAddresses: /^.*$/
    }
  }
  var accountRoutes = makeRoutes({
    config: config,
    db: mockDb,
    log: mockLog,
    mailer: mockMailer
  })
  var route = getRoute(accountRoutes, '/account/login/send_unblock_code')

  it('signin unblock enabled', function () {
    config.signinUnblock.enabled = true
    return runTest(route, mockRequest, function (response) {
      assert.ok(!(response instanceof Error), response.stack)
      assert.deepEqual(response, {}, 'response has no keys')

      assert.equal(mockDb.emailRecord.callCount, 1, 'db.emailRecord called')
      assert.equal(mockDb.emailRecord.args[0][0], TEST_EMAIL)

      assert.equal(mockDb.createUnblockCode.callCount, 1, 'db.createUnblockCode called')
      var dbArgs = mockDb.createUnblockCode.args[0]
      assert.equal(dbArgs.length, 1)
      assert.equal(dbArgs[0], uid)

      assert.equal(mockMailer.sendUnblockCode.callCount, 1, 'called mailer.sendUnblockCode')
      var args = mockMailer.sendUnblockCode.args[0]
      assert.equal(args.length, 3, 'mailer.sendUnblockCode called with 3 args')

      assert.equal(mockLog.flowEvent.callCount, 1, 'log.flowEvent was called once')
      args = mockLog.flowEvent.args[0]
      assert.equal(args.length, 2, 'log.flowEvent was passed two arguments')
      assert.equal(args[0], 'account.login.sentUnblockCode', 'first argument was event name')
      mockLog.flowEvent.reset()
    })
  })

  it('signin unblock disabled', function () {
    config.signinUnblock.enabled = false

    return runTest(route, mockRequest).then(() => assert.ok(false), err => {
      assert.equal(err.output.statusCode, 503, 'correct status code is returned')
      assert.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED, 'correct errno is returned')

      assert.equal(mockLog.flowEvent.callCount, 0, 'log.flowEvent was not called')
    })
  })
})

describe('/account/login/reject_unblock_code', function () {
  it('should consume the unblock code', () => {
    var uid = uuid.v4('binary').toString('hex')
    var unblockCode = 'A1B2C3D4'
    var mockRequest = mocks.mockRequest({
      payload: {
        uid: uid,
        unblockCode: unblockCode
      }
    })
    var mockDb = mocks.mockDB()
    var accountRoutes = makeRoutes({
      db: mockDb
    })
    var route = getRoute(accountRoutes, '/account/login/reject_unblock_code')

    return runTest(route, mockRequest, function (response) {
      assert.ok(!(response instanceof Error), response.stack)
      assert.deepEqual(response, {}, 'response has no keys')

      assert.equal(mockDb.consumeUnblockCode.callCount, 1, 'consumeUnblockCode is called')
      var args = mockDb.consumeUnblockCode.args[0]
      assert.equal(args.length, 2)
      assert.equal(args[0].toString('hex'), uid)
      assert.equal(args[1], unblockCode)
    })
  })
})
