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

var TEST_EMAIL = 'foo@gmail.com'
var TEST_EMAIL_ADDITIONAL = 'foo2@gmail.com'
var TEST_EMAIL_INVALID = 'example@dotless-domain'
const MS_IN_DAY = 1000 * 60 * 60 * 24

var makeRoutes = function (options, requireMocks) {
  options = options || {}

  var config = options.config || {}
  config.verifierVersion = config.verifierVersion || 0
  config.smtp = config.smtp ||  {}
  config.memcached = config.memcached || {
    address: 'none',
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
  config.secondaryEmail = config.secondaryEmail || {}
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
    mocks.mockBounces(),
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

describe('/recovery_email/status', function () {
  var config = {
    secondaryEmail: {
      enabled: true,
      enabledEmailAddresses: /\w/
    }
  }
  var mockDB = mocks.mockDB()
  var pushCalled
  var mockLog = mocks.mockLog({
    info: function (data) {
      if (data.name === 'recovery_email_reason.push') {
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

  var mockRequest = mocks.mockRequest({
    credentials: {
      uid: uuid.v4('binary').toString('hex'),
      email: TEST_EMAIL
    }
  })

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

describe('/recovery_email/resend_code', () => {
  const config = {
    secondaryEmail: {
      enabled: true,
      enabledEmailAddresses: /\w/
    }
  }
  const secondEmailCode = crypto.randomBytes(16)
  const mockDB = mocks.mockDB({secondEmailCode: secondEmailCode})
  const mockLog = mocks.mockLog()
  mockLog.flowEvent = sinon.spy(() => {
    return P.resolve()
  })
  const mockMailer = mocks.mockMailer()
  const mockMetricsContext = mocks.mockMetricsContext()
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
        tokenVerified: false,
        uaBrowser: 'Firefox',
        uaBrowserVersion: 52,
        uaOS: 'Mac OS X',
        uaOSVersion: '10.10'
      },
      query: {},
      payload: {
        metricsContext: {
          flowBeginTime: Date.now(),
          flowId: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103'
        }
      }
    })

    return runTest(route, mockRequest, response => {
      assert.equal(mockLog.flowEvent.callCount, 1, 'log.flowEvent called once')
      assert.equal(mockLog.flowEvent.args[0][0].event, 'email.verification.resent')

      assert.equal(mockMailer.sendVerifyCode.callCount, 1)
      const args = mockMailer.sendVerifyCode.args[0]
      assert.equal(args[2].uaBrowser, 'Firefox')
      assert.equal(args[2].uaBrowserVersion, '52')
      assert.equal(args[2].uaOS, 'Mac OS X')
      assert.equal(args[2].uaOSVersion, '10.10')
      assert.strictEqual(args[2].uaDeviceType, undefined)
    })
      .then(() => {
        mockMailer.sendVerifyCode.reset()
        mockLog.flowEvent.reset()
      })
  })

  it('verification additional email', () => {
    const mockRequest = mocks.mockRequest({
      log: mockLog,
      metricsContext: mockMetricsContext,
      credentials: {
        uid: uuid.v4('binary').toString('hex'),
        email: TEST_EMAIL,
        emailVerified: true,
        tokenVerified: false,
        uaBrowser: 'Firefox',
        uaBrowserVersion: '50',
        uaOS: 'Android',
        uaOSVersion: '6',
        uaDeviceType: 'tablet'
      },
      query: {},
      payload: {
        email : 'secondEmail@email.com'
      }
    })

    return runTest(route, mockRequest, response => {
      assert.equal(mockMailer.sendVerifySecondaryEmail.callCount, 1)
      assert.equal(mockMailer.sendVerifyCode.callCount, 0)
      assert.equal(mockMailer.sendVerifyLoginEmail.callCount, 0)
      const args = mockMailer.sendVerifySecondaryEmail.getCall(0).args
      assert.equal(args[2].code, secondEmailCode, 'email code set')
    })
      .then(() => {
        mockMailer.sendVerifySecondaryEmail.reset()
        mockLog.flowEvent.reset()
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
        tokenVerified: false,
        uaBrowser: 'Firefox',
        uaBrowserVersion: '50',
        uaOS: 'Android',
        uaOSVersion: '6',
        uaDeviceType: 'tablet'
      },
      query: {},
      payload: {
        metricsContext: {
          flowBeginTime: Date.now(),
          flowId: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103'
        }
      }
    })
    mockLog.flowEvent.reset()

    return runTest(route, mockRequest, response => {
      assert.equal(mockLog.flowEvent.callCount, 1, 'log.flowEvent called once')
      assert.equal(mockLog.flowEvent.args[0][0].event, 'email.confirmation.resent')

      assert.equal(mockMailer.sendVerifyLoginEmail.callCount, 1)
      const args = mockMailer.sendVerifyLoginEmail.args[0]
      assert.equal(args[2].uaBrowser, 'Firefox')
      assert.equal(args[2].uaBrowserVersion, '50')
      assert.equal(args[2].uaOS, 'Android')
      assert.equal(args[2].uaOSVersion, '6')
      assert.strictEqual(args[2].uaDeviceType, 'tablet')
    })
  })

})

describe('/recovery_email/verify_code', function () {
  const uid = uuid.v4('binary').toString('hex')
  const mockLog = mocks.spyLog()
  const mockRequest = mocks.mockRequest({
    log: mockLog,
    metricsContext: mocks.mockMetricsContext({
      gather (data) {
        return Promise.resolve(Object.assign(data, {
          flowCompleteSignal: 'account.signed',
          flow_time: 10000,
          flow_id: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          time: Date.now() - 10000
        }))
      }
    }),
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
    secondEmail: 'test@email.com',
    secondEmailCode: crypto.randomBytes(16).toString('hex'),
    uid: uid
  }
  var dbErrors = {
    verifyTokens: error.invalidVerificationCode({})
  }
  var mockDB = mocks.mockDB(dbData, dbErrors)
  var mockMailer = mocks.mockMailer()
  const mockPush = mocks.mockPush()
  var mockCustoms = mocks.mockCustoms()
  let marketingOptIn = false
  const mockMarketingCache = {
    get: sinon.spy(() => P.resolve(marketingOptIn))
  }
  const requireMocks = {
    '../cache': () => mockMarketingCache
  }
  var accountRoutes = makeRoutes({
    checkPassword: function () {
      return P.resolve(true)
    },
    config: {
      secondaryEmail: {
        enabled: true,
        enabledEmailAddresses: /\w/
      }
    },
    customs: mockCustoms,
    db: mockDB,
    log: mockLog,
    mailer: mockMailer,
    push: mockPush
  }, requireMocks)
  var route = getRoute(accountRoutes, '/recovery_email/verify_code')
  describe('verifyTokens rejects with INVALID_VERIFICATION_CODE', function () {

    it('without a reminder payload', function () {
      return runTest(route, mockRequest, function (response) {
        assert.equal(mockDB.verifyTokens.callCount, 1, 'calls verifyTokens')
        assert.equal(mockDB.verifyEmail.callCount, 1, 'calls verifyEmail')
        assert.equal(mockCustoms.check.callCount, 1, 'calls customs.check')

        assert.equal(mockLog.notifyAttachedServices.callCount, 1, 'logs verified')
        let args = mockLog.notifyAttachedServices.args[0]
        assert.equal(args[0], 'verified')
        assert.equal(args[2].uid, uid)
        assert.equal(args[2].marketingOptIn, undefined)

        assert.equal(mockMailer.sendPostVerifyEmail.callCount, 1, 'sendPostVerifyEmail was called once')

        assert.equal(mockLog.activityEvent.callCount, 1, 'activityEvent was called once')
        args = mockLog.activityEvent.args[0]
        assert.equal(args.length, 1, 'log.activityEvent was passed one argument')
        assert.deepEqual(args[0], {
          event: 'account.verified',
          service: 'sync',
          userAgent: 'test user-agent',
          uid: uid.toString('hex')
        }, 'event data was correct')

        assert.equal(mockLog.flowEvent.callCount, 2, 'flowEvent was called twice')
        assert.equal(mockLog.flowEvent.args[0][0].event, 'email.verify_code.clicked', 'first event was email.verify_code.clicked')
        assert.equal(mockLog.flowEvent.args[1][0].event, 'account.verified', 'second event was event account.verified')

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

    it('with marketingOptIn', () => {
      marketingOptIn = true
      return runTest(route, mockRequest, function (response) {
        assert.equal(mockLog.notifyAttachedServices.callCount, 1, 'logs verified')
        const args = mockLog.notifyAttachedServices.args[0]
        assert.equal(args[0], 'verified')
        assert.equal(args[2].uid, uid)
        assert.equal(args[2].marketingOptIn, true)

        assert.equal(JSON.stringify(response), '{}')
      })
        .then(function () {
          marketingOptIn = false
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
        assert.equal(mockLog.flowEvent.args[0][0].event, 'email.verify_code.clicked', 'first event was email.verify_code.clicked')
        assert.equal(mockLog.flowEvent.args[1][0].event, 'account.verified', 'second event was account.verified')
        assert.equal(mockLog.flowEvent.args[2][0].event, 'account.reminder', 'third event was account.reminder')

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
        assert.equal(mockPush.notifyDeviceConnected.callCount, 0, 'mockPush.notifyDeviceConnected should not have been called (no devices)')
      })
        .then(function () {
          mockDB.verifyTokens.reset()
        })
    })

    it('email verification with associated device', function () {
      mockDB.deviceFromTokenVerificationId = function (uid, tokenVerificationId) {
        return P.resolve({
          name: 'my device',
          id: '123456789',
          type: 'desktop'
        })
      }
      return runTest(route, mockRequest, function (response) {
        assert.equal(mockDB.verifyTokens.callCount, 1, 'call db.verifyTokens')
        assert.equal(mockDB.verifyEmail.callCount, 0, 'does not call db.verifyEmail')
        assert.equal(mockLog.notifyAttachedServices.callCount, 0, 'does not call log.notifyAttachedServices')
        assert.equal(mockLog.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(mockPush.notifyUpdate.callCount, 0, 'mockPush.notifyUpdate should not have been called')
        assert.equal(mockPush.notifyDeviceConnected.callCount, 1, 'mockPush.notifyDeviceConnected should have been called')
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
        assert.equal(args.length, 1, 'log.activityEvent was passed one argument')
        assert.deepEqual(args[0], {
          event: 'account.confirmed',
          service: 'sync',
          userAgent: 'test user-agent',
          uid: uid.toString('hex')
        }, 'event data was correct')

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

    it('secondary email verification', function () {
      dbData.emailCode = crypto.randomBytes(16).toString('hex')
      mockRequest.payload.code = dbData.secondEmailCode.toString('hex')
      mockRequest.payload.type = 'secondary'
      mockRequest.payload.verifiedEmail = dbData.secondEmail

      return runTest(route, mockRequest, function (response) {
        assert.equal(mockDB.verifyEmail.callCount, 1, 'call db.verifyEmail')
        var args = mockDB.verifyEmail.args[0]
        assert.equal(args.length, 2, 'mockDB.verifyEmail was passed correct arguments')
        assert.equal(args[0].email, dbData.email, 'correct account primary email was passed')
        assert.equal(args[1].toString('hex'), dbData.secondEmailCode.toString('hex'), 'correct email code was passed')

        assert.equal(mockMailer.sendPostVerifySecondaryEmail.callCount, 1, 'call mailer.sendPostVerifySecondaryEmail')
        args = mockMailer.sendPostVerifySecondaryEmail.args[0]
        assert.equal(args.length, 3, 'mockMailer.sendPostVerifySecondaryEmail was passed correct arguments')
        assert.equal(args[1].email, dbData.email, 'correct account primary email was passed')
        assert.equal(args[2].secondaryEmail, dbData.secondEmail, 'correct secondary email was passed')
      })
        .then(function () {
          mockDB.verifyEmail.reset()
          mockLog.activityEvent.reset()
          mockMailer.sendPostVerifySecondaryEmail.reset()
          mockPush.notifyUpdate.reset()
        })
    })
  })
})

describe('/recovery_email', () => {
  const uid = uuid.v4('binary').toString('hex')
  const mockLog = mocks.spyLog()
  let dbData, accountRoutes, mockDB, mockRequest, route
  const mockMailer = mocks.mockMailer()
  const mockPush = mocks.mockPush()
  const mockCustoms = mocks.mockCustoms()

  beforeEach(() => {
    mockRequest = mocks.mockRequest({
      credentials: {
        uid: uuid.v4('binary').toString('hex'),
        email: TEST_EMAIL,
        emailVerified: true,
        normalizedEmail: TEST_EMAIL.toLowerCase()
      },
      log: mockLog,
      payload: {
        email: TEST_EMAIL_ADDITIONAL
      }
    })
    dbData = {
      email: TEST_EMAIL,
      uid: uid,
      secondEmail: TEST_EMAIL_ADDITIONAL
    }
    mockDB = mocks.mockDB(dbData)
    accountRoutes = makeRoutes({
      checkPassword: function () {
        return P.resolve(true)
      },
      config: {
        secondaryEmail: {
          enabled: true,
          enabledEmailAddresses: /\w/,
          minUnverifiedAccountTime: MS_IN_DAY
        }
      },
      customs: mockCustoms,
      db: mockDB,
      log: mockLog,
      mailer: mockMailer,
      push: mockPush
    })
  })

  describe('/recovery_email', () => {
    beforeEach(() => {
      mockDB.emailRecord = sinon.spy(() => {
        return P.reject(error.unknownAccount())
      })
    })

    it('should create email on account', () => {
      route = getRoute(accountRoutes, '/recovery_email')
      return runTest(route, mockRequest, (response) => {
        assert.ok(response)
        assert.equal(mockDB.createEmail.callCount, 1, 'call db.createEmail')
        assert.equal(mockMailer.sendVerifySecondaryEmail.callCount, 1, 'call db.sendVerifySecondaryEmail')
      })
        .then(function () {
          mockDB.createEmail.reset()
          mockMailer.sendVerifySecondaryEmail.reset()
        })
    })

    it('should fail with unverified primary email', () => {
      route = getRoute(accountRoutes, '/recovery_email')
      mockRequest.auth.credentials.emailVerified = false
      return runTest(route, mockRequest, () => {
        assert.fail(new Error('Should have failed adding secondary email with unverified primary email'))
      })
        .catch((err) => {
          assert.equal(err.errno, 104, 'unverified account')
        })
        .then(function () {
          mockDB.createEmail.reset()
        })
    })

    it('should fail when adding secondary email that is same as primary', () => {
      route = getRoute(accountRoutes, '/recovery_email')
      mockRequest.payload.email = TEST_EMAIL
      return runTest(route, mockRequest, () => {
        assert.fail(new Error('Should have failed when adding secondary email that is same as primary'))
      })
        .catch((err) => {
          assert.equal(err.errno, 139, 'cannot add secondary email, same as primary')
        })
        .then(function () {
          mockDB.createEmail.reset()
        })
    })

    it('creates secondary email if another user unverified primary more than day old, deletes unverified account', () => {
      mockDB.emailRecord = sinon.spy(() => {
        return P.resolve({
          emailVerified: false,
          createdAt: Date.now() - MS_IN_DAY,
          uid: crypto.randomBytes(16)
        })
      })
      route = getRoute(accountRoutes, '/recovery_email')
      mockRequest.payload.email = TEST_EMAIL_ADDITIONAL
      return runTest(route, mockRequest, (response) => {
        assert.ok(response)
        assert.equal(mockDB.deleteAccount.callCount, 1, 'call db.deleteAccount')
        assert.equal(mockDB.createEmail.callCount, 1, 'call db.createEmail')
        const args = mockDB.createEmail.getCall(0).args
        assert.equal(args[1].email, TEST_EMAIL_ADDITIONAL, 'call db.createEmail with correct email')
        assert.equal(mockMailer.sendVerifySecondaryEmail.callCount, 1, 'call mailer.sendVerifySecondaryEmail')
      })
        .then(function () {
          mockDB.deleteAccount.reset()
          mockDB.createEmail.reset()
          mockMailer.sendVerifySecondaryEmail.reset()
        })
    })

    it('fails create email if another user unverified primary less than day old', () => {
      mockDB.emailRecord = sinon.spy(() => {
        return P.resolve({
          emailVerified: false,
          createdAt: Date.now(),
          uid: crypto.randomBytes(16)
        })
      })
      route = getRoute(accountRoutes, '/recovery_email')
      mockRequest.payload.email = TEST_EMAIL_ADDITIONAL
      return runTest(route, mockRequest, () => {
        assert.fail(new Error('Should have failed when creating email'))
      })
        .catch((err) => {
          assert.equal(err.errno, 141, 'cannot add secondary email, newly created primary account')
        })
    })
  })

  describe('/recovery_emails', () => {
    it('should get all account emails', () => {
      route = getRoute(accountRoutes, '/recovery_emails')
      return runTest(route, mockRequest, (response) => {
        assert.equal(response.length, 2, 'should return two emails')
        assert.equal(response[0].email, dbData.email, 'should return users email')
        assert.equal(response[1].email, dbData.secondEmail, 'should return users email')
        assert.equal(mockDB.accountEmails.callCount, 1, 'call db.accountEmails')
      })
        .then(function () {
          mockDB.accountEmails.reset()
        })
    })
  })

  describe('/recovery_email/destroy', () => {
    it('should delete email from account', () => {
      route = getRoute(accountRoutes, '/recovery_email/destroy')
      return runTest(route, mockRequest, (response) => {
        assert.ok(response)
        assert.equal(mockDB.deleteEmail.callCount, 1, 'call db.deleteEmail')
      })
        .then(function () {
          mockDB.deleteEmail.reset()
        })
    })
  })

  describe('can disable feature', () => {
    beforeEach(() => {
      accountRoutes = makeRoutes({
        checkPassword: function () {
          return P.resolve(true)
        },
        config: {
          secondaryEmail: {
            enabled: false,
            enabledEmailAddresses: /\w/
          }
        },
        customs: mockCustoms,
        db: mockDB,
        log: mockLog,
        mailer: mockMailer,
        push: mockPush
      })
    })

    it('/recovery_email/destroy disabled', () => {
      route = getRoute(accountRoutes, '/recovery_email/destroy')
      return runTest(route, mockRequest, () => {
        assert.fail(new Error('Should have failed accessing endpoint'))
      })
        .catch((err) => {
          assert.equal(err.errno, 202, 'correct errno feature disabled')
        })
    })

    it('/recovery_email disabled', () => {
      route = getRoute(accountRoutes, '/recovery_email')
      return runTest(route, mockRequest, () => {
        assert.fail(new Error('Should have failed accessing endpoint'))
      })
        .catch((err) => {
          assert.equal(err.errno, 202, 'correct errno feature disabled')
        })
    })

    it('/recovery_emails disabled', () => {
      route = getRoute(accountRoutes, '/recovery_emails')
      return runTest(route, mockRequest, () => {
        assert.fail(new Error('Should have failed accessing endpoint'))
      })
        .catch((err) => {
          assert.equal(err.errno, 202, 'correct errno feature disabled')
        })
    })
  })

  describe('can check feature enable flag', () => {
    beforeEach(() => {
      accountRoutes = makeRoutes({
        checkPassword: function () {
          return P.resolve(true)
        },
        config: {
          secondaryEmail: {
            enabled: true,
            enabledEmailAddresses: /@mozilla\.com/
          }
        },
        customs: mockCustoms,
        db: mockDB,
        log: mockLog,
        mailer: mockMailer,
        push: mockPush
      })
    })

    it('/recovery_email/check_can_add_secondary_address disabled with unverified session', () => {
      route = getRoute(accountRoutes, '/recovery_email/check_can_add_secondary_address')
      mockRequest.auth.credentials.tokenVerified = false
      mockRequest.auth.credentials.email = 'asdf@mozilla.com'
      return runTest(route, mockRequest, (res) => {
        assert.equal(res.ok, false, 'return ok `false` when feature is not enabled for user')
      })
    })

    it('/recovery_email/check_can_add_secondary_address disabled with invalid email', () => {
      route = getRoute(accountRoutes, '/recovery_email/check_can_add_secondary_address')
      mockRequest.auth.credentials.tokenVerified = true
      mockRequest.auth.credentials.email = 'email@notvalid.com'
      return runTest(route, mockRequest, (res) => {
        assert.equal(res.ok, false, 'return ok `false` when feature is not enabled for user')
      })
    })

    it('/recovery_email/check_can_add_secondary_address enabled with verified session', () => {
      route = getRoute(accountRoutes, '/recovery_email/check_can_add_secondary_address')
      mockRequest.auth.credentials.tokenVerified = true
      mockRequest.auth.credentials.email = 'asdf@mozilla.com'
      return runTest(route, mockRequest, (res) => {
        assert.equal(res.ok, true, 'return ok `true` when feature is enabled for user')
      })
    })
  })

})
