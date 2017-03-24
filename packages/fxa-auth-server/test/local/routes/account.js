/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var sinon = require('sinon')

const assert = require('insist')
var mocks = require('../../mocks')
var getRoute = require('../../routes_helpers').getRoute
var proxyquire = require('proxyquire')

var P = require('../../../lib/promise')
var uuid = require('uuid')
var crypto = require('crypto')
var error = require('../../../lib/error')
var log = require('../../../lib/log')

var TEST_EMAIL = 'foo@gmail.com'

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
  config.push = {
    allowedServerRegex: /^https:\/\/updates\.push\.services\.mozilla\.com(\/.*)?$/
  }

  var log = options.log || mocks.mockLog()
  var Password = options.Password || require('../../../lib/crypto/password')(log, config)
  var db = options.db || mocks.mockDB()
  var customs = options.customs || {
    check: function () { return P.resolve(true) }
  }
  var checkPassword = options.checkPassword || require('../../../lib/routes/utils/password_check')(log, config, Password, customs, db)
  var push = options.push || require('../../../lib/push')(log, db, {})
  return proxyquire('../../../lib/routes/account', requireMocks || {})(
    log,
    db,
    options.mailer || {},
    Password,
    config,
    customs,
    checkPassword,
    push,
    options.devices || require('../../../lib/devices')(log, db, push)
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

describe('/account/reset', function () {
  it('should do things', () => {
    var uid = uuid.v4('binary')
    const mockLog = mocks.spyLog()
    const mockMetricsContext = mocks.mockMetricsContext()
    const mockRequest = mocks.mockRequest({
      credentials: {
        uid: uid.toString('hex')
      },
      log: mockLog,
      metricsContext: mockMetricsContext,
      payload: {
        authPW: crypto.randomBytes(32).toString('hex'),
        sessionToken: true,
        metricsContext: {
          flowBeginTime: Date.now(),
          flowId: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
        }
      },
      query: {
        keys: 'true'
      }
    })
    const keyFetchTokenId = crypto.randomBytes(16)
    const sessionTokenId = crypto.randomBytes(16)
    const mockDB = mocks.mockDB({
      uid: uid,
      email: TEST_EMAIL,
      keyFetchTokenId: keyFetchTokenId,
      sessionTokenId: sessionTokenId,
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
      assert.equal(args.length, 1, 'log.activityEvent was passed one argument')
      assert.deepEqual(args[0], {
        event: 'account.reset',
        service: undefined,
        userAgent: 'test user-agent',
        uid: uid.toString('hex')
      }, 'event data was correct')

      assert.equal(mockDB.securityEvent.callCount, 1, 'db.securityEvent was called')
      var securityEvent = mockDB.securityEvent.args[0][0]
      assert.equal(securityEvent.uid, uid)
      assert.equal(securityEvent.ipAddr, clientAddress)
      assert.equal(securityEvent.name, 'account.reset')

      assert.equal(mockMetricsContext.validate.callCount, 1, 'metricsContext.validate was called')
      assert.equal(mockMetricsContext.validate.args[0].length, 0, 'validate was called without arguments')

      assert.equal(mockMetricsContext.setFlowCompleteSignal.callCount, 1, 'metricsContext.setFlowCompleteSignal was called once')
      args = mockMetricsContext.setFlowCompleteSignal.args[0]
      assert.equal(args.length, 1, 'metricsContext.setFlowCompleteSignal was passed one argument')
      assert.deepEqual(args[0], 'account.signed', 'argument was event name')

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
    })
  })
})

describe('/account/create', () => {
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
    mockLog.flowEvent = sinon.spy(() => {
      return P.resolve()
    })
    mockLog.error = sinon.spy()
    const mockMetricsContext = mocks.mockMetricsContext()
    const mockRequest = mocks.mockRequest({
      locale: 'en-GB',
      log: mockLog,
      metricsContext: mockMetricsContext,
      payload: {
        email: TEST_EMAIL,
        authPW: crypto.randomBytes(32).toString('hex'),
        service: 'sync',
        metricsContext: {
          flowBeginTime: Date.now(),
          flowId: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103'
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
      locale: 'en',
      keyFetchTokenId: keyFetchTokenId,
      sessionTokenId: sessionTokenId,
      uaBrowser: 'Firefox',
      uaBrowserVersion: 52,
      uaOS: 'Mac OS X',
      uaOSVersion: '10.10',
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

    const now = Date.now()
    sinon.stub(Date, 'now', () => now)

    return runTest(route, mockRequest, () => {
      assert.equal(mockDB.createAccount.callCount, 1, 'createAccount was called')

      assert.equal(mockLog.stdout.write.callCount, 1, 'an sqs event was logged')
      var eventData = JSON.parse(mockLog.stdout.write.getCall(0).args[0])
      assert.equal(eventData.event, 'login', 'it was a login event')
      assert.equal(eventData.data.service, 'sync', 'it was for sync')
      assert.equal(eventData.data.email, TEST_EMAIL, 'it was for the correct email')
      assert.deepEqual(eventData.data.metricsContext, {
        flowCompleteSignal: 'account.signed',
        flow_id: mockRequest.payload.metricsContext.flowId,
        flow_time: now - mockRequest.payload.metricsContext.flowBeginTime,
        time: now
      }, 'it contained the correct metrics context metadata')

      assert.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
      var args = mockLog.activityEvent.args[0]
      assert.equal(args.length, 1, 'log.activityEvent was passed one argument')
      assert.deepEqual(args[0], {
        event: 'account.created',
        service: 'sync',
        userAgent: 'test user-agent',
        uid: uid.toString('hex')
      }, 'event data was correct')

      assert.equal(mockLog.flowEvent.callCount, 1, 'log.flowEvent was called once')
      args = mockLog.flowEvent.args[0]
      assert.equal(args.length, 1, 'log.flowEvent was passed one argument')
      assert.deepEqual(args[0], {
        event: 'account.created',
        flowCompleteSignal: 'account.signed',
        flow_time: now - mockRequest.payload.metricsContext.flowBeginTime,
        flow_id: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
        locale: 'en-GB',
        time: now,
        uid: uid.toString('hex'),
        userAgent: 'test user-agent'
      }, 'flow event data was correct')

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

      assert.equal(mockMailer.sendVerifyCode.callCount, 1, 'mailer.sendVerifyCode was called')
      args = mockMailer.sendVerifyCode.args[0]
      assert.equal(args[2].location.city, 'Mountain View')
      assert.equal(args[2].location.country, 'United States')
      assert.equal(args[2].uaBrowser, 'Firefox')
      assert.equal(args[2].uaBrowserVersion, '52')
      assert.equal(args[2].uaOS, 'Mac OS X')
      assert.equal(args[2].uaOSVersion, '10.10')
      assert.strictEqual(args[2].uaDeviceType, undefined)

      assert.equal(mockLog.error.callCount, 0)

      mockRequest.query._createdAt = Date.now()
      return runTest(route, mockRequest, () => {
        assert.equal(mockLog.error.callCount, 1)
        const args = mockLog.error.args[0]
        assert.equal(args.length, 1)
        assert.equal(args[0].op, 'account.create.createSessionToken')
        assert.ok(args[0].err instanceof Error)
        assert.equal(args[0].err.message, 'Unexpected _createdAt query parameter')
        assert.equal(args[0]._createdAt, mockRequest.query._createdAt)
        assert.equal(args[0].userAgent, 'test user-agent')
        assert.equal(args[0].service, 'sync')
      })
    }).finally(() => Date.now.restore())
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
      codeLifetime: 1000
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
  const mockMetricsContext = mocks.mockMetricsContext()

  const mockRequest = mocks.mockRequest({
    log: mockLog,
    metricsContext: mockMetricsContext,
    payload: {
      authPW: crypto.randomBytes(32).toString('hex'),
      email: TEST_EMAIL,
      service: 'sync',
      reason: 'signin',
      metricsContext: {
        flowBeginTime: Date.now(),
        flowId: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103'
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
      email: TEST_EMAIL,
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
    uaBrowser: 'Firefox',
    uaBrowserVersion: 50,
    uaOS: 'Android',
    uaOSVersion: '6',
    uaDeviceType: 'mobile',
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

  afterEach(() => {
    mockLog.activityEvent.reset()
    mockLog.flowEvent.reset()
    mockLog.stdout.write.reset()
    mockMailer.sendNewDeviceLoginNotification = sinon.spy(() => P.resolve([]))
    mockMailer.sendVerifyLoginEmail.reset()
    mockMailer.sendVerifyCode.reset()
    mockDB.createSessionToken.reset()
    mockDB.sessions.reset()
    mockMetricsContext.stash.reset()
    mockMetricsContext.validate.reset()
    mockMetricsContext.setFlowCompleteSignal.reset()
    mockDB.emailRecord = defaultEmailRecord
    mockDB.emailRecord.reset()
    mockRequest.payload.email = TEST_EMAIL
  })

  it('emits the correct series of calls and events', function () {
    const now = Date.now()
    sinon.stub(Date, 'now', () => now)

    return runTest(route, mockRequest, function (response) {
      assert.equal(mockDB.emailRecord.callCount, 1, 'db.emailRecord was called')
      assert.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')

      assert.equal(mockLog.stdout.write.callCount, 1, 'an sqs event was logged')
      var eventData = JSON.parse(mockLog.stdout.write.getCall(0).args[0])
      assert.equal(eventData.event, 'login', 'it was a login event')
      assert.equal(eventData.data.service, 'sync', 'it was for sync')
      assert.equal(eventData.data.email, TEST_EMAIL, 'it was for the correct email')
      assert.deepEqual(eventData.data.metricsContext, {
        time: now,
        flow_id: mockRequest.payload.metricsContext.flowId,
        flow_time: now - mockRequest.payload.metricsContext.flowBeginTime,
        flowCompleteSignal: 'account.signed'
      }, 'metrics context was correct')

      assert.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
      let args = mockLog.activityEvent.args[0]
      assert.equal(args.length, 1, 'log.activityEvent was passed one argument')
      assert.deepEqual(args[0], {
        event: 'account.login',
        service: 'sync',
        userAgent: 'test user-agent',
        uid: uid.toString('hex')
      }, 'event data was correct')

      assert.equal(mockLog.flowEvent.callCount, 2, 'log.flowEvent was called twice')
      args = mockLog.flowEvent.args[0]
      assert.equal(args.length, 1, 'log.flowEvent was passed one argument first time')
      assert.deepEqual(args[0], {
        event: 'account.login',
        flow_time: now - mockRequest.payload.metricsContext.flowBeginTime,
        flow_id: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
        flowCompleteSignal: 'account.signed',
        locale: 'en-US',
        time: now,
        uid: uid.toString('hex'),
        userAgent: 'test user-agent'
      }, 'first flow event was correct')
      args = mockLog.flowEvent.args[1]
      assert.equal(args.length, 1, 'log.flowEvent was passed one argument second time')
      assert.deepEqual(args[0], {
        event: 'email.confirmation.sent',
        flow_time: now - mockRequest.payload.metricsContext.flowBeginTime,
        flow_id: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
        flowCompleteSignal: 'account.signed',
        locale: 'en-US',
        time: now,
        uid: undefined,
        userAgent: 'test user-agent'
      }, 'second flow event was correct')

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
      assert.ok(/^[0-9a-f]{32}$/.test(args[0].id), 'argument was synthesized token verification id')
      assert.deepEqual(args[0].uid, uid, 'tokenVerificationId uid was correct')
      assert.equal(mockMetricsContext.stash.thisValues[1], mockRequest, 'this was request')

      args = mockMetricsContext.stash.args[2]
      assert.equal(args.length, 1, 'metricsContext.stash was passed one argument third time')
      assert.deepEqual(args[0].tokenId, keyFetchTokenId, 'argument was key fetch token')
      assert.deepEqual(args[0].uid, uid, 'keyFetchToken.uid was correct')
      assert.equal(mockMetricsContext.stash.thisValues[1], mockRequest, 'this was request')

      assert.equal(mockMetricsContext.setFlowCompleteSignal.callCount, 1, 'metricsContext.setFlowCompleteSignal was called once')
      args = mockMetricsContext.setFlowCompleteSignal.args[0]
      assert.equal(args.length, 1, 'metricsContext.setFlowCompleteSignal was passed one argument')
      assert.deepEqual(args[0], 'account.signed', 'argument was event name')

      assert.equal(mockMailer.sendVerifyLoginEmail.callCount, 1, 'mailer.sendVerifyLoginEmail was called')
      args = mockMailer.sendVerifyLoginEmail.args[0]
      assert.equal(args[2].location.city, 'Mountain View')
      assert.equal(args[2].location.country, 'United States')
      assert.equal(args[2].timeZone, 'America/Los_Angeles')
      assert.equal(args[2].uaBrowser, 'Firefox')
      assert.equal(args[2].uaBrowserVersion, '50')
      assert.equal(args[2].uaOS, 'Android')
      assert.equal(args[2].uaOSVersion, '6')
      assert.equal(args[2].uaDeviceType, 'mobile')

      assert.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
      assert.ok(! response.verified, 'response indicates account is not verified')
      assert.equal(response.verificationMethod, 'email', 'verificationMethod is email')
      assert.equal(response.verificationReason, 'login', 'verificationReason is login')
    }).finally(() => Date.now.restore())
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
        assert.notEqual(verifyCallArgs[1], emailCode, 'mailer.sendVerifyCode was called with a fresh verification code')
        assert.equal(mockLog.flowEvent.callCount, 2, 'log.flowEvent was called twice')
        assert.equal(mockLog.flowEvent.args[0][0].event, 'account.login', 'first event was login')
        assert.equal(mockLog.flowEvent.args[1][0].event, 'email.verification.sent', 'second event was sent')
        assert.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
        assert.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        assert.equal(response.verified, false, 'response indicates account is unverified')
        assert.equal(response.verificationMethod, 'email', 'verificationMethod is email')
        assert.equal(response.verificationReason, 'signup', 'verificationReason is signup')
        assert.equal(response.emailSent, true, 'email sent')
      })
    })
  })

  describe('sign-in confirmation', function () {
    before(() => {
      config.signinConfirmation.forcedEmailAddresses = /.+@mozilla\.com$/

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

    it('is enabled by default', function () {
      return runTest(route, mockRequest, function (response) {
        assert.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')
        var tokenData = mockDB.createSessionToken.getCall(0).args[0]
        assert.ok(tokenData.mustVerify, 'sessionToken must be verified before use')
        assert.ok(tokenData.tokenVerificationId, 'sessionToken was created unverified')
        assert.equal(mockMailer.sendVerifyCode.callCount, 0, 'mailer.sendVerifyCode was not called')
        assert.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        assert.ok(! response.verified, 'response indicates account is not verified')
        assert.equal(response.verificationMethod, 'email', 'verificationMethod is email')
        assert.equal(response.verificationReason, 'login', 'verificationReason is login')

        assert.equal(mockMailer.sendVerifyLoginEmail.callCount, 1, 'mailer.sendVerifyLoginEmail was called')
        assert.equal(mockMailer.sendVerifyLoginEmail.getCall(0).args[2].location.city, 'Mountain View')
        assert.equal(mockMailer.sendVerifyLoginEmail.getCall(0).args[2].location.country, 'United States')
        assert.equal(mockMailer.sendVerifyLoginEmail.getCall(0).args[2].timeZone, 'America/Los_Angeles')
      })
    })

    it('does not require verification when keys are not requested', function () {
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
        assert.ok(! tokenData.mustVerify, 'sessionToken does not have to be verified')
        assert.ok(tokenData.tokenVerificationId, 'sessionToken was created unverified')
        // Note that *neither* email is sent in this case,
        // since it can't have been a new device connection.
        assert.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        assert.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')

        assert.equal(mockMetricsContext.setFlowCompleteSignal.callCount, 1, 'metricsContext.setFlowCompleteSignal was called once')
        assert.deepEqual(mockMetricsContext.setFlowCompleteSignal.args[0][0], 'account.login', 'argument was event name')

        assert.ok(response.verified, 'response indicates account is verified')
        assert.ok(! response.verificationMethod, 'verificationMethod doesn\'t exist')
        assert.ok(! response.verificationReason, 'verificationReason doesn\'t exist')
      })
    })

    it('unverified account gets account confirmation email', function () {
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
        assert.ok(! response.verified, 'response indicates account is not verified')
        assert.equal(response.verificationMethod, 'email', 'verificationMethod is email')
        assert.equal(response.verificationReason, 'signup', 'verificationReason is signup')
        assert.equal(response.emailSent, true, 'response indicates an email was sent')
      })
    })

    describe('skip for new accounts', function () {
      function setup(enabled, accountCreatedSince) {
        config.signinConfirmation.skipForNewAccounts = {
          enabled: enabled,
          maxAge: 5
        }

        mockDB.emailRecord = function () {
          return P.resolve({
            authSalt: crypto.randomBytes(32),
            createdAt: Date.now() - accountCreatedSince,
            data: crypto.randomBytes(32),
            email: mockRequest.payload.email,
            emailVerified: true,
            kA: crypto.randomBytes(32),
            lastAuthAt: function () {
              return Date.now()
            },
            uid: uid,
            wrapWrapKb: crypto.randomBytes(32)
          })
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

        route = getRoute(accountRoutes, '/account/login')
      }

      it('is disabled', function () {
        setup(false)

        return runTest(route, mockRequest, function (response) {
          assert.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')
          var tokenData = mockDB.createSessionToken.getCall(0).args[0]
          assert.ok(tokenData.mustVerify, 'sessionToken must be verified before use')
          assert.ok(tokenData.tokenVerificationId, 'sessionToken was created unverified')
          assert.equal(mockMailer.sendVerifyCode.callCount, 0, 'mailer.sendVerifyCode was not called')
          assert.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
          assert.ok(! response.verified, 'response indicates account is not verified')
          assert.equal(response.verificationMethod, 'email', 'verificationMethod is email')
          assert.equal(response.verificationReason, 'login', 'verificationReason is login')

          assert.equal(mockMailer.sendVerifyLoginEmail.callCount, 1, 'mailer.sendVerifyLoginEmail was called')
          assert.equal(mockMailer.sendVerifyLoginEmail.getCall(0).args[2].location.city, 'Mountain View')
          assert.equal(mockMailer.sendVerifyLoginEmail.getCall(0).args[2].location.country, 'United States')
          assert.equal(mockMailer.sendVerifyLoginEmail.getCall(0).args[2].timeZone, 'America/Los_Angeles')
        })
      })


      it('skip sign-in confirmation on recently created account', function () {
        setup(true, 0)

        return runTest(route, mockRequest, function (response) {
          assert.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')
          var tokenData = mockDB.createSessionToken.getCall(0).args[0]
          assert.equal(tokenData.tokenVerificationId, null, 'sessionToken was created verified')
          assert.equal(mockMailer.sendVerifyCode.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
          assert.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 1, 'mailer.sendNewDeviceLoginNotification was called')
          assert.ok(response.verified, 'response indicates account is verified')
        })
      })

      it('do not error if new device login notification is blocked', function () {
        setup(true, 0)

        mockMailer.sendNewDeviceLoginNotification = sinon.spy(() => P.reject(error.emailBouncedHard()))

        return runTest(route, mockRequest, function (response) {
          assert.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')
          var tokenData = mockDB.createSessionToken.getCall(0).args[0]
          assert.equal(tokenData.tokenVerificationId, null, 'sessionToken was created verified')
          assert.equal(mockMailer.sendVerifyCode.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
          assert.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 1, 'mailer.sendNewDeviceLoginNotification was called')
          assert.ok(response.verified, 'response indicates account is verified')
        })
      })


      it('don\'t skip sign-in confirmation on older account', function () {
        setup(true, 10)

        return runTest(route, mockRequest, function (response) {
          assert.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')
          var tokenData = mockDB.createSessionToken.getCall(0).args[0]
          assert.ok(tokenData.tokenVerificationId, 'sessionToken was created unverified')
          assert.equal(mockMailer.sendVerifyLoginEmail.callCount, 1, 'mailer.sendVerifyLoginEmail was called')
          assert.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
          assert.ok(! response.verified, 'response indicates account is unverified')
        })
      })
    })
  })

  it('creating too many sessions causes an error to be logged', function () {
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

        assert.equal(!! record, true, 'log.info was called for Account.history')
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

        assert.equal(!! record, true, 'log.info was called for Account.history')
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

      beforeEach(() => {
        mockLog.activityEvent.reset()
        mockLog.flowEvent.reset()
      })

      after(() => {
        mockCustoms.check = oldCheck
      })

      describe('signin unblock enabled', () => {
        before(() => {
          mockLog.flowEvent.reset()
        })

        it('without unblock code', () => {
          return runTest(route, mockRequest).then(() => assert.ok(false), err => {
            assert.equal(err.errno, error.ERRNO.REQUEST_BLOCKED, 'correct errno is returned')
            assert.equal(err.output.statusCode, 400, 'correct status code is returned')
            assert.equal(err.output.payload.verificationMethod, 'email-captcha')
            assert.equal(err.output.payload.verificationReason, 'login')
            assert.equal(mockLog.flowEvent.callCount, 1, 'log.flowEvent called once')
            assert.equal(mockLog.flowEvent.args[0][0].event, 'account.login.blocked', 'first event is blocked')
            mockLog.flowEvent.reset()
          })
        })

        describe('with unblock code', () => {

          it('invalid code', () => {
            mockDB.consumeUnblockCode = () => P.reject(error.invalidUnblockCode())
            return runTest(route, mockRequestWithUnblockCode).then(() => assert.ok(false), err => {
              assert.equal(err.errno, error.ERRNO.INVALID_UNBLOCK_CODE, 'correct errno is returned')
              assert.equal(err.output.statusCode, 400, 'correct status code is returned')
              assert.equal(mockLog.flowEvent.callCount, 2, 'log.flowEvent called twice')
              assert.equal(mockLog.flowEvent.args[1][0].event, 'account.login.invalidUnblockCode', 'second event is invalid')

              mockLog.flowEvent.reset()
            })
          })

          it('expired code', () => {
            // test 5 seconds old, to reduce flakiness of test
            mockDB.consumeUnblockCode = () => P.resolve({ createdAt: Date.now() - (config.signinUnblock.codeLifetime + 5000) })
            return runTest(route, mockRequestWithUnblockCode).then(() => assert.ok(false), err => {
              assert.equal(err.errno, error.ERRNO.INVALID_UNBLOCK_CODE, 'correct errno is returned')
              assert.equal(err.output.statusCode, 400, 'correct status code is returned')

              assert.equal(mockLog.flowEvent.callCount, 2, 'log.flowEvent called twice')
              assert.equal(mockLog.flowEvent.args[1][0].event, 'account.login.invalidUnblockCode', 'second event is invalid')

              mockLog.activityEvent.reset()
              mockLog.flowEvent.reset()
            })
          })

          it('unknown account', () => {
            mockDB.emailRecord = () => P.reject(new error.unknownAccount())
            return runTest(route, mockRequestWithUnblockCode).then(() => assert(false), err => {
              assert.equal(err.errno, error.ERRNO.REQUEST_BLOCKED)
              assert.equal(err.output.statusCode, 400)
            })
          })

          it('valid code', () => {
            mockDB.consumeUnblockCode = () => P.resolve({ createdAt: Date.now() })
            return runTest(route, mockRequestWithUnblockCode, (res) => {
              assert.equal(mockLog.flowEvent.callCount, 4)
              assert.equal(mockLog.flowEvent.args[0][0].event, 'account.login.blocked', 'first event was account.login.blocked')
              assert.equal(mockLog.flowEvent.args[1][0].event, 'account.login.confirmedUnblockCode', 'second event was account.login.confirmedUnblockCode')
              assert.equal(mockLog.flowEvent.args[2][0].event, 'account.login', 'third event was account.login')
              assert.equal(mockLog.flowEvent.args[3][0].event, 'flow.complete', 'fourth event was flow.complete')
            })
          })
        })
      })
    })

    describe('cannot unblock', () => {
      const oldCheck = mockCustoms.check
      before(() => {
        mockCustoms.check = () => P.reject(error.requestBlocked(false))
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
      assert.equal(args.length, 1, 'log.activityEvent was passed one argument')
      assert.deepEqual(args[0], {
        event: 'account.keyfetch',
        service: undefined,
        userAgent: 'test user-agent',
        uid: uid.toString('hex')
      }, 'event data was correct')
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
      assert.equal(args.length, 1, 'log.activityEvent was passed one argument')
      assert.deepEqual(args[0], {
        event: 'account.deleted',
        service: undefined,
        userAgent: 'test user-agent',
        uid: uid.toString('hex')
      }, 'event data was correct')
    })
  })
})


describe('/account/sessions', function () {
  var testSession = {
    tokenId: 'foo',
    uid: '010',
    createdAt: Date.now(),
    uaOS: 'Windows',
    uaOSVersion: '10',
    uaDeviceType: 'desktop',
    lastAccessTime: Date.now(),

    uaBrowser: 'Firefox',
    uaBrowserVersion: '50',

    deviceId: 'deviceId',
    deviceName: 'deviceName',
    deviceType: 'desktop',
    deviceCreatedAt: Date.now(),
    devicePushCallback: 'foo',
    devicePushPublicKey: 'bar',
    devicePushAuthKey: 'authKey',
  }
  var mockDB = mocks.mockDB()
  mockDB.sessions = sinon.spy(function () {
    return P.resolve([
      Object.assign({}, testSession)
    ])
  })

  var mockRequest = mocks.mockRequest({
    credentials: {
      uid: crypto.randomBytes(16),
      tokenId: crypto.randomBytes(16)
    },
    payload: {}
  })

  var accountRoutes = makeRoutes({
    db: mockDB
  })


  it('should list account sessions', () => {
    var route = getRoute(accountRoutes, '/account/sessions')

    return runTest(route, mockRequest, function (res) {
      assert.equal(res.length, 1)
      assert.equal(Object.keys(res[0]).length, 12)
      var s = res[0]
      assert.equal(s.id, testSession.tokenId)
      assert.equal(s.deviceName, testSession.deviceName)
      assert.equal(s.deviceType, testSession.deviceType)
      assert.equal(s.devicePushCallback, testSession.devicePushCallback)
      assert.equal(s.devicePushPublicKey, testSession.devicePushPublicKey)
      assert.equal(s.devicePushAuthKey, testSession.devicePushAuthKey)
      assert.equal(s.id, testSession.tokenId)
      assert.equal(s.isCurrentDevice, false)
      assert.equal(s.isDevice, true)
      assert.equal(s.lastAccessTimeFormatted, 'a few seconds ago')
      assert.equal(s.userAgent, 'Firefox 50')
    })

  })

})
