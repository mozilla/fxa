/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var sinon = require('sinon')

var test = require('tap').test
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
    crypto,
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
  return new P(function (resolve) {
    route.handler(request, function (response) {
      resolve(response)
    })
  })
  .then(assertions)
}

test('/recovery_email/status', function (t) {
  t.plan(2)
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

  t.test('sign-in confirmation disabled', function (t) {
    t.plan(2)
    config.signinConfirmation.enabled = false

    t.test('invalid email', function (t) {
      t.plan(2)
      var mockRequest = mocks.mockRequest({
        credentials: {
          email: TEST_EMAIL_INVALID
        }
      })

      t.test('unverified account', function (t) {
        mockRequest.auth.credentials.emailVerified = false

        return runTest(route, mockRequest, function (response) {
          t.equal(mockDB.deleteAccount.callCount, 1)
          t.equal(mockDB.deleteAccount.firstCall.args[0].email, TEST_EMAIL_INVALID)
          t.equal(response.errno, error.ERRNO.INVALID_TOKEN)
        })
        .then(function () {
          mockDB.deleteAccount.reset()
        })
      })

      t.test('verified account', function (t) {
        mockRequest.auth.credentials.uid = uuid.v4('binary').toString('hex')
        mockRequest.auth.credentials.emailVerified = true
        mockRequest.auth.credentials.tokenVerified = true

        return runTest(route, mockRequest, function (response) {
          t.equal(mockDB.deleteAccount.callCount, 0)
          t.deepEqual(response, {
            email: TEST_EMAIL_INVALID,
            verified: true,
            emailVerified: true,
            sessionVerified: true
          })
        })
      })
    })

    t.test('valid email, verified account', function (t) {
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
        t.equal(pushCalled, true)

        t.deepEqual(response, {
          email: TEST_EMAIL,
          verified: true,
          emailVerified: true,
          sessionVerified: true
        })
      })
    })
  })

  t.test('sign-in confirmation enabled', function (t) {
    t.plan(3)
    config.signinConfirmation.enabled = true
    config.signinConfirmation.sample_rate = 1
    var mockRequest = mocks.mockRequest({
      credentials: {
        uid: uuid.v4('binary').toString('hex'),
        email: TEST_EMAIL
      }
    })

    t.test('verified account, verified session', function (t) {
      mockRequest.auth.credentials.emailVerified = true
      mockRequest.auth.credentials.tokenVerified = true

      return runTest(route, mockRequest, function (response) {
        t.deepEqual(response, {
          email: TEST_EMAIL,
          verified: true,
          sessionVerified: true,
          emailVerified: true
        })
      })
    })

    t.test('verified account, unverified session, must verify session', function (t) {
      mockRequest.auth.credentials.emailVerified = true
      mockRequest.auth.credentials.tokenVerified = false
      mockRequest.auth.credentials.mustVerify = true

      return runTest(route, mockRequest, function (response) {
        t.deepEqual(response, {
          email: TEST_EMAIL,
          verified: false,
          sessionVerified: false,
          emailVerified: true
        })
      })
    })

    t.test('verified account, unverified session, neednt verify session', function (t) {
      mockRequest.auth.credentials.emailVerified = true
      mockRequest.auth.credentials.tokenVerified = false
      mockRequest.auth.credentials.mustVerify = false

      return runTest(route, mockRequest, function (response) {
        t.deepEqual(response, {
          email: TEST_EMAIL,
          verified: true,
          sessionVerified: false,
          emailVerified: true
        })
      })
    })
  })
})

test('/account/reset', function (t) {
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
    t.equal(mockDB.resetAccount.callCount, 1)

    t.equal(mockPush.notifyPasswordReset.callCount, 1)
    t.equal(mockPush.notifyPasswordReset.firstCall.args[0], uid.toString('hex'))

    t.equal(mockDB.account.callCount, 1)
    t.equal(mockCustoms.reset.callCount, 1)

    t.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
    var args = mockLog.activityEvent.args[0]
    t.equal(args.length, 3, 'log.activityEvent was passed three arguments')
    t.equal(args[0], 'account.reset', 'first argument was event name')
    t.equal(args[1], mockRequest, 'second argument was request object')
    t.deepEqual(args[2], { uid: uid.toString('hex') }, 'third argument contained uid')

    t.equal(mockDB.securityEvent.callCount, 1, 'db.securityEvent was called')
    var securityEvent = mockDB.securityEvent.args[0][0]
    t.equal(securityEvent.uid, uid)
    t.equal(securityEvent.ipAddr, clientAddress)
    t.equal(securityEvent.name, 'account.reset')
  })
})

test('/account/device', function (t) {
  t.plan(4)
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

  t.test('identical data', function (t) {
    return runTest(route, mockRequest, function (response) {
      t.equal(mockLog.increment.callCount, 1, 'a counter was incremented')
      t.equal(mockLog.increment.firstCall.args[0], 'device.update.spurious')

      t.deepEqual(response, mockRequest.payload)
    })
    .then(function () {
      mockLog.increment.reset()
    })
  })

  t.test('different data', function (t) {
    mockRequest.auth.credentials.deviceId = crypto.randomBytes(16)
    var payload = mockRequest.payload
    payload.name = 'my even awesomer device'
    payload.type = 'phone'
    payload.pushCallback = 'https://push.services.mozilla.com/123456'
    payload.pushPublicKey = 'SomeEncodedBinaryStuffThatDoesntGetValidedByThisTest'

    return runTest(route, mockRequest, function (response) {
      t.equal(mockLog.increment.callCount, 5, 'the counters were incremented')
      t.equal(mockLog.increment.getCall(0).args[0], 'device.update.sessionToken')
      t.equal(mockLog.increment.getCall(1).args[0], 'device.update.name')
      t.equal(mockLog.increment.getCall(2).args[0], 'device.update.type')
      t.equal(mockLog.increment.getCall(3).args[0], 'device.update.pushCallback')
      t.equal(mockLog.increment.getCall(4).args[0], 'device.update.pushPublicKey')

      t.equal(mockDevices.upsert.callCount, 1, 'devices.upsert was called once')
      var args = mockDevices.upsert.args[0]
      t.equal(args.length, 3, 'devices.upsert was passed three arguments')
      t.equal(args[0], mockRequest, 'first argument was request object')
      t.deepEqual(args[1].tokenId, mockRequest.auth.credentials.tokenId, 'second argument was session token')
      t.deepEqual(args[1].uid, uid, 'sessionToken.uid was correct')
      t.deepEqual(args[2], mockRequest.payload, 'third argument was payload')
    })
    .then(function () {
      mockLog.increment.reset()
      mockDevices.upsert.reset()
    })
  })

  t.test('with no id in payload', function (t) {
    mockRequest.payload.id = undefined

    return runTest(route, mockRequest, function (response) {
      t.equal(mockLog.increment.callCount, 0, 'log.increment was not called')

      t.equal(mockDevices.upsert.callCount, 1, 'devices.upsert was called once')
      var args = mockDevices.upsert.args[0]
      t.equal(args[2].id, mockRequest.auth.credentials.deviceId.toString('hex'), 'payload.id defaulted to credentials.deviceId')
    })
    .then(function () {
      mockLog.increment.reset()
      mockDevices.upsert.reset()
    })
  }, t)

  t.test('device updates disabled', function (t) {
    config.deviceUpdatesEnabled = false

    return runTest(route, mockRequest, function () {
      t.fail('should have thrown')
    })
    .catch(function (err) {
      t.equal(err.output.statusCode, 503, 'correct status code is returned')
      t.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED, 'correct errno is returned')
    })
  })
})

test('/account/devices/notify', function (t) {
  t.plan(5)
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

  t.test('bad payload', function (t) {
    mockRequest.payload = {
      to: ['bogusid1'],
      payload: {
        isValid: false
      }
    }
    return runTest(route, mockRequest, function () {
      t.fail('should have thrown')
    })
    .catch(function (err) {
      t.equal(validate.callCount, 1, 'ajv validator function was called')
      t.equal(mockPush.pushToDevices.callCount, 0, 'mockPush.pushToDevices was not called')
      t.equal(err.errno, 107, 'Correct errno for invalid push payload')
    })
  })

  t.test('all devices', function (t) {
    mockRequest.payload = {
      to: 'all',
      excluded: ['bogusid'],
      TTL: 60,
      payload: pushPayload
    }
    return runTest(route, mockRequest, function (response) {
      t.equal(mockCustoms.checkAuthenticated.callCount, 1, 'mockCustoms.checkAuthenticated was called once')
      t.equal(mockPush.pushToAllDevices.callCount, 1, 'mockPush.pushToAllDevices was called once')
      var args = mockPush.pushToAllDevices.args[0]
      t.equal(args.length, 3, 'mockPush.pushToAllDevices was passed three arguments')
      t.equal(args[0], uid.toString('hex'), 'first argument was the device uid')
      t.equal(args[1], 'devicesNotify', 'second argument was the devicesNotify reason')
      t.deepEqual(args[2], {
        data: new Buffer(JSON.stringify(pushPayload)),
        excludedDeviceIds: ['bogusid'],
        TTL: 60
      }, 'third argument was the push options')
    })
  })

  t.test('specific devices', function (t) {
    mockCustoms.checkAuthenticated.reset()
    mockRequest.payload = {
      to: ['bogusid1', 'bogusid2'],
      TTL: 60,
      payload: pushPayload
    }
    return runTest(route, mockRequest, function (response) {
      t.equal(mockCustoms.checkAuthenticated.callCount, 1, 'mockCustoms.checkAuthenticated was called once')
      t.equal(mockPush.pushToDevices.callCount, 1, 'mockPush.pushToDevices was called once')
      var args = mockPush.pushToDevices.args[0]
      t.equal(args.length, 4, 'mockPush.pushToDevices was passed four arguments')
      t.equal(args[0], uid.toString('hex'), 'first argument was the device uid')
      t.deepEqual(args[1], ['bogusid1', 'bogusid2'], 'second argument was the list of device ids')
      t.equal(args[2], 'devicesNotify', 'third argument was the devicesNotify reason')
      t.deepEqual(args[3], {
        data: new Buffer(JSON.stringify(pushPayload)),
        TTL: 60
      }, 'fourth argument was the push options')
    })
  })

  t.test('device driven notifications disabled', function (t) {
    config.deviceNotificationsEnabled = false
    mockRequest.payload = {
      to: 'all',
      excluded: ['bogusid'],
      TTL: 60,
      payload: pushPayload
    }

    return runTest(route, mockRequest, function () {
      t.fail('should have thrown')
    })
    .catch(function (err) {
      t.equal(err.output.statusCode, 503, 'correct status code is returned')
      t.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED, 'correct errno is returned')
    })
  })

  t.test('throws error if customs blocked the request', function (t) {
    config.deviceNotificationsEnabled = true

    mockCustoms = mocks.mockCustoms({
      checkAuthenticated: sandbox.spy(function () {
        throw error.tooManyRequests(1)
      })
    })
    route = getRoute(makeRoutes({customs: mockCustoms}), '/account/devices/notify')

    return runTest(route, mockRequest, function (response) {
      t.fail('should have thrown')
    })
    .catch(function (err) {
      t.equal(mockCustoms.checkAuthenticated.callCount, 1, 'mockCustoms.checkAuthenticated was called once')
      t.equal(err.message, 'Client has sent too many requests')
    })
  })
})

test('/account/device/destroy', function (t) {
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
    t.equal(mockDB.deleteDevice.callCount, 1)

    t.equal(mockPush.notifyDeviceDisconnected.callCount, 1)
    t.equal(mockPush.notifyDeviceDisconnected.firstCall.args[0], mockRequest.auth.credentials.uid)
    t.equal(mockPush.notifyDeviceDisconnected.firstCall.args[1], deviceId)

    t.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
    var args = mockLog.activityEvent.args[0]
    t.equal(args.length, 3, 'log.activityEvent was passed three arguments')
    t.equal(args[0], 'device.deleted', 'first argument was event name')
    t.equal(args[1], mockRequest, 'second argument was request object')
    t.deepEqual(args[2], { uid: uid.toString('hex'), device_id: deviceId }, 'third argument contained uid and deviceId')

    t.equal(mockLog.notifyAttachedServices.callCount, 1)
    args = mockLog.notifyAttachedServices.args[0]
    t.equal(args.length, 3)
    t.equal(args[0], 'device:delete')
    t.equal(args[1], mockRequest)
    var details = args[2]
    t.equal(details.uid, uid.toString('hex'))
    t.equal(details.id, deviceId)
    t.ok(Date.now() - details.timestamp < 100)
  })
})

test('/account/create', function (t) {
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
    t.equal(mockDB.createAccount.callCount, 1, 'createAccount was called')

    t.equal(mockLog.stdout.write.callCount, 1, 'an sqs event was logged')
    var eventData = JSON.parse(mockLog.stdout.write.getCall(0).args[0])
    t.equal(eventData.event, 'login', 'it was a login event')
    t.equal(eventData.data.service, 'sync', 'it was for sync')
    t.equal(eventData.data.email, TEST_EMAIL, 'it was for the correct email')
    t.deepEqual(eventData.data.metricsContext, mockRequest.payload.metricsContext, 'it contained the correct metrics context metadata')

    t.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
    var args = mockLog.activityEvent.args[0]
    t.equal(args.length, 3, 'log.activityEvent was passed three arguments')
    t.equal(args[0], 'account.created', 'first argument was event name')
    t.equal(args[1], mockRequest, 'second argument was request object')
    t.deepEqual(args[2], { uid: uid.toString('hex') }, 'third argument contained uid')

    t.equal(mockMetricsContext.validate.callCount, 1, 'metricsContext.validate was called')
    t.equal(mockMetricsContext.validate.args[0].length, 0, 'validate was called without arguments')

    t.equal(mockMetricsContext.stash.callCount, 3, 'metricsContext.stash was called three times')

    args = mockMetricsContext.stash.args[0]
    t.equal(args.length, 1, 'metricsContext.stash was passed one argument first time')
    t.deepEqual(args[0].tokenId, sessionTokenId, 'argument was session token')
    t.deepEqual(args[0].uid, uid, 'sessionToken.uid was correct')
    t.equal(mockMetricsContext.stash.thisValues[0], mockRequest, 'this was request')

    args = mockMetricsContext.stash.args[1]
    t.equal(args.length, 1, 'metricsContext.stash was passed one argument second time')
    t.equal(args[0].id, emailCode.toString('hex'), 'argument was synthesized token')
    t.deepEqual(args[0].uid, uid, 'token.uid was correct')
    t.equal(mockMetricsContext.stash.thisValues[1], mockRequest, 'this was request')

    args = mockMetricsContext.stash.args[2]
    t.equal(args.length, 1, 'metricsContext.stash was passed one argument third time')
    t.deepEqual(args[0].tokenId, keyFetchTokenId, 'argument was key fetch token')
    t.deepEqual(args[0].uid, uid, 'keyFetchToken.uid was correct')
    t.equal(mockMetricsContext.stash.thisValues[2], mockRequest, 'this was request')

    var securityEvent = mockDB.securityEvent
    t.equal(securityEvent.callCount, 1, 'db.securityEvent is called')
    securityEvent = securityEvent.args[0][0]
    t.equal(securityEvent.name, 'account.create')
    t.equal(securityEvent.uid, uid)
    t.equal(securityEvent.ipAddr, clientAddress)
  }).finally(function () {
    mockLog.close()
  })
})

test('/account/login', function (t) {
  t.plan(6)
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
    check: () => P.resolve()
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

  t.test('sign-in confirmation disabled', function (t) {
    t.plan(2)
    t.test('sign-in does not require verification', function (t) {
      return runTest(route, mockRequest, function (response) {
        t.equal(mockDB.emailRecord.callCount, 1, 'db.emailRecord was called')
        t.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')
        var tokenData = mockDB.createSessionToken.getCall(0).args[0]
        t.notOk(tokenData.mustVerify, 'sessionToken was created verified')
        t.notOk(tokenData.tokenVerificationId, 'sessionToken was created verified')
        t.equal(mockDB.sessions.callCount, 1, 'db.sessions was called')

        t.equal(mockLog.stdout.write.callCount, 1, 'an sqs event was logged')
        var eventData = JSON.parse(mockLog.stdout.write.getCall(0).args[0])
        t.equal(eventData.event, 'login', 'it was a login event')
        t.equal(eventData.data.service, 'sync', 'it was for sync')
        t.equal(eventData.data.email, TEST_EMAIL, 'it was for the correct email')
        t.deepEqual(eventData.data.metricsContext, mockRequest.payload.metricsContext, 'it contained the metrics context')

        t.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
        let args = mockLog.activityEvent.args[0]
        t.equal(args.length, 3, 'log.activityEvent was passed three arguments')
        t.equal(args[0], 'account.login', 'first argument was event name')
        t.equal(args[1], mockRequest, 'second argument was request object')
        t.deepEqual(args[2], {uid: uid.toString('hex')}, 'third argument contained uid')

        t.equal(mockLog.flowEvent.callCount, 1, 'log.flowEvent was called once')
        args = mockLog.flowEvent.args[0]
        t.equal(args.length, 2, 'log.flowEvent was passed two arguments')
        t.equal(args[0], 'account.login', 'first argument was event name')
        t.equal(args[1], mockRequest, 'second argument was request object')

        t.equal(mockMetricsContext.validate.callCount, 1, 'metricsContext.validate was called')
        t.equal(mockMetricsContext.validate.args[0].length, 0, 'validate was called without arguments')

        t.equal(mockMetricsContext.stash.callCount, 2, 'metricsContext.stash was called twice')

        args = mockMetricsContext.stash.args[0]
        t.equal(args.length, 1, 'metricsContext.stash was passed one argument first time')
        t.deepEqual(args[0].tokenId, sessionTokenId, 'argument was session token')
        t.deepEqual(args[0].uid, uid, 'sessionToken.uid was correct')
        t.equal(mockMetricsContext.stash.thisValues[0], mockRequest, 'this was request')

        args = mockMetricsContext.stash.args[1]
        t.equal(args.length, 1, 'metricsContext.stash was passed one argument second time')
        t.deepEqual(args[0].tokenId, keyFetchTokenId, 'argument was key fetch token')
        t.deepEqual(args[0].uid, uid, 'keyFetchToken.uid was correct')
        t.equal(mockMetricsContext.stash.thisValues[1], mockRequest, 'this was request')

        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 1, 'mailer.sendNewDeviceLoginNotification was called')
        t.equal(mockMailer.sendNewDeviceLoginNotification.getCall(0).args[1].location.city, 'Mountain View')
        t.equal(mockMailer.sendNewDeviceLoginNotification.getCall(0).args[1].location.country, 'United States')
        t.equal(mockMailer.sendNewDeviceLoginNotification.getCall(0).args[1].timeZone, 'America/Los_Angeles')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
        t.ok(response.verified, 'response indicates account is verified')
        t.notOk(response.verificationMethod, 'verificationMethod doesn\'t exist')
        t.notOk(response.verificationReason, 'verificationReason doesn\'t exist')
      }).then(function () {
        mockLog.activityEvent.reset()
        mockLog.flowEvent.reset()
        mockMailer.sendNewDeviceLoginNotification.reset()
        mockDB.createSessionToken.reset()
        mockMetricsContext.stash.reset()
      })
    })

    t.test('sign-in unverified account', function (t) {
      t.plan(1)
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

      t.test('send\'s email code', function (t) {
        return runTest(route, mockRequest, function (response) {
          t.equal(mockMailer.sendVerifyCode.callCount, 1, 'mailer.sendVerifyCode was called')

          // Verify that the email code was sent
          var verifyCallArgs = mockMailer.sendVerifyCode.getCall(0).args
          t.equal(verifyCallArgs[1], emailCode, 'mailer.sendVerifyCode was called with emailCode')

          t.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
          t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
          t.equal(response.verified, false, 'response indicates account is unverified')
          t.equal(response.verificationMethod, 'email', 'verificationMethod is email')
          t.equal(response.verificationReason, 'signup', 'verificationReason is signup')
          t.equal(response.emailSent, true, 'email sent')
        }).then(function () {
          mockMailer.sendVerifyCode.reset()
          mockDB.createSessionToken.reset()
          mockMetricsContext.stash.reset()
        })
      })
    })
  })

  t.test('sign-in confirmation enabled', function (t) {
    t.plan(8)
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

    t.test('always on', function (t) {
      config.signinConfirmation.sample_rate = 1

      return runTest(route, mockRequest, function (response) {
        t.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')
        var tokenData = mockDB.createSessionToken.getCall(0).args[0]
        t.ok(tokenData.mustVerify, 'sessionToken must be verified before use')
        t.ok(tokenData.tokenVerificationId, 'sessionToken was created unverified')
        t.equal(mockMailer.sendVerifyCode.callCount, 0, 'mailer.sendVerifyCode was not called')
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        t.notOk(response.verified, 'response indicates account is not verified')
        t.equal(response.verificationMethod, 'email', 'verificationMethod is email')
        t.equal(response.verificationReason, 'login', 'verificationReason is login')

        t.equal(mockMetricsContext.stash.callCount, 3, 'metricsContext.stash was called three times')
        var args = mockMetricsContext.stash.args[1]
        t.equal(args.length, 1, 'metricsContext.stash was passed one argument second time')
        t.ok(/^[0-9a-f]{32}$/.test(args[0].id), 'argument was synthesized token')
        t.deepEqual(args[0].uid, uid, 'token.uid was correct')
        t.equal(mockMetricsContext.stash.thisValues[1], mockRequest, 'this was request')

        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 1, 'mailer.sendVerifyLoginEmail was called')
        t.equal(mockMailer.sendVerifyLoginEmail.getCall(0).args[2].location.city, 'Mountain View')
        t.equal(mockMailer.sendVerifyLoginEmail.getCall(0).args[2].location.country, 'United States')
        t.equal(mockMailer.sendVerifyLoginEmail.getCall(0).args[2].timeZone, 'America/Los_Angeles')
      }).then(function () {
        mockMailer.sendVerifyLoginEmail.reset()
        mockDB.createSessionToken.reset()
        mockMetricsContext.stash.reset()
      })
    })

    t.test('on for email regex match, keys requested', function (t) {
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
        t.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')
        var tokenData = mockDB.createSessionToken.getCall(0).args[0]
        t.ok(tokenData.mustVerify, 'sessionToken must be verified before use')
        t.ok(tokenData.tokenVerificationId, 'sessionToken was created unverified')
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 1, 'mailer.sendVerifyLoginEmail was called')
        t.notOk(response.verified, 'response indicates account is not verified')
        t.equal(response.verificationMethod, 'email', 'verificationMethod is email')
        t.equal(response.verificationReason, 'login', 'verificationReason is login')
      }).then(function () {
        mockMailer.sendVerifyLoginEmail.reset()
        mockDB.createSessionToken.reset()
      })
    })

    t.test('off for email regex match, keys not requested', function (t) {
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
        t.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')
        var tokenData = mockDB.createSessionToken.getCall(0).args[0]
        t.notOk(tokenData.mustVerify, 'sessionToken does not have to be verified')
        t.ok(tokenData.tokenVerificationId, 'sessionToken was created unverified')
        // Note that *neither* email is sent in this case,
        // since it can't have been a new device connection.
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
        t.ok(response.verified, 'response indicates account is verified')
        t.notOk(response.verificationMethod, 'verificationMethod doesn\'t exist')
        t.notOk(response.verificationReason, 'verificationReason doesn\'t exist')
      }).then(function () {
        mockDB.createSessionToken.reset()
      })
    })

    t.test('off for email regex mismatch', function (t) {
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
        t.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')
        var tokenData = mockDB.createSessionToken.getCall(0).args[0]
        t.notOk(tokenData.mustVerify, 'sessionToken was created verified')
        t.notOk(tokenData.tokenVerificationId, 'sessionToken was created verified')
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 1, 'mailer.sendNewDeviceLoginNotification was called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
        t.ok(response.verified, 'response indicates account is verified')
        t.notOk(response.verificationMethod, 'verificationMethod doesn\'t exist')
        t.notOk(response.verificationReason, 'verificationReason doesn\'t exist')
      }).then(function () {
        mockMailer.sendNewDeviceLoginNotification.reset()
        mockDB.createSessionToken.reset()
      })
    })

    t.test('off for unsupported client', function (t) {
      config.signinConfirmation.supportedClients = [ 'fx_desktop_v999' ]

      return runTest(route, mockRequest, function (response) {
        t.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')
        var tokenData = mockDB.createSessionToken.getCall(0).args[0]
        t.notOk(tokenData.mustVerify, 'sessionToken was created verified')
        t.notOk(tokenData.tokenVerificationId, 'sessionToken was created verified')
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 1, 'mailer.sendNewDeviceLoginNotification was called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
        t.ok(response.verified, 'response indicates account is verified')
        t.notOk(response.verificationMethod, 'verificationMethod doesn\'t exist')
        t.notOk(response.verificationReason, 'verificationReason doesn\'t exist')
      }).then(function () {
        mockMailer.sendNewDeviceLoginNotification.reset()
        mockDB.createSessionToken.reset()
      })
    }, t)

    t.test('on for suspicious requests', function (t) {
      mockRequest.payload.email = 'dodgy@mcdodgeface.com'
      mockRequest.app = { isSuspiciousRequest: true }
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
        t.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')
        var tokenData = mockDB.createSessionToken.getCall(0).args[0]
        t.ok(tokenData.mustVerify, 'sessionToken must be verified before use')
        t.ok(tokenData.tokenVerificationId, 'sessionToken was created unverified')
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 1, 'mailer.sendVerifyLoginEmail was called')
        t.notOk(response.verified, 'response indicates account is not verified')
        t.equal(response.verificationMethod, 'email', 'verificationMethod is email')
        t.equal(response.verificationReason, 'login', 'verificationReason is login')
      }).then(function () {
        mockMailer.sendVerifyLoginEmail.reset()
        mockDB.createSessionToken.reset()
      })
    })

    t.test('unverified account gets account confirmation email', function (t) {
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
        t.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')
        var tokenData = mockDB.createSessionToken.getCall(0).args[0]
        t.ok(tokenData.mustVerify, 'sessionToken must be verified before use')
        t.ok(tokenData.tokenVerificationId, 'sessionToken was created unverified')
        t.equal(mockMailer.sendVerifyCode.callCount, 1, 'mailer.sendVerifyCode was called')
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
        t.notOk(response.verified, 'response indicates account is not verified')
        t.equal(response.verificationMethod, 'email', 'verificationMethod is email')
        t.equal(response.verificationReason, 'signup', 'verificationReason is signup')
      }).then(function () {
        mockMailer.sendVerifyCode.reset()
        mockDB.createSessionToken.reset()
      })
    })

    t.test('sign-in with unverified account', function (t) {
      t.plan(1)
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

      t.test('send\'s verify account email', function (t) {
        return runTest(route, mockRequest, function (response) {
          t.equal(mockMailer.sendVerifyCode.callCount, 1, 'mailer.sendVerifyCode was called')
          t.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
          t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
          t.equal(response.verified, false, 'response indicates account is unverified')
          t.equal(response.verificationMethod, 'email', 'verificationMethod is email')
          t.equal(response.verificationReason, 'signup', 'verificationReason is signup')
          t.equal(response.emailSent, true, 'email not sent')
        }).then(function () {
          mockMailer.sendVerifyCode.reset()
        })
      })
    })
  })

  t.test('creating too many sessions causes an error to be logged', function (t) {
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
    mockDB.sessions = function () {
      return P.resolve(new Array(200))
    }
    mockLog.error = sinon.spy()
    mockRequest.app.clientAddress = '63.245.221.32'
    return runTest(route, mockRequest, function () {
      t.equal(mockLog.error.callCount, 0, 'log.error was not called')
    }).then(function () {
      mockDB.sessions = function () {
        return P.resolve(new Array(201))
      }
      mockLog.error.reset()
      return runTest(route, mockRequest, function () {
        t.equal(mockLog.error.callCount, 1, 'log.error was called')
        t.equal(mockLog.error.firstCall.args[0].op, 'Account.login')
        t.equal(mockLog.error.firstCall.args[0].numSessions, 201)
      })
    }).finally(function () {
      mockLog.close()
      mockMailer.sendVerifyCode.reset()
    })
  })

  t.test('checks security history', function (t) {
    t.plan(3)
    var record
    mockLog.info = sinon.spy(function (arg) {
      if (arg.op.indexOf('Account.history') === 0) {
        record = arg
      }
    })
    var clientAddress = mockRequest.app.clientAddress

    t.test('with a seen ip address', function (t) {
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
        t.equal(mockDB.securityEvents.callCount, 1, 'db.securityEvents was called')
        t.equal(securityQuery.uid, uid)
        t.equal(securityQuery.ipAddr, clientAddress)

        t.equal(!!record, true, 'log.info was called for Account.history')
        t.equal(record.op, 'Account.history.verified')
        t.equal(record.uid, uid.toString('hex'))
        t.equal(record.events, 1)
        t.equal(record.recency, 'day')
      })
    })

    t.test('with a seen, unverified ip address', function (t) {
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
        t.equal(mockDB.securityEvents.callCount, 1, 'db.securityEvents was called')
        t.equal(securityQuery.uid, uid)
        t.equal(securityQuery.ipAddr, clientAddress)

        t.equal(!!record, true, 'log.info was called for Account.history')
        t.equal(record.op, 'Account.history.unverified')
        t.equal(record.uid, uid.toString('hex'))
        t.equal(record.events, 1)
      })
    })

    t.test('with a new ip address', function (t) {
      record = undefined

      var securityQuery
      mockDB.securityEvents = sinon.spy(function (arg) {
        securityQuery = arg
        return P.resolve([])
      })
      return runTest(route, mockRequest, function (response) {
        t.equal(mockDB.securityEvents.callCount, 1, 'db.securityEvents was called')
        t.equal(securityQuery.uid, uid)
        t.equal(securityQuery.ipAddr, clientAddress)

        t.equal(record, undefined, 'log.info was not called for Account.history.verified')
      })
    })
  })

  t.test('records security event', function (t) {
    var clientAddress = mockRequest.app.clientAddress
    var securityQuery
    mockDB.securityEvent = sinon.spy(function (arg) {
      securityQuery = arg
      return P.resolve()
    })
    return runTest(route, mockRequest, function (response) {
      t.equal(mockDB.securityEvent.callCount, 1, 'db.securityEvent was called')
      t.equal(securityQuery.uid, uid)
      t.equal(securityQuery.ipAddr, clientAddress)
      t.equal(securityQuery.name, 'account.login')
    })
  })

  t.test('blocked by customs', (t) => {
    t.plan(2)
    t.test('can unblock', (t) => {
      t.plan(2)
      mockCustoms.check = () => P.reject(error.requestBlocked(true))
      t.test('signin unblock disabled', (t) => {
        t.plan(4)
        config.signinUnblock.enabled = false
        return runTest(route, mockRequest, (err) => {
          t.equal(err.errno, error.ERRNO.REQUEST_BLOCKED, 'correct errno is returned')
          t.equal(err.output.statusCode, 400, 'correct status code is returned')
          t.equal(err.output.payload.verificationMethod, undefined, 'no verificationMethod')
          t.equal(err.output.payload.verificationReason, undefined, 'no verificationReason')
        })
      })

      t.test('signin unblock enabled', (t) => {
        t.plan(2)
        config.signinUnblock.enabled = true

        t.test('without unblock code', (t) => {
          t.plan(4)
          return runTest(route, mockRequest, (err) => {
            t.equal(err.errno, error.ERRNO.REQUEST_BLOCKED, 'correct errno is returned')
            t.equal(err.output.statusCode, 400, 'correct status code is returned')
            t.equal(err.output.payload.verificationMethod, 'email-captcha', 'with verificationMethod')
            t.equal(err.output.payload.verificationReason, 'login', 'with verificationReason')
          })
        })

        t.test('with unblock code', (t) => {
          t.plan(3)
          t.test('invalid code', (t) => {
            t.plan(2)
            mockDB.consumeUnblockCode = () => P.reject(error.invalidUnblockCode())
            return runTest(route, mockRequestWithUnblockCode, (err) => {
              t.equal(err.errno, error.ERRNO.INVALID_UNBLOCK_CODE, 'correct errno is returned')
              t.equal(err.output.statusCode, 400, 'correct status code is returned')
            })
          })

          t.test('expired code', (t) => {
            mockDB.consumeUnblockCode = () => P.resolve({ createdAt: Date.now() - config.signinUnblock.codeLifetime - 1 })
            return runTest(route, mockRequestWithUnblockCode, (err) => {
              t.equal(err.errno, error.ERRNO.INVALID_UNBLOCK_CODE, 'correct errno is returned')
              t.equal(err.output.statusCode, 400, 'correct status code is returned')

              mockLog.activityEvent.reset()
              mockLog.flowEvent.reset()
            })
          })

          t.test('valid code', (t) => {
            t.plan(4)
            mockDB.consumeUnblockCode = () => P.resolve({ createdAt: Date.now() })
            return runTest(route, mockRequestWithUnblockCode, (res) => {
              t.ok(!(res instanceof Error), 'successful login')
              t.equal(mockLog.flowEvent.callCount, 2, 'log.flowEvent was called twice')
              t.equal(mockLog.flowEvent.args[0][0], 'account.login.confirmedUnblockCode', 'first event was account.login.confirmedUnblockCode')
              t.equal(mockLog.flowEvent.args[1][0], 'account.login', 'second event was account.login')

              mockLog.flowEvent.reset()
            })
          })
        })
      })
    })

    t.test('cannot unblock', (t) => {
      t.plan(2)
      mockCustoms.check = () => P.reject(error.requestBlocked(false))
      config.signinUnblock.enabled = true

      t.test('without an unblock code', (t) => {
        t.plan(4)
        return runTest(route, mockRequest, (err) => {
          t.equal(err.errno, error.ERRNO.REQUEST_BLOCKED, 'correct errno is returned')
          t.equal(err.output.statusCode, 400, 'correct status code is returned')
          t.equal(err.output.payload.verificationMethod, undefined, 'no verificationMethod')
          t.equal(err.output.payload.verificationReason, undefined, 'no verificationReason')
        })
      })

      t.test('with unblock code', (t) => {
        t.plan(4)
        return runTest(route, mockRequestWithUnblockCode, (err) => {
          t.equal(err.errno, error.ERRNO.REQUEST_BLOCKED, 'correct errno is returned')
          t.equal(err.output.statusCode, 400, 'correct status code is returned')
          t.equal(err.output.payload.verificationMethod, undefined, 'no verificationMethod')
          t.equal(err.output.payload.verificationReason, undefined, 'no verificationReason')
        })
      })
    })
  })
})

test('/recovery_email/verify_code', function (t) {
  t.plan(2)
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
  t.test('verifyTokens rejects with INVALID_VERIFICATION_CODE', function (t) {
    t.plan(2)

    t.test('without a reminder payload', function (t) {
      return runTest(route, mockRequest, function (response) {
        t.equal(mockDB.verifyTokens.callCount, 1, 'calls verifyTokens')
        t.equal(mockDB.verifyEmail.callCount, 1, 'calls verifyEmail')
        t.equal(mockCustoms.check.callCount, 1, 'calls customs.check')
        t.equal(mockLog.notifyAttachedServices.callCount, 1, 'logs verified')

        t.equal(mockMailer.sendPostVerifyEmail.callCount, 1, 'sendPostVerifyEmail was called once')

        t.equal(mockLog.activityEvent.callCount, 1, 'activityEvent was called once')
        let args = mockLog.activityEvent.args[0]
        t.equal(args.length, 3, 'activityEvent was passed three arguments')
        t.equal(args[0], 'account.verified', 'first argument was event name')
        t.equal(args[1], mockRequest, 'second argument was request object')
        t.deepEqual(args[2], { uid: uid }, 'third argument contained uid')

        t.equal(mockLog.flowEvent.callCount, 1, 'flowEvent was called once')
        args = mockLog.flowEvent.args[0]
        t.equal(args.length, 2, 'flowEvent was passed two arguments')
        t.equal(args[0], 'account.verified', 'first argument was event name')
        t.equal(args[1], mockRequest, 'second argument was request object')

        t.equal(mockPush.notifyUpdate.callCount, 1, 'mockPush.notifyUpdate should have been called once')
        args = mockPush.notifyUpdate.args[0]
        t.equal(args.length, 2, 'mockPush.notifyUpdate should have been passed two arguments')
        t.equal(args[0].toString('hex'), uid, 'first argument should have been uid')
        t.equal(args[1], 'accountVerify', 'second argument should have been reason')

        t.equal(JSON.stringify(response), '{}')
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

    t.test('with a reminder payload', function (t) {
      mockRequest.payload.reminder = 'second'

      return runTest(route, mockRequest, function (response) {
        t.equal(mockLog.activityEvent.callCount, 1, 'activityEvent was called once')

        t.equal(mockLog.flowEvent.callCount, 2, 'flowEvent was called twice')
        t.equal(mockLog.flowEvent.args[0][0], 'account.verified', 'first event was account.verified')
        const args = mockLog.flowEvent.args[1]
        t.equal(args.length, 2, 'flowEvent was passed two arguments')
        t.equal(args[0], 'account.reminder', 'second event was account.reminder')
        t.equal(args[1], mockRequest, 'second argument was request object')

        t.equal(mockMailer.sendPostVerifyEmail.callCount, 1, 'sendPostVerifyEmail was called once')
        t.equal(mockPush.notifyUpdate.callCount, 1, 'mockPush.notifyUpdate should have been called once')

        t.equal(JSON.stringify(response), '{}')
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

  t.test('verifyTokens resolves', function (t) {
    t.plan(2)

    dbData.emailVerified = true
    dbErrors.verifyTokens = undefined

    t.test('email verification', function (t) {
      return runTest(route, mockRequest, function (response) {
        t.equal(mockDB.verifyTokens.callCount, 1, 'call db.verifyTokens')
        t.equal(mockDB.verifyEmail.callCount, 0, 'does not call db.verifyEmail')
        t.equal(mockLog.notifyAttachedServices.callCount, 0, 'does not call log.notifyAttachedServices')
        t.equal(mockLog.activityEvent.callCount, 0, 'log.activityEvent was not called')
        t.equal(mockPush.notifyUpdate.callCount, 0, 'mockPush.notifyUpdate should not have been called')
      })
      .then(function () {
        mockDB.verifyTokens.reset()
      })
    })

    t.test('sign-in confirmation', function (t) {
      dbData.emailCode = crypto.randomBytes(16)

      return runTest(route, mockRequest, function (response) {
        t.equal(mockDB.verifyTokens.callCount, 1, 'call db.verifyTokens')
        t.equal(mockDB.verifyEmail.callCount, 0, 'does not call db.verifyEmail')
        t.equal(mockLog.notifyAttachedServices.callCount, 0, 'does not call log.notifyAttachedServices')

        t.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
        var args = mockLog.activityEvent.args[0]
        t.equal(args.length, 3, 'log.activityEvent was passed three arguments')
        t.equal(args[0], 'account.confirmed', 'first argument was event name')
        t.equal(args[1], mockRequest, 'second argument was request object')
        t.deepEqual(args[2], { uid: uid }, 'third argument contained uid')

        t.equal(mockPush.notifyUpdate.callCount, 1, 'mockPush.notifyUpdate should have been called once')
        args = mockPush.notifyUpdate.args[0]
        t.equal(args.length, 2, 'mockPush.notifyUpdate should have been passed two arguments')
        t.equal(args[0].toString('hex'), uid, 'first argument should have been uid')
        t.equal(args[1], 'accountConfirm', 'second argument should have been reason')
      })
      .then(function () {
        mockDB.verifyTokens.reset()
        mockLog.activityEvent.reset()
        mockPush.notifyUpdate.reset()
      })
    })
  })
})

test('/account/keys', function (t) {
  t.plan(2)
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

  t.test('verified token', function (t) {
    return runTest(route, mockRequest, function (response) {
      t.deepEqual(response, {bundle: mockRequest.auth.credentials.keyBundle.toString('hex')}, 'response was correct')

      t.equal(mockDB.deleteKeyFetchToken.callCount, 1, 'db.deleteKeyFetchToken was called once')
      var args = mockDB.deleteKeyFetchToken.args[0]
      t.equal(args.length, 1, 'db.deleteKeyFetchToken was passed one argument')
      t.equal(args[0], mockRequest.auth.credentials, 'db.deleteKeyFetchToken was passed key fetch token')

      t.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
      args = mockLog.activityEvent.args[0]
      t.equal(args.length, 3, 'log.activityEvent was passed three arguments')
      t.equal(args[0], 'account.keyfetch', 'first argument was event name')
      t.equal(args[1], mockRequest, 'second argument was request object')
      t.deepEqual(args[2], {uid: uid.toString('hex')}, 'third argument contained uid')
    })
      .then(function () {
        mockLog.activityEvent.reset()
        mockDB.deleteKeyFetchToken.reset()
      })
  })

  t.test('unverified token', function (t) {
    mockRequest.auth.credentials.tokenVerificationId = crypto.randomBytes(16)
    mockRequest.auth.credentials.tokenVerified = false
    return runTest(route, mockRequest, function (response) {
      t.equal(response.errno, 104, 'correct errno for unverified account')
      t.equal(response.message, 'Unverified account', 'correct error message')
    })
      .then(function () {
        mockLog.activityEvent.reset()
      })
  })
})

test('/account/destroy', function (t) {
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
    t.equal(mockDB.emailRecord.callCount, 1, 'db.emailRecord was called once')
    var args = mockDB.emailRecord.args[0]
    t.equal(args.length, 2, 'db.emailRecord was passed two arguments')
    t.equal(args[0], email, 'first argument was email address')
    t.equal(args[1], true, 'second argument was customs.check result')

    t.equal(mockDB.deleteAccount.callCount, 1, 'db.deleteAccount was called once')
    args = mockDB.deleteAccount.args[0]
    t.equal(args.length, 1, 'db.deleteAccount was passed one argument')
    t.equal(args[0].email, email, 'db.deleteAccount was passed email record')
    t.deepEqual(args[0].uid, uid, 'email record had correct uid')

    t.equal(mockLog.notifyAttachedServices.callCount, 1, 'log.notifyAttachedServices was called once')
    args = mockLog.notifyAttachedServices.args[0]
    t.equal(args.length, 3, 'log.notifyAttachedServices was passed three arguments')
    t.equal(args[0], 'delete', 'first argument was event name')
    t.equal(args[1], mockRequest, 'second argument was request object')
    t.equal(args[2].uid, uid.toString('hex') + '@wibble', 'third argument was event data')

    t.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
    args = mockLog.activityEvent.args[0]
    t.equal(args.length, 3, 'log.activityEvent was passed three arguments')
    t.equal(args[0], 'account.deleted', 'first argument was event name')
    t.equal(args[1], mockRequest, 'second argument was request object')
    t.equal(args[2].uid, uid.toString('hex'), 'third argument was event data')
  })
})

test('/account/devices', function (t) {
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
    t.ok(Array.isArray(response), 'response is array')
    t.equal(response.length, 4, 'response contains 4 items')

    t.equal(response[0].name, 'current session')
    t.equal(response[0].type, 'mobile')
    t.equal(response[0].sessionToken, undefined)
    t.equal(response[0].isCurrentDevice, true)

    t.equal(response[1].name, 'has no type')
    t.equal(response[1].type, 'desktop')
    t.equal(response[1].sessionToken, undefined)
    t.equal(response[1].isCurrentDevice, false)

    t.equal(response[2].name, 'has device type')
    t.equal(response[2].type, 'wibble')
    t.equal(response[2].isCurrentDevice, false)

    t.equal(response[3].name, null)

    t.equal(mockDB.devices.callCount, 1, 'db.devices was called once')
    t.equal(mockDB.devices.args[0].length, 1, 'db.devices was passed one argument')
    t.deepEqual(mockDB.devices.args[0][0], mockRequest.auth.credentials.uid, 'db.devices was passed uid')

    t.equal(mockDevices.synthesizeName.callCount, 1, 'mockDevices.synthesizeName was called once')
    t.equal(mockDevices.synthesizeName.args[0].length, 1, 'mockDevices.synthesizeName was passed one argument')
    t.equal(mockDevices.synthesizeName.args[0][0], unnamedDevice, 'mockDevices.synthesizeName was passed unnamed device')
  })
})

test('/account/login/send_unblock_code', function (t) {
  t.plan(2)
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

  t.test('signin unblock enabled', function (t) {
    t.plan(12)
    config.signinUnblock.enabled = true
    return runTest(route, mockRequest, function (response) {
      t.ok(!(response instanceof Error), response.stack)
      t.deepEqual(response, {}, 'response has no keys')

      t.equal(mockDb.emailRecord.callCount, 1, 'db.emailRecord called')
      t.equal(mockDb.emailRecord.args[0][0], TEST_EMAIL)

      t.equal(mockDb.createUnblockCode.callCount, 1, 'db.createUnblockCode called')
      var dbArgs = mockDb.createUnblockCode.args[0]
      t.equal(dbArgs.length, 1)
      t.equal(dbArgs[0], uid)

      t.equal(mockMailer.sendUnblockCode.callCount, 1, 'called mailer.sendUnblockCode')
      var args = mockMailer.sendUnblockCode.args[0]
      t.equal(args.length, 3, 'mailer.sendUnblockCode called with 3 args')

      t.equal(mockLog.flowEvent.callCount, 1, 'log.flowEvent was called once')
      args = mockLog.flowEvent.args[0]
      t.equal(args.length, 2, 'log.flowEvent was passed two arguments')
      t.equal(args[0], 'account.login.sentUnblockCode', 'first argument was event name')
      mockLog.flowEvent.reset()
    })
  })

  t.test('signin unblock disabled', function (t) {
    t.plan(3)
    config.signinUnblock.enabled = false

    return runTest(route, mockRequest, function (err) {
      t.equal(err.output.statusCode, 503, 'correct status code is returned')
      t.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED, 'correct errno is returned')

      t.equal(mockLog.flowEvent.callCount, 0, 'log.flowEvent was not called')
    })
  })
})

test('/account/login/reject_unblock_code', function (t) {
  t.plan(6)
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
    t.ok(!(response instanceof Error), response.stack)
    t.deepEqual(response, {}, 'response has no keys')

    t.equal(mockDb.consumeUnblockCode.callCount, 1, 'consumeUnblockCode is called')
    var args = mockDb.consumeUnblockCode.args[0]
    t.equal(args.length, 2)
    t.equal(args[0].toString('hex'), uid)
    t.equal(args[1], unblockCode)
  })

})
