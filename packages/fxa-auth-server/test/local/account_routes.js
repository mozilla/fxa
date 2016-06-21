/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

require('ass')

var sinon = require('sinon')

var test = require('../ptaptest')
var mocks = require('../mocks')
var getRoute = require('../routes_helpers').getRoute

var P = require('../../lib/promise')
var uuid = require('uuid')
var crypto = require('crypto')
var isA = require('joi')
var error = require('../../lib/error')
var log = require('../../lib/log')

var TEST_EMAIL = 'foo@gmail.com'
var TEST_EMAIL_INVALID = 'example@dotless-domain'

var makeRoutes = function (options) {
  options = options || {}

  var config = options.config || {}
  config.verifierVersion = config.verifierVersion || 0
  config.smtp = config.smtp ||  {}

  var log = options.log || mocks.mockLog()
  var Password = require('../../lib/crypto/password')(log, config)
  var db = options.db || {}
  var isPreVerified = require('../../lib/preverifier')(error, config)
  var customs = options.customs || {
    check: function () { return P.resolve(true) }
  }
  var checkPassword = options.checkPassword || require('../../lib/routes/utils/password_check')(log, config, Password, customs, db)
  var push = options.push || require('../../lib/push')(log, db)
  var metricsContext = options.metricsContext || log.metricsContext || require('../../lib/metrics/context')(log, config)
  return require('../../lib/routes/account')(
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

  test('sign-in confirmation disabled', function (t) {
    config.signinConfirmation.enabled = false

    test('invalid email', function (t) {
      var mockRequest = mocks.mockRequest({
        credentials: {
          email: TEST_EMAIL_INVALID
        }
      })

      test('unverified account', function (t) {
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

      test('verified account', function (t) {
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
      }, t)
    }, t)

    test('valid email, verified account', function (t) {
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
    }, t)
  }, t)

  test('sign-in confirmation enabled', function (t) {
    config.signinConfirmation.enabled = true
    config.signinConfirmation.enabled = 1
    var mockRequest = mocks.mockRequest({
      credentials: {
        uid: uuid.v4('binary').toString('hex'),
        email: TEST_EMAIL
      }
    })

    test('verified account, verified session', function (t) {
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
    }, t)

    test('verified account, unverified session', function (t) {
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
    }, t)
  }, t)
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
  var mockPush = mocks.mockPush()
  var accountRoutes = makeRoutes({
    db: mockDB,
    customs: mockCustoms,
    push: mockPush
  })
  var route = getRoute(accountRoutes, '/account/reset')

  return runTest(route, mockRequest, function () {
    t.equal(mockDB.resetAccount.callCount, 1)

    t.equal(mockPush.notifyUpdate.callCount, 1)
    t.equal(mockPush.notifyUpdate.firstCall.args[0], uid.toString('hex'))
    t.equal(mockPush.notifyUpdate.firstCall.args[1], 'passwordReset')

    t.equal(mockDB.account.callCount, 1)
    t.equal(mockCustoms.reset.callCount, 1)
  })
})

test('/account/device', function (t) {
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

  test('create', function (t) {
    device.name = 'My Phone'
    device.type = 'mobile'
    device.pushCallback = 'https://updates.push.services.mozilla.com/update/abcdef01234567890abcdefabcdef01234567890abcdef'

    return runTest(route, mockRequest, function (response) {
      t.equal(mockDB.createDevice.callCount, 1)

      t.equal(mockPush.notifyDeviceConnected.callCount, 1)
      t.equal(mockPush.notifyDeviceConnected.firstCall.args[0], mockRequest.auth.credentials.uid)
      t.equal(mockPush.notifyDeviceConnected.firstCall.args[1], device.name)
      t.equal(mockPush.notifyDeviceConnected.firstCall.args[2], deviceId)

      t.equal(mockLog.event.callCount, 1)
      t.equal(mockLog.event.args[0].length, 3)
      t.equal(mockLog.event.args[0][0], 'device:create')
      t.deepEqual(mockLog.event.args[0][2], {
        uid: uid.toString('hex'),
        id: deviceId,
        type: 'mobile',
        timestamp: deviceCreatedAt
      })
    })
  }, t)

  test('update', function (t) {
    var deviceId = crypto.randomBytes(16)
    var credentials = mockRequest.auth.credentials
    credentials.tokenId = 'lookmumasessiontoken'
    credentials.deviceName = 'my awesome device'
    credentials.deviceType = 'desktop'
    credentials.deviceCallbackURL = ''
    credentials.deviceCallbackPublicKey = ''
    device.name = device.type = device.pushCallback = undefined
    device.id = deviceId.toString('hex')

    test('identical data', function (t) {
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
    }, t)

    test('different data', function (t) {
      mockRequest.auth.credentials.deviceId = crypto.randomBytes(16)
      var payload = mockRequest.payload
      payload.name = 'my even awesomer device'
      payload.type = 'phone'
      payload.pushCallback = 'https://push.services.mozilla.com/123456'
      payload.pushPublicKey = 'SomeEncodedBinaryStuffThatDoesntGetValidedByThisTest'

      return runTest(route, mockRequest, function (response) {
        t.equal(mockDB.updateDevice.callCount, 1, 'updateDevice was called')

        t.equal(mockLog.increment.callCount, 5, 'the counters were incremented')
        t.equal(mockLog.increment.getCall(0).args[0], 'device.update.sessionToken')
        t.equal(mockLog.increment.getCall(1).args[0], 'device.update.name')
        t.equal(mockLog.increment.getCall(2).args[0], 'device.update.type')
        t.equal(mockLog.increment.getCall(3).args[0], 'device.update.pushCallback')
        t.equal(mockLog.increment.getCall(4).args[0], 'device.update.pushPublicKey')
      })
    }, t)

    test('device updates disabled', function (t) {
      config.deviceUpdatesEnabled = false

      return runTest(route, mockRequest, function () {
        t.fail('should have thrown')
      })
      .catch(function (err) {
        t.equal(err.output.statusCode, 503, 'correct status code is returned')
        t.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED, 'correct errno is returned')
      })
    }, t)
  }, t)
})

test('/account/device/destroy', function (t) {
  var uid = uuid.v4('binary')
  var deviceId = crypto.randomBytes(16).toString('hex')
  var mockLog = mocks.mockLog({
    event: sinon.spy()
  })
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

    t.equal(mockLog.event.callCount, 1)
    t.equal(mockLog.event.args[0].length, 3)
    t.equal(mockLog.event.args[0][0], 'device:delete')
    var details = mockLog.event.args[0][2]
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
    }
  })
  var mockDB = mocks.mockDB({
    email: TEST_EMAIL,
    emailVerified: false,
    uid: uuid.v4('binary')
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
  mockLog.metricsContext.validate = sinon.spy()
  var accountRoutes = makeRoutes({
    db: mockDB,
    log: mockLog
  })
  var route = getRoute(accountRoutes, '/account/create')

  return runTest(route, mockRequest, function () {
    t.equal(mockDB.createAccount.callCount, 1, 'createAccount was called')

    t.equal(mockLog.stdout.write.callCount, 1, 'an sqs event was logged')
    var eventData = JSON.parse(mockLog.stdout.write.getCall(0).args[0])
    t.equal(eventData.event, 'login', 'it was a login event')
    t.equal(eventData.data.service, 'sync', 'it was for sync')
    t.equal(eventData.data.email, TEST_EMAIL, 'it was for the correct email')
    t.equal(eventData.data.metricsContext.entrypoint, 'preferences', 'it contained the entrypoint metrics field')
    t.equal(eventData.data.metricsContext.utm_content, 'some-content-string', 'it contained the utm_content metrics field')

    t.equal(mockLog.metricsContext.validate.callCount, 1, 'metricsContext.validate was called')
    var call = mockLog.metricsContext.validate.getCall(0)
    t.equal(call.args.length, 1, 'validate was called with a single argument')
    t.deepEqual(call.args[0], mockRequest, 'validate was called with the request')
  }).finally(function () {
    mockLog.close()
  })
})

test('/account/login', function (t) {
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
  var uid = uuid.v4('binary')
  var mockDB = mocks.mockDB({
    email: TEST_EMAIL,
    emailVerified: true,
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
  mockLog.metricsContext.validate = sinon.spy()
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
    mailer: mockMailer
  })
  var route = getRoute(accountRoutes, '/account/login')

  test('sign-in confirmation disabled', function (t) {
    return runTest(route, mockRequest, function (response) {
      t.equal(mockDB.emailRecord.callCount, 1, 'db.emailRecord was called')
      t.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called')
      t.equal(mockDB.sessions.callCount, 1, 'db.sessions was called')

      t.equal(mockLog.stdout.write.callCount, 1, 'an sqs event was logged')
      var eventData = JSON.parse(mockLog.stdout.write.getCall(0).args[0])
      t.equal(eventData.event, 'login', 'it was a login event')
      t.equal(eventData.data.service, 'sync', 'it was for sync')
      t.equal(eventData.data.email, TEST_EMAIL, 'it was for the correct email')
      t.equal(eventData.data.metricsContext.entrypoint, 'preferences', 'it contained the entrypoint metrics field')
      t.equal(eventData.data.metricsContext.utm_content, 'some-content-string', 'it contained the utm_content metrics field')

      t.equal(mockLog.metricsContext.validate.callCount, 1, 'metricsContext.validate was called')
      var call = mockLog.metricsContext.validate.getCall(0)
      t.equal(call.args.length, 1, 'validate was called with a single argument')
      t.deepEqual(call.args[0], mockRequest, 'validate was called with the request')

      t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 1, 'mailer.sendNewDeviceLoginNotification was called')
      t.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
      t.notOk(response.verificationMethod, 'verificationMethod doesn\'t exist')
      t.notOk(response.verificationReason, 'verificationReason doesn\'t exist')
    }).then(function () {
      mockMailer.sendNewDeviceLoginNotification.reset()
    })
  }, t)

  test('sign-in confirmation enabled', function (t) {
    config.signinConfirmation = {
      enabled: true,
      supportedClients: [ 'fx_desktop_v3' ],
      forceEmailRegex: [ '.+@mozilla\.com$', 'fennec@fire.fox' ]
    }

    test('always on', function (t) {
      config.signinConfirmation.sample_rate = 1

      return runTest(route, mockRequest, function (response) {
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 1, 'mailer.sendVerifyLoginEmail was called')
        t.equal(response.verificationMethod, 'email', 'verificationMethod is email')
        t.equal(response.verificationReason, 'login', 'verificationReason is login')
      }).then(function () {
        mockMailer.sendVerifyLoginEmail.reset()
      })
    }, t)

    test('on for sample', function (t) {
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
    }, t)

    test('off for sample', function (t) {
      config.signinConfirmation.sample_rate = 0.01

      return runTest(route, mockRequest, function (response) {
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 1, 'mailer.sendNewDeviceLoginNotification was called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
        t.notOk(response.verificationMethod, 'verificationMethod doesn\'t exist')
        t.notOk(response.verificationReason, 'verificationReason doesn\'t exist')
      }).then(function () {
        mockMailer.sendNewDeviceLoginNotification.reset()
      })
    }, t)

    test('on for email regex match', function (t) {
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
    }, t)

    test('on for specific email', function (t) {
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
    }, t)

    test('off for email regex mismatch', function (t) {
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
    }, t)

    test('off for unsupported client', function (t) {
      config.signinConfirmation.supportedClients = [ 'fx_desktop_v999' ]

      return runTest(route, mockRequest, function (response) {
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 1, 'mailer.sendNewDeviceLoginNotification was called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
        t.notOk(response.verificationMethod, 'verificationMethod doesn\'t exist')
        t.notOk(response.verificationReason, 'verificationReason doesn\'t exist')
      })
      .finally(function () {
        mockLog.close()
      })
    }, t)
  }, t)
})


test('/recovery_email/verify_code', function (t) {
  var uid = uuid.v4('binary').toString('hex')
  var mockRequest = mocks.mockRequest({
    query: {},
    payload: {
      uid: uid,
      code: 'e3c5b0e3f5391e134596c27519979b93',
      service: 'sync'
    }
  })

  var mockDB = mocks.mockDB({
    email: TEST_EMAIL,
    emailVerified: false,
    uid: uid
  })
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

  test('verifies account', function (t) {
    return runTest(route, mockRequest, function (response) {
      t.equal(mockDB.verifyTokens.callCount, 1, 'calls verifyTokens')
      t.equal(mockDB.verifyEmail.callCount, 1, 'calls verifyEmail')
      t.equal(mockLog.event.callCount, 1, 'logs verified')
      t.equal(JSON.stringify(response), '{}')
    })
  }, t)

  test('verifies account with a reminder payload', function (t) {
    mockRequest.payload.reminder = 'second'

    return runTest(route, mockRequest, function (response) {
      t.equal(mockLog.activityEvent.callCount, 1, 'calls activityEvent')
      var activityCall = mockLog.activityEvent.getCall(0).args
      t.equal(activityCall[0], 'account.reminder')
      t.equal(activityCall[2].uid, uid)
      t.equal(JSON.stringify(response), '{}')
    })
  }, t)
})

