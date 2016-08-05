/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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

  var log = options.log || mocks.mockLog()
  var Password = options.Password || require('../../lib/crypto/password')(log, config)
  var db = options.db || mocks.mockDB()
  var isPreVerified = require('../../lib/preverifier')(error, config)
  var customs = options.customs || {
    check: function () { return P.resolve(true) }
  }
  var checkPassword = options.checkPassword || require('../../lib/routes/utils/password_check')(log, config, Password, customs, db)
  var push = options.push || require('../../lib/push')(log, db)
  var metricsContext = options.metricsContext || log.metricsContext || require('../../lib/metrics/context')(log, config)
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
    metricsContext
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
      }, t)

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
    t.plan(2)
    config.signinConfirmation.enabled = true
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

    t.test('verified account, unverified session', function (t) {
      mockRequest.auth.credentials.emailVerified = true
      mockRequest.auth.credentials.tokenVerified = false

      return runTest(route, mockRequest, function (response) {
        t.deepEqual(response, {
          email: TEST_EMAIL,
          verified: false,
          sessionVerified: false,
          emailVerified: true
        })
      })
    })
  })
})

test('/account/reset', function (t) {
  var uid = uuid.v4('binary')
  var mockRequest = mocks.mockRequest({
    credentials: {
      uid: uid.toString('hex')
    },
    payload: {
      authPW: crypto.randomBytes(32).toString('hex')
    }
  })
  var mockDB = mocks.mockDB({
    uid: uid,
    email: TEST_EMAIL
  })
  var mockCustoms = {
    reset: sinon.spy(function () {
      return P.resolve()
    })
  }
  var mockLog = mocks.spyLog()
  var mockPush = mocks.mockPush()
  var accountRoutes = makeRoutes({
    customs: mockCustoms,
    db: mockDB,
    log: mockLog,
    push: mockPush
  })
  var route = getRoute(accountRoutes, '/account/reset')

  return runTest(route, mockRequest, function () {
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
  })
})

test('/account/device', function (t) {
  t.plan(2)
  var config = {}
  var uid = uuid.v4('binary')
  var device = {}
  var mockRequest = mocks.mockRequest({
    credentials: {
      uid: uid.toString('hex')
    },
    payload: device
  })
  var deviceCreatedAt = Date.now()
  var deviceId = crypto.randomBytes(16).toString('hex')
  var mockDB = mocks.mockDB({
    device: device,
    deviceCreatedAt: deviceCreatedAt,
    deviceId: deviceId
  })
  var mockLog = mocks.spyLog()
  var mockPush = mocks.mockPush()
  var accountRoutes = makeRoutes({
    config: config,
    db: mockDB,
    log: mockLog,
    push: mockPush
  })
  var route = getRoute(accountRoutes, '/account/device')

  t.test('create', function (t) {
    device.name = 'My Phone'
    device.type = 'mobile'
    device.pushCallback = 'https://updates.push.services.mozilla.com/update/abcdef01234567890abcdefabcdef01234567890abcdef'

    return runTest(route, mockRequest, function (response) {
      t.equal(mockDB.createDevice.callCount, 1)

      t.equal(mockPush.notifyDeviceConnected.callCount, 1)
      t.equal(mockPush.notifyDeviceConnected.firstCall.args[0], mockRequest.auth.credentials.uid)
      t.equal(mockPush.notifyDeviceConnected.firstCall.args[1], device.name)
      t.equal(mockPush.notifyDeviceConnected.firstCall.args[2], deviceId)

      t.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
      var args = mockLog.activityEvent.args[0]
      t.equal(args.length, 3, 'log.activityEvent was passed three arguments')
      t.equal(args[0], 'device.created', 'first argument was event name')
      t.equal(args[1], mockRequest, 'second argument was request object')
      t.deepEqual(args[2], { uid: uid.toString('hex'), device_id: deviceId }, 'third argument contained uid')

      t.equal(mockLog.notifyAttachedServices.callCount, 1)
      args = mockLog.notifyAttachedServices.args[0]
      t.equal(args.length, 3)
      t.equal(args[0], 'device:create')
      t.equal(args[1], mockRequest)
      t.deepEqual(args[2], {
        uid: uid.toString('hex'),
        id: deviceId,
        type: 'mobile',
        timestamp: deviceCreatedAt
      })
    })
    .then(function () {
      mockDB.createDevice.reset()
      mockLog.activityEvent.reset()
      mockLog.notifyAttachedServices.reset()
      mockPush.notifyDeviceConnected.reset()
    })
  })

  t.test('update', function (t) {
    t.plan(3)
    var deviceId = crypto.randomBytes(16)
    var credentials = mockRequest.auth.credentials
    credentials.tokenId = 'lookmumasessiontoken'
    credentials.deviceName = 'my awesome device'
    credentials.deviceType = 'desktop'
    credentials.deviceCallbackURL = ''
    credentials.deviceCallbackPublicKey = ''
    device.name = device.type = device.pushCallback = undefined
    device.id = deviceId.toString('hex')

    t.test('identical data', function (t) {
      mockRequest.auth.credentials.deviceId = deviceId
      mockRequest.payload.name = 'my awesome device'

      return runTest(route, mockRequest, function (response) {
        t.equal(mockDB.updateDevice.callCount, 0, 'updateDevice was not called')

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
        t.equal(mockDB.updateDevice.callCount, 1, 'updateDevice was called')

        t.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
        var args = mockLog.activityEvent.args[0]
        t.equal(args.length, 3, 'log.activityEvent was passed three arguments')
        t.equal(args[0], 'device.updated', 'first argument was event name')
        t.equal(args[1], mockRequest, 'second argument was request object')
        t.deepEqual(args[2], { uid: uid.toString('hex'), device_id: deviceId.toString('hex') }, 'third argument contained uid')

        t.equal(mockLog.notifyAttachedServices.callCount, 0, 'log.notifyAttachedServices was not called')

        t.equal(mockLog.increment.callCount, 5, 'the counters were incremented')
        t.equal(mockLog.increment.getCall(0).args[0], 'device.update.sessionToken')
        t.equal(mockLog.increment.getCall(1).args[0], 'device.update.name')
        t.equal(mockLog.increment.getCall(2).args[0], 'device.update.type')
        t.equal(mockLog.increment.getCall(3).args[0], 'device.update.pushCallback')
        t.equal(mockLog.increment.getCall(4).args[0], 'device.update.pushPublicKey')
      })
      .then(function () {
        mockDB.updateDevice.reset()
        mockLog.activityEvent.reset()
        mockLog.increment.reset()
      })
    })

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
  var mockCustoms = {
    checkAuthenticated: sandbox.spy(function () {
      return P.resolve()
    })
  }
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

    mockCustoms = {
      checkAuthenticated: sandbox.spy(function () {
        throw error.tooManyRequests(1)
      })
    }
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
  var mockRequest = mocks.mockRequest({
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
  // We want to test what's actually written to stdout by the logger.
  var mockLog = log('ERROR', 'test', {
    stdout: {
      on: sinon.spy(),
      write: sinon.spy()
    },
    stderr: {
      on: sinon.spy(),
      write: sinon.spy()
    }
  })
  var mockMetricsContext = mocks.mockMetricsContext({
    gather: sinon.spy(function (data, request) {
      return P.resolve(request.payload.metricsContext)
    })
  })
  mockLog.setMetricsContext(mockMetricsContext)
  mockLog.activityEvent = sinon.spy(function () {
    return P.resolve()
  })
  var mockMailer = mocks.mockMailer()
  var accountRoutes = makeRoutes({
    db: mockDB,
    log: mockLog,
    mailer: mockMailer,
    metricsContext: mockMetricsContext,
    Password: function () {
      return {
        unwrap: function () {
          return P.resolve('wibble')
        },
        verifyHash: function () {
          return P.resolve('wibble')
        }
      }
    }
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
    args = mockMetricsContext.validate.args[0]
    t.equal(args.length, 1, 'validate was called with a single argument')
    t.deepEqual(args[0], mockRequest, 'validate was called with the request')

    t.equal(mockMetricsContext.stash.callCount, 3, 'metricsContext.stash was called three times')

    args = mockMetricsContext.stash.args[0]
    t.equal(args.length, 3, 'metricsContext.stash was passed three arguments first time')
    t.deepEqual(args[0].tokenId, sessionTokenId, 'first argument was session token')
    t.deepEqual(args[0].uid, uid, 'sessionToken.uid was correct')
    t.deepEqual(args[1], [ 'device.created', 'account.signed' ], 'second argument was event array')
    t.equal(args[2], mockRequest.payload.metricsContext, 'third argument was metrics context')

    args = mockMetricsContext.stash.args[1]
    t.equal(args.length, 3, 'metricsContext.stash was passed three arguments second time')
    t.equal(args[0].id, emailCode.toString('hex'), 'first argument was synthesized token')
    t.deepEqual(args[0].uid, uid, 'token.uid was correct')
    t.deepEqual(args[1], 'account.verified', 'second argument was event name')
    t.equal(args[2], mockRequest.payload.metricsContext, 'third argument was metrics context')

    args = mockMetricsContext.stash.args[2]
    t.equal(args.length, 3, 'metricsContext.stash was passed three arguments third time')
    t.deepEqual(args[0].tokenId, keyFetchTokenId, 'first argument was key fetch token')
    t.deepEqual(args[0].uid, uid, 'keyFetchToken.uid was correct')
    t.deepEqual(args[1], 'account.keyfetch', 'second argument was event name')
    t.equal(args[2], mockRequest.payload.metricsContext, 'third argument was metrics context')
  }).finally(function () {
    mockLog.close()
  })
})

test('/account/login', function (t) {
  t.plan(3)
  var config = {
    newLoginNotificationEnabled: true
  }
  var mockRequest = mocks.mockRequest({
    query: {
      keys: 'true'
    },
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
    }
  })
  var mockRequestNoKeys = mocks.mockRequest({
    query: {},
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
  // We want to test what's actually written to stdout by the logger.
  var mockLog = log('ERROR', 'test', {
    stdout: {
      on: sinon.spy(),
      write: sinon.spy()
    },
    stderr: {
      on: sinon.spy(),
      write: sinon.spy()
    }
  })
  var mockMetricsContext = mocks.mockMetricsContext({
    gather: sinon.spy(function (data, request) {
      return P.resolve(request.payload.metricsContext)
    })
  })
  mockLog.setMetricsContext(mockMetricsContext)
  mockLog.activityEvent = sinon.spy(function () {
    return P.resolve()
  })
  var mockMailer = mocks.mockMailer()
  var accountRoutes = makeRoutes({
    checkPassword: function () {
      return P.resolve(true)
    },
    config: config,
    customs: {
      check: function () {
        return P.resolve()
      }
    },
    db: mockDB,
    log: mockLog,
    mailer: mockMailer,
    metricsContext: mockMetricsContext
  })
  var route = getRoute(accountRoutes, '/account/login')

  t.test('sign-in confirmation disabled', function (t) {
    return runTest(route, mockRequest, function (response) {
      t.equal(mockDB.emailRecord.callCount, 1, 'db.emailRecord was called')
      t.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')
      t.equal(mockDB.sessions.callCount, 1, 'db.sessions was called')

      t.equal(mockLog.stdout.write.callCount, 1, 'an sqs event was logged')
      var eventData = JSON.parse(mockLog.stdout.write.getCall(0).args[0])
      t.equal(eventData.event, 'login', 'it was a login event')
      t.equal(eventData.data.service, 'sync', 'it was for sync')
      t.equal(eventData.data.email, TEST_EMAIL, 'it was for the correct email')
      t.deepEqual(eventData.data.metricsContext, mockRequest.payload.metricsContext, 'it contained the metrics context')

      t.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
      var args = mockLog.activityEvent.args[0]
      t.equal(args.length, 3, 'log.activityEvent was passed three arguments')
      t.equal(args[0], 'account.login', 'first argument was event name')
      t.equal(args[1], mockRequest, 'second argument was request object')
      t.deepEqual(args[2], { uid: uid.toString('hex') }, 'third argument contained uid')

      t.equal(mockMetricsContext.validate.callCount, 1, 'metricsContext.validate was called')
      args = mockMetricsContext.validate.args[0]
      t.equal(args.length, 1, 'validate was called with a single argument')
      t.deepEqual(args[0], mockRequest, 'validate was called with the request')

      t.equal(mockMetricsContext.stash.callCount, 2, 'metricsContext.stash was called twice')

      args = mockMetricsContext.stash.args[0]
      t.equal(args.length, 3, 'metricsContext.stash was passed three arguments first time')
      t.deepEqual(args[0].tokenId, sessionTokenId, 'first argument was session token')
      t.deepEqual(args[0].uid, uid, 'sessionToken.uid was correct')
      t.deepEqual(args[1], [ 'device.created', 'account.signed' ], 'second argument was event array')
      t.equal(args[2], mockRequest.payload.metricsContext, 'third argument was metrics context')

      args = mockMetricsContext.stash.args[1]
      t.equal(args.length, 3, 'metricsContext.stash was passed three arguments second time')
      t.deepEqual(args[0].tokenId, keyFetchTokenId, 'first argument was key fetch token')
      t.deepEqual(args[0].uid, uid, 'keyFetchToken.uid was correct')
      t.deepEqual(args[1], 'account.keyfetch', 'second argument was event name')
      t.equal(args[2], mockRequest.payload.metricsContext, 'third argument was metrics context')

      t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 1, 'mailer.sendNewDeviceLoginNotification was called')
      t.equal(mockMailer.sendNewDeviceLoginNotification.getCall(0).args[1].location.city, 'Mountain View')
      t.equal(mockMailer.sendNewDeviceLoginNotification.getCall(0).args[1].location.country, 'United States')
      t.equal(mockMailer.sendNewDeviceLoginNotification.getCall(0).args[1].timeZone, 'America/Los_Angeles')
      t.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
      t.notOk(response.verificationMethod, 'verificationMethod doesn\'t exist')
      t.notOk(response.verificationReason, 'verificationReason doesn\'t exist')
    }).then(function () {
      mockMailer.sendNewDeviceLoginNotification.reset()
      mockMetricsContext.stash.reset()
    })
  })

  t.test('sign-in confirmation enabled', function (t) {
    t.plan(11)
    config.signinConfirmation = {
      enabled: true,
      supportedClients: [ 'fx_desktop_v3' ],
      forceEmailRegex: [ '.+@mozilla\.com$', 'fennec@fire.fox' ]
    }

    t.test('always on', function (t) {
      config.signinConfirmation.sample_rate = 1

      return runTest(route, mockRequest, function (response) {
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 1, 'mailer.sendVerifyLoginEmail was called')
        t.equal(response.verificationMethod, 'email', 'verificationMethod is email')
        t.equal(response.verificationReason, 'login', 'verificationReason is login')

        t.equal(mockMetricsContext.stash.callCount, 3, 'metricsContext.stash was called three times')
        t.deepEqual(mockMetricsContext.stash.args[0][1], [ 'device.created', 'account.signed' ], 'first call was for device.created and account.signed')
        var args = mockMetricsContext.stash.args[1]
        t.equal(args.length, 3, 'metricsContext.stash was passed three arguments second time')
        t.ok(/^[0-9a-f]{32}$/.test(args[0].id), 'first argument was synthesized token')
        t.deepEqual(args[0].uid, uid, 'token.uid was correct')
        t.deepEqual(args[1], 'account.confirmed', 'second argument was event name')
        t.equal(args[2], mockRequest.payload.metricsContext, 'third argument was metrics context')
        t.deepEqual(mockMetricsContext.stash.args[2][1], 'account.keyfetch', 'third call was for account.keyfetch')
      }).then(function () {
        mockMailer.sendVerifyLoginEmail.reset()
        mockMetricsContext.stash.reset()
      })
    })

    t.test('location data is present in sign-in confirmation email', function (t) {
      return runTest(route, mockRequest, function (response) {
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 1, 'mailer.sendVerifyLoginEmail was called')
        t.equal(mockMailer.sendVerifyLoginEmail.getCall(0).args[2].location.city, 'Mountain View')
        t.equal(mockMailer.sendVerifyLoginEmail.getCall(0).args[2].location.country, 'United States')
        t.equal(mockMailer.sendVerifyLoginEmail.getCall(0).args[2].timeZone, 'America/Los_Angeles')
      }).then(function () {
        mockMailer.sendVerifyLoginEmail.reset()
      })
    })

    t.test('on for sample', function (t) {
      // Force uid to '01...'
      uid.fill(0, 0, 1)
      uid.fill(1, 1, 2)
      config.signinConfirmation.sample_rate = 0.02

      return runTest(route, mockRequest, function (response) {
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 1, 'mailer.sendVerifyLoginEmail was called')
        t.equal(response.verificationMethod, 'email', 'verificationMethod is email')
        t.equal(response.verificationReason, 'login', 'verificationReason is login')
      }).then(function () {
        mockMailer.sendVerifyLoginEmail.reset()
      })
    })

    t.test('off for sample', function (t) {
      config.signinConfirmation.sample_rate = 0.01

      return runTest(route, mockRequest, function (response) {
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 1, 'mailer.sendNewDeviceLoginNotification was called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
        t.notOk(response.verificationMethod, 'verificationMethod doesn\'t exist')
        t.notOk(response.verificationReason, 'verificationReason doesn\'t exist')
      }).then(function () {
        mockMailer.sendNewDeviceLoginNotification.reset()
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
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 1, 'mailer.sendVerifyLoginEmail was called')
        t.equal(response.verificationMethod, 'email', 'verificationMethod is email')
        t.equal(response.verificationReason, 'login', 'verificationReason is login')
      }).then(function () {
        mockMailer.sendVerifyLoginEmail.reset()
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
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
        t.notOk(response.verificationMethod, 'verificationMethod doesn\'t exist')
        t.notOk(response.verificationReason, 'verificationReason doesn\'t exist')
      })
    })

    t.test('on for specific email', function (t) {
      mockRequest.payload.email = 'fennec@fire.fox'
      mockDB.emailRecord = function () {
        return P.resolve({
          authSalt: crypto.randomBytes(32),
          data: crypto.randomBytes(32),
          email: 'fennec@fire.fox',
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
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 1, 'mailer.sendVerifyLoginEmail was called')
        t.equal(response.verificationMethod, 'email', 'verificationMethod is email')
        t.equal(response.verificationReason, 'login', 'verificationReason is login')
      }).then(function () {
        mockMailer.sendVerifyLoginEmail.reset()
      })
    })

    t.test('off for email regex mismatch', function (t) {
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
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 1, 'mailer.sendNewDeviceLoginNotification was called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
        t.notOk(response.verificationMethod, 'verificationMethod doesn\'t exist')
        t.notOk(response.verificationReason, 'verificationReason doesn\'t exist')
      }).then(function () {
        mockMailer.sendNewDeviceLoginNotification.reset()
      })
    })

    t.test('off for unsupported client', function (t) {
      config.signinConfirmation.supportedClients = [ 'fx_desktop_v999' ]

      return runTest(route, mockRequest, function (response) {
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 1, 'mailer.sendNewDeviceLoginNotification was called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
        t.notOk(response.verificationMethod, 'verificationMethod doesn\'t exist')
        t.notOk(response.verificationReason, 'verificationReason doesn\'t exist')
      }).then(function () {
        mockMailer.sendNewDeviceLoginNotification.reset()
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
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 1, 'mailer.sendVerifyLoginEmail was called')
        t.equal(response.verificationMethod, 'email', 'verificationMethod is email')
        t.equal(response.verificationReason, 'login', 'verificationReason is login')
      }).then(function () {
        mockMailer.sendVerifyLoginEmail.reset()
      })
    })

    t.test('unverified account does not get any confirmation emails', function (t) {
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
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
        t.equal(response.verificationMethod, 'email', 'verificationMethod is email')
        t.equal(response.verificationReason, 'signup', 'verificationReason is signup')
      })
    })

  })

  t.test('creating too many sessions causes an error to be logged', function (t) {
    mockDB.sessions = function () {
      return P.resolve(new Array(200))
    }
    mockLog.error = sinon.spy()
    return runTest(route, mockRequest, function () {
      t.equal(mockLog.error.callCount, 0, 'log.error was not called')
    }).then(function() {
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
    })
  })
})

test('/recovery_email/verify_code', function (t) {
  t.plan(2)
  var uid = uuid.v4('binary').toString('hex')
  var mockRequest = mocks.mockRequest({
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
  var mockLog = mocks.spyLog()
  var mockMailer = mocks.mockMailer()
  var accountRoutes = makeRoutes({
    checkPassword: function () {
      return P.resolve(true)
    },
    config: {},
    customs: {
      check: function () {
        return P.resolve()
      }
    },
    db: mockDB,
    log: mockLog,
    mailer: mockMailer
  })
  var route = getRoute(accountRoutes, '/recovery_email/verify_code')
  t.test('verifyTokens rejects with INVALID_VERIFICATION_CODE', function (t) {
    t.plan(2)

    t.test('without a reminder payload', function (t) {
      return runTest(route, mockRequest, function (response) {
        t.equal(mockDB.verifyTokens.callCount, 1, 'calls verifyTokens')
        t.equal(mockDB.verifyEmail.callCount, 1, 'calls verifyEmail')
        t.equal(mockLog.notifyAttachedServices.callCount, 1, 'logs verified')

        t.equal(mockMailer.sendPostVerifyEmail.callCount, 1, 'sendPostVerifyEmail was called once')

        t.equal(mockLog.activityEvent.callCount, 1, 'activityEvent was called once')
        var args = mockLog.activityEvent.args[0]
        t.equal(args.length, 3, 'activityEvent was passed three arguments')
        t.equal(args[0], 'account.verified', 'first argument was event name')
        t.deepEqual(args[1], {
          auth: {
            credentials: {
              uid: Buffer(uid, 'hex'),
              id: mockRequest.payload.code,
            }
          },
          headers: mockRequest.headers,
          payload: mockRequest.payload,
          query: mockRequest.query
        }, 'second argument was synthesized request object')
        t.deepEqual(args[2], {
          uid: uid.toString('hex')
        }, 'third argument contained uid')

        t.equal(JSON.stringify(response), '{}')
      })
      .then(function () {
        mockDB.verifyTokens.reset()
        mockDB.verifyEmail.reset()
        mockLog.activityEvent.reset()
        mockLog.notifyAttachedServices.reset()
        mockMailer.sendPostVerifyEmail.reset()
      })
    })

    t.test('with a reminder payload', function (t) {
      mockRequest.payload.reminder = 'second'

      return runTest(route, mockRequest, function (response) {
        t.equal(mockLog.activityEvent.callCount, 2, 'activityEvent was called twice')
        t.equal(mockLog.activityEvent.args[0][0], 'account.verified', 'first call was account.verified')
        t.equal(mockMailer.sendPostVerifyEmail.callCount, 1, 'sendPostVerifyEmail was called once')

        var args = mockLog.activityEvent.args[1]
        t.equal(args.length, 3, 'activityEvent was passed three arguments second time')
        t.equal(args[0], 'account.reminder', 'first argument was event name')
        t.equal(args[1], mockRequest, 'second argument was request object')
        t.deepEqual(args[2], {
          uid: uid.toString('hex')
        }, 'third argument contained uid')

        t.equal(JSON.stringify(response), '{}')
      })
      .then(function () {
        mockDB.verifyTokens.reset()
        mockDB.verifyEmail.reset()
        mockLog.activityEvent.reset()
        mockLog.notifyAttachedServices.reset()
        mockMailer.sendPostVerifyEmail.reset()
      })
    })
  })

  t.test('verifyTokens resolves', function (t) {
    dbData.emailVerified = true
    dbErrors.verifyTokens = undefined

    return runTest(route, mockRequest, function (response) {
      t.equal(mockDB.verifyTokens.callCount, 1, 'call db.verifyTokens')
      t.equal(mockDB.verifyEmail.callCount, 0, 'does not call db.verifyEmail')
      t.equal(mockLog.notifyAttachedServices.callCount, 0, 'does not call log.notifyAttachedServices')

      t.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
      var args = mockLog.activityEvent.args[0]
      t.equal(args.length, 3, 'log.activityEvent was passed three arguments')
      t.equal(args[0], 'account.confirmed', 'first argument was event name')
      t.deepEqual(args[1], {
        auth: {
          credentials: {
            uid: Buffer(uid, 'hex'),
            id: mockRequest.payload.code,
          }
        },
        headers: mockRequest.headers,
        payload: mockRequest.payload,
        query: mockRequest.query
      }, 'second argument was synthesized request object')
      t.deepEqual(args[2], {
        uid: uid.toString('hex')
      }, 'third argument contained uid')
    })
    .then(function () {
      mockDB.verifyTokens.reset()
      mockLog.activityEvent.reset()
    })
  })
})

test('/account/keys', function (t) {
  t.plan(2)
  var keyFetchTokenId = crypto.randomBytes(16)
  var uid = uuid.v4('binary')
  var mockRequest = mocks.mockRequest({
    credentials: {
      emailVerified: true,
      id: keyFetchTokenId.toString('hex'),
      keyBundle: crypto.randomBytes(16),
      tokenId: keyFetchTokenId,
      tokenVerificationId: undefined,
      tokenVerified: true,
      uid: uid
    }
  })
  var mockDB = mocks.mockDB()
  var mockLog = mocks.spyLog()
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
  var mockLog = mocks.spyLog()
  var mockRequest = mocks.mockRequest({
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
