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

test(
  'account with unverified invalid email gets deleted on status poll',
  function (t) {
    var mockDB = {
      deleteAccount: sinon.spy(function() {
        return P.resolve()
      })
    }
    var mockRequest = {
      auth: {
        credentials: {
          email: TEST_EMAIL_INVALID,
          emailVerified: false
        }
      }
    }

    var accountRoutes = makeRoutes({
      db: mockDB
    })
    var route = getRoute(accountRoutes, '/recovery_email/status')

    return new P(function(resolve) {
      route.handler(mockRequest, function(response) {
        resolve(response)
      })
    })
    .then(function(response) {
      t.equal(mockDB.deleteAccount.callCount, 1)
      t.equal(mockDB.deleteAccount.firstCall.args[0].email, TEST_EMAIL_INVALID)
      t.equal(response.errno, error.ERRNO.INVALID_TOKEN)
    })
  }
)

test(
  'account with verified invalid email does not get deleted on status poll',
  function (t) {
    var mockDB = {
      deleteAccount: sinon.spy()
    }
    var mockRequest = {
      auth: {
        credentials: {
          uid: uuid.v4('binary').toString('hex'),
          email: TEST_EMAIL_INVALID,
          emailVerified: true,
          tokenVerified: true
        }
      }
    }

    var accountRoutes = makeRoutes({
      db: mockDB
    })
    var route = getRoute(accountRoutes, '/recovery_email/status')

    return new P(function(resolve) {
      route.handler(mockRequest, function(response) {
        resolve(response)
      })
    })
    .then(function(response) {
      t.equal(mockDB.deleteAccount.callCount, 0)
      t.deepEqual(response, {
        email: TEST_EMAIL_INVALID,
        verified: true,
        emailVerified: true,
        sessionVerified: true
      })
    })
  }
)

test(
  '/recovery_email/status logs query reason',
  function (t) {
    var pushCalled = false
    var mockLog = mocks.mockLog({
      increment: function (name) {
        if (name === 'recovery_email_reason.push') {
          pushCalled = true
        }
      }
    })
    var mockRequest = {
      auth: {
        credentials: {
          email: TEST_EMAIL,
          emailVerified: true
        }
      },
      query: {
        reason: 'push'
      }
    }
    var accountRoutes = makeRoutes({
      log: mockLog
    })

    getRoute(accountRoutes, '/recovery_email/status')
      .handler(mockRequest, function() {
        t.equal(pushCalled, true)
        t.end()
      })
  }
)

test(
  '/recovery_email/status with sign-in confirmation enabled, emailVerified=true, sessionVerified=true',
  function (t) {

    var configOptions = {
      signinConfirmation: {
        enabled: true,
        sample_rate: 1.0
      }
    }

    var mockDB = {
      deleteAccount: sinon.spy()
    }

    var mockRequest = {
      auth: {
        credentials: {
          uid: uuid.v4('binary').toString('hex'),
          email: TEST_EMAIL,
          emailVerified: true,
          tokenVerified: true
        }
      }
    }

    var accountRoutes = makeRoutes({
      config: configOptions,
      db: mockDB
    })

    var route = getRoute(accountRoutes, '/recovery_email/status')
    return new P(function(resolve) {
      route.handler(mockRequest, function(response) {
        resolve(response)
      })
    })
    .then(function(response) {
      t.deepEqual(response, {
        email: TEST_EMAIL,
        verified: true,
        sessionVerified: true,
        emailVerified: true
      })
    })
  }
)

test(
  '/recovery_email/status with sign-in confirmation enabled, emailVerified=true, sessionVerified=false',
  function (t) {

    var configOptions = {
      signinConfirmation: {
        enabled: true,
        sample_rate: 1.0
      }
    }

    var mockDB = {
      deleteAccount: sinon.spy()
    }

    var mockRequest = {
      auth: {
        credentials: {
          uid: uuid.v4('binary').toString('hex'),
          email: TEST_EMAIL,
          emailVerified: true,
          tokenVerified: false
        }
      }
    }

    var accountRoutes = makeRoutes({
      config: configOptions,
      db: mockDB
    })

    var route = getRoute(accountRoutes, '/recovery_email/status')
    return new P(function(resolve) {
      route.handler(mockRequest, function(response) {
        resolve(response)
      })
    })
      .then(function(response) {
        t.deepEqual(response, {
          email: TEST_EMAIL,
          verified: false,
          sessionVerified: false,
          emailVerified: true
        })
      })
  }
)

test(
  '/recovery_email/status with sign-in confirmation disabled',
  function (t) {

    var configOptions = {
      signinConfirmation: {
        enabled: false
      }
    }

    var mockDB = {
      deleteAccount: sinon.spy()
    }

    var mockRequest = {
      auth: {
        credentials: {
          uid: uuid.v4('binary').toString('hex'),
          email: TEST_EMAIL,
          emailVerified: true,
          tokenVerified: true
        }
      }
    }

    var accountRoutes = makeRoutes({
      config: configOptions,
      db: mockDB
    })

    var route = getRoute(accountRoutes, '/recovery_email/status')
    return new P(function(resolve) {
      route.handler(mockRequest, function(response) {
        resolve(response)
      })
    })
      .then(function(response) {
        t.deepEqual(response, {
          email: TEST_EMAIL,
          verified: true,
          emailVerified: true,
          sessionVerified: true
        })
      })
  }
)


test(
  'device should be notified when the account is reset',
  function (t) {
    var uid = uuid.v4('binary')
    var mockRequest = {
      auth: {
        credentials: {
          uid: uid.toString('hex')
        }
      },
      payload: {
        authPW: crypto.randomBytes(32).toString('hex')
      }
    }
    var mockDB = {
      resetAccount: sinon.spy(function () {
        return P.resolve()
      }),
      account: sinon.spy(function () {
        return P.resolve({
          uid: uid,
          verifierSetAt: 0,
          email: TEST_EMAIL
        })
      })
    }
    var mockCustoms = {
      reset: sinon.spy(function (email) {
        return P.resolve()
      })
    }
    var mockPush = {
      notifyUpdate: sinon.spy(function () {})
    }
    var accountRoutes = makeRoutes({
      db: mockDB,
      customs: mockCustoms,
      push: mockPush
    })

    return new P(function(resolve) {
      getRoute(accountRoutes, '/account/reset')
        .handler(mockRequest, function(response) {
          resolve(response)
        })
    })
    .then(function(response) {
      t.equal(mockDB.resetAccount.callCount, 1)

      t.equal(mockPush.notifyUpdate.callCount, 1)
      t.equal(mockPush.notifyUpdate.firstCall.args[0], uid.toString('hex'))
      t.equal(mockPush.notifyUpdate.firstCall.args[1], 'passwordReset')

      t.equal(mockDB.account.callCount, 1)
      t.equal(mockCustoms.reset.callCount, 1)
    })
  }
)

test(
  'device updates dont write to the db if nothing has changed',
  function (t) {
    var uid = uuid.v4('binary')
    var deviceId = crypto.randomBytes(16)
    var mockRequest = {
      auth: {
        credentials: {
          uid: uid.toString('hex'),
          deviceId: deviceId,
          deviceName: 'my awesome device',
          deviceType: 'desktop',
          deviceCallbackURL: '',
          deviceCallbackPublicKey: '',
        }
      },
      payload: {
        id: deviceId.toString('hex'),
        name: 'my awesome device'
      }
    }
    var mockDB = {
      updateDevice: sinon.spy(function () {
        return P.resolve()
      })
    }
    var mockLog = mocks.spyLog()
    var accountRoutes = makeRoutes({
      db: mockDB,
      log: mockLog
    })
    return new P(function(resolve) {
      getRoute(accountRoutes, '/account/device')
        .handler(mockRequest, function(response) {
          resolve(response)
        })
    })
    .then(function(response) {
      t.equal(mockDB.updateDevice.callCount, 0, 'updateDevice was not called')

      t.equal(mockLog.increment.callCount, 1, 'a counter was incremented')
      t.equal(mockLog.increment.firstCall.args[0], 'device.update.spurious')

      t.deepEqual(response, mockRequest.payload)
    })
  }
)

test(
  'device updates log metrics about what has changed',
  function (t) {
    var uid = uuid.v4('binary')
    var deviceId = crypto.randomBytes(16)
    var mockRequest = {
      auth: {
        credentials: {
          uid: uid.toString('hex'),
          tokenId: 'lookmumasessiontoken',
          deviceId: 'aDifferentDeviceId',
          deviceName: 'my awesome device',
          deviceType: 'desktop',
          deviceCallbackURL: '',
          deviceCallbackPublicKey: '',
        }
      },
      payload: {
        id: deviceId.toString('hex'),
        name: 'my even awesomer device',
        type: 'phone',
        pushCallback: 'https://push.services.mozilla.com/123456',
        pushPublicKey: 'SomeEncodedBinaryStuffThatDoesntGetValidedByThisTest'
      }
    }
    var mockDB = {
      updateDevice: sinon.spy(function (uid, sessionTokenId, deviceInfo) {
        return P.resolve(deviceInfo)
      })
    }
    var mockLog = mocks.spyLog()
    var mockPush = {
      notifyDeviceConnected: sinon.spy(function () {})
    }
    var accountRoutes = makeRoutes({
      db: mockDB,
      log: mockLog,
      push: mockPush
    })

    return new P(function(resolve) {
      getRoute(accountRoutes, '/account/device')
        .handler(mockRequest, function(response) {
          resolve(response)
        })
    })
    .then(function() {
      t.equal(mockDB.updateDevice.callCount, 1, 'updateDevice was called')

      t.equal(mockLog.increment.callCount, 5, 'the counters were incremented')
      t.equal(mockLog.increment.getCall(0).args[0], 'device.update.sessionToken')
      t.equal(mockLog.increment.getCall(1).args[0], 'device.update.name')
      t.equal(mockLog.increment.getCall(2).args[0], 'device.update.type')
      t.equal(mockLog.increment.getCall(3).args[0], 'device.update.pushCallback')
      t.equal(mockLog.increment.getCall(4).args[0], 'device.update.pushPublicKey')
    })
  }
)

test(
  'device should be notified when another device is registered',
  function (t) {
    var device = {
      name: 'My Phone',
      type: 'mobile',
      pushCallback: 'https://updates.push.services.mozilla.com/update/abcdef01234567890abcdefabcdef01234567890abcdef'
    }
    var uid = uuid.v4('binary')
    var mockRequest = {
      auth: {
        credentials: {
          uid: uid.toString('hex')
        }
      },
      payload: device
    }
    var mockDB = {
      createDevice: sinon.spy(function () {
        device.id = crypto.randomBytes(16)
        return P.resolve(device)
      })
    }
    var mockPush = {
      notifyDeviceConnected: sinon.spy(function () {})
    }
    var accountRoutes = makeRoutes({
      db: mockDB,
      push: mockPush
    })

    return new P(function(resolve) {
      getRoute(accountRoutes, '/account/device')
        .handler(mockRequest, function(response) {
          resolve(response)
        })
    })
    .then(function(response) {
      t.equal(mockDB.createDevice.callCount, 1)

      t.equal(mockPush.notifyDeviceConnected.callCount, 1)
      t.equal(mockPush.notifyDeviceConnected.firstCall.args[0], mockRequest.auth.credentials.uid)
      t.equal(mockPush.notifyDeviceConnected.firstCall.args[1], device.name)
      t.equal(mockPush.notifyDeviceConnected.firstCall.args[2], device.id.toString('hex'))
    })
  }
)

test(
  'device should be notified when it is remotely disconnected',
  function (t) {
    var deviceId = 'deviceId'
    var uid = uuid.v4('binary')
    var mockRequest = {
      auth: {
        credentials: {
          uid: uid.toString('hex')
        }
      },
      payload: {
        id: deviceId
      }
    }
    var mockDB = {
      deleteDevice: sinon.spy(function () {
        return P.resolve({})
      })
    }
    var mockPush = {
      notifyDeviceDisconnected: sinon.spy(function () {
        return P.resolve(true)
      })
    }
    var accountRoutes = makeRoutes({
      db: mockDB,
      push: mockPush
    })

    return new P(function(resolve) {
      getRoute(accountRoutes, '/account/device/destroy')
        .handler(mockRequest, function(response) {
          resolve(response)
        })
    })
    .then(function(response) {
      t.equal(mockDB.deleteDevice.callCount, 1)

      t.equal(mockPush.notifyDeviceDisconnected.callCount, 1)
      t.equal(mockPush.notifyDeviceDisconnected.firstCall.args[0], mockRequest.auth.credentials.uid)
      t.equal(mockPush.notifyDeviceDisconnected.firstCall.args[1], deviceId)
    })
  }
)

test(
  'device updates can be disabled via config',
  function (t) {
    var uid = uuid.v4('binary')
    var deviceId = crypto.randomBytes(16)
    var mockRequest = {
      auth: {
        credentials: {
          uid: uid.toString('hex'),
          deviceId: deviceId
        }
      },
      payload: {
        id: deviceId.toString('hex'),
        name: 'new device name'
      }
    }
    var accountRoutes = makeRoutes({
      config: {
        deviceUpdatesEnabled: false
      }
    })

    return new P(function(resolve) {
      getRoute(accountRoutes, '/account/device')
        .handler(mockRequest, function(response) {
          resolve(response)
        })
    })
    .then(
      function(response) {
        t.fail('should have thrown')
      },
      function(err) {
        t.equal(err.output.statusCode, 503, 'correct status code is returned')
        t.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED, 'correct errno is returned')
      }
    )
  }
)

test(
  'login event from /account/create includes metrics context data',
  function (t) {
    var mockRequest = {
      app: {
        acceptLangage: 'en-US'
      },
      headers: {
        'user-agent': 'test-user-agent'
      },
      payload: {
        email: TEST_EMAIL,
        authPW: crypto.randomBytes(32).toString('hex'),
        service: 'sync',
        metricsContext: {
          entrypoint: 'preferences',
          utmContent: 'some-content-string'
        }
      }
    }
    var mockDB = {
      emailRecord: sinon.spy(function () {
        return P.reject(new error.unknownAccount())
      }),
      createAccount: sinon.spy(function () {
        return P.resolve({
          uid: uuid.v4('binary'),
          email: TEST_EMAIL,
          emailVerified: false
        })
      })
    }
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
    var accountRoutes = makeRoutes({
      db: mockDB,
      log: mockLog
    })
    return new P(function (resolve) {
      getRoute(accountRoutes, '/account/create')
        .handler(mockRequest, function(response) {
          resolve(response)
        })
    })
    .then(function () {
      t.equal(mockDB.createAccount.callCount, 1, 'createAccount was called')

      t.equal(mockLog.stdout.write.callCount, 1, 'an sqs event was logged')
      var eventData = JSON.parse(mockLog.stdout.write.getCall(0).args[0])
      t.equal(eventData.event, 'login', 'it was a login event')
      t.equal(eventData.data.service, 'sync', 'it was for sync')
      t.equal(eventData.data.email, TEST_EMAIL, 'it was for the correct email')
      t.equal(eventData.data.metricsContext.entrypoint, 'preferences', 'it contained the entrypoint metrics field')
      t.equal(eventData.data.metricsContext.utm_content, 'some-content-string', 'it contained the utm_content metrics field')

    }).finally(function () {
      mockLog.close()
    })
  }
)

test(
  'login event from /account/login includes metrics context data',
  function (t) {
    var mockRequest = {
      app: {
        acceptLangage: 'en-US'
      },
      headers: {
        'user-agent': 'test-user-agent'
      },
      query: {
        keys: false
      },
      payload: {
        email: TEST_EMAIL,
        authPW: crypto.randomBytes(32).toString('hex'),
        service: 'sync',
        reason: 'signin',
        metricsContext: {
          entrypoint: 'preferences',
          utmContent: 'some-content-string'
        }
      }
    }
    var uid = uuid.v4('binary')
    var mockDB = {
      emailRecord: sinon.spy(function () {
        return P.resolve({
          uid: uid,
          email: TEST_EMAIL,
          emailVerified: true
        })
      }),
      createSessionToken: sinon.spy(function () {
        return P.resolve({
          uid: uid,
          email: TEST_EMAIL,
          emailVerified: true,
          lastAuthAt: function () { return 0 }
        })
      }),
      sessions: sinon.spy(function () {
        return P.resolve([{}, {}, {}])
      })
    }
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
    var accountRoutes = makeRoutes({
      db: mockDB,
      log: mockLog,
      checkPassword: function () {
        return P.resolve(true)
      }
    })
    return new P(function (resolve) {
      getRoute(accountRoutes, '/account/login')
        .handler(mockRequest, function(response) {
          resolve(response)
        })
    })
    .then(function () {
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
    }).finally(function () {
      mockLog.close()
    })
  }
)

test(
  'login with disabled sign-in confirmation, sends new device email',
  function (t) {
    var configOptions = {
      signinConfirmation: {
        enabled: false,
        supportedClients: ['fx_desktop_v3'],
        forceEmails:['@mozilla.com']
      },
      newLoginNotificationEnabled: true
    }

    var uid = uuid.v4('binary')
    var mockRequest = mocks.mockRequest(TEST_EMAIL, 'true')
    var mockDB = mocks.mockDB(uid, TEST_EMAIL, true)
    var mockMailer = mocks.mockMailer()

    var accountRoutes = makeRoutes({
      config: configOptions,
      db: mockDB,
      mailer: mockMailer,
      checkPassword: function () {
        return P.resolve(true)
      }
    })

    return new P(function (resolve) {
      getRoute(accountRoutes, '/account/login')
        .handler(mockRequest, function (response) {
          resolve(response)
        })
    })
      .then(function (response) {
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 1, 'mailer.sendNewDeviceLoginNotification was called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
        t.notOk(response.verificationMethod, 'verificationMethod doesn\'t exist')
        t.notOk(response.verificationReason, 'verificationReason doesn\'t exist')
      })
  }
)

test(
  'login with enabled sign-in confirmation',
  function (t) {
    var configOptions = {
      signinConfirmation: {
        enabled: true,
        sample_rate: 1.0,
        supportedClients: ['fx_desktop_v3'],
        forceEmails:['@mozilla.com']
      }
    }

    var uid = uuid.v4('binary')
    var mockRequest = mocks.mockRequest(TEST_EMAIL, 'true')
    var mockDB = mocks.mockDB(uid, TEST_EMAIL, true)
    var mockMailer = mocks.mockMailer()

    var accountRoutes = makeRoutes({
      config: configOptions,
      db: mockDB,
      mailer: mockMailer,
      checkPassword: function () {
        return P.resolve(true)
      }
    })

    return new P(function (resolve) {
      getRoute(accountRoutes, '/account/login')
        .handler(mockRequest, function (response) {
          resolve(response)
        })
    })
      .then(function (response) {
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 1, 'mailer.sendVerifyLoginEmail was called')
        t.equal(response.verificationMethod, 'email', 'verificationMethod is email')
        t.equal(response.verificationReason, 'login', 'verificationReason is login')
      })
  }
)

test(
  'login with sign-in confirmation enabled for specific uid',
  function (t) {
    var configOptions = {
      signinConfirmation: {
        enabled: true,
        sample_rate: 0.20,
        supportedClients: ['fx_desktop_v3'],
        forceEmails:['@mozilla.com']
      }
    }

    var uid = '20162205efab47ecb6418c797acd743f'
    var mockRequest = mocks.mockRequest(TEST_EMAIL, 'true')
    var mockDB = mocks.mockDB(uid, TEST_EMAIL, true)
    var mockMailer = mocks.mockMailer()

    var accountRoutes = makeRoutes({
      config: configOptions,
      db: mockDB,
      mailer: mockMailer,
      checkPassword: function () {
        return P.resolve(true)
      }
    })

    return new P(function (resolve) {
      getRoute(accountRoutes, '/account/login')
        .handler(mockRequest, function (response) {
          resolve(response)
        })
    })
      .then(function (response) {
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 1, 'mailer.sendVerifyLoginEmail was called')
        t.equal(response.verificationMethod, 'email', 'verificationMethod is email')
        t.equal(response.verificationReason, 'login', 'verificationReason is login')
      })
  }
)

test(
  'login with sign-in confirmation enabled for specific email',
  function (t) {
    var configOptions = {
      signinConfirmation: {
        enabled: true,
        sample_rate: 0.00,
        supportedClients: ['fx_desktop_v3'],
        forceEmails:['@mozilla.com']
      }
    }

    var uid = '20162205efab47ecb6418c797acd743f'
    var mockRequest = mocks.mockRequest('test@mozilla.com', 'true')
    var mockDB = mocks.mockDB(uid, 'test@mozilla.com', true)
    var mockMailer = mocks.mockMailer()

    var accountRoutes = makeRoutes({
      config: configOptions,
      db: mockDB,
      mailer: mockMailer,
      checkPassword: function () {
        return P.resolve(true)
      }
    })

    return new P(function (resolve) {
      getRoute(accountRoutes, '/account/login')
        .handler(mockRequest, function (response) {
          resolve(response)
        })
    })
      .then(function (response) {
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 0, 'mailer.sendNewDeviceLoginNotification was not called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 1, 'mailer.sendVerifyLoginEmail was called')
        t.equal(response.verificationMethod, 'email', 'verificationMethod is email')
        t.equal(response.verificationReason, 'login', 'verificationReason is login')
      })
  }
)

test(
  'login with sign-in confirmation, invalid client, does not perform confirmation',
  function (t) {
    var configOptions = {
      signinConfirmation: {
        enabled: true,
        sample_rate: 1.00,
        supportedClients: ['fx_desktop_v999'],
        forceEmails:['@mozilla.com']
      },
      newLoginNotificationEnabled: true
    }

    var uid = '20162205efab47ecb6418c797acd743f'
    var mockRequest = mocks.mockRequest(TEST_EMAIL, 'true')
    var mockDB = mocks.mockDB(uid, TEST_EMAIL, true)
    var mockMailer = mocks.mockMailer()

    var accountRoutes = makeRoutes({
      config: configOptions,
      db: mockDB,
      mailer: mockMailer,
      checkPassword: function () {
        return P.resolve(true)
      }
    })

    return new P(function (resolve) {
      getRoute(accountRoutes, '/account/login')
        .handler(mockRequest, function (response) {
          resolve(response)
        })
    })
      .then(function (response) {
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 1, 'mailer.sendNewDeviceLoginNotification was called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
        t.notOk(response.verificationMethod, 'verificationMethod doesn\'t exist')
        t.notOk(response.verificationReason, 'verificationReason doesn\'t exist')
      })
  }
)

test(
  'login with sign-in confirmation enabled but not in sample range, sends new device email',
  function (t) {
    var configOptions = {
      signinConfirmation: {
        enabled: true,
        sample_rate: 0.10,
        supportedClients: ['fx_desktop_v3'],
        forceEmails:['@mozilla.com']
      },
      newLoginNotificationEnabled: true
    }

    var uid = '20162205efab47ecb6418c797acd743f'
    var mockRequest = mocks.mockRequest(TEST_EMAIL, 'true')
    var mockDB = mocks.mockDB(uid, TEST_EMAIL, true)
    var mockMailer = mocks.mockMailer()

    var accountRoutes = makeRoutes({
      config: configOptions,
      db: mockDB,
      mailer: mockMailer,
      checkPassword: function () {
        return P.resolve(true)
      }
    })

    return new P(function (resolve) {
      getRoute(accountRoutes, '/account/login')
        .handler(mockRequest, function (response) {
          resolve(response)
        })
    })
      .then(function (response) {
        t.equal(mockMailer.sendNewDeviceLoginNotification.callCount, 1, 'mailer.sendNewDeviceLoginNotification was called')
        t.equal(mockMailer.sendVerifyLoginEmail.callCount, 0, 'mailer.sendVerifyLoginEmail was not called')
        t.notOk(response.verificationMethod, 'verificationMethod doesn\'t exist')
        t.notOk(response.verificationReason, 'verificationReason doesn\'t exist')
      })
  }
)

test(
  'device creation emits SNS event',
  function (t) {
    var uid = uuid.v4('binary')
    var deviceId = crypto.randomBytes(16).toString('hex')
    var mockLog = mocks.mockLog({
      event: sinon.spy()
    })
    var timestamp = Date.now()
    var mockDB = {
      createDevice: sinon.spy(function (uid, sessionTokenId, deviceInfo) {
        deviceInfo.createdAt = timestamp
        deviceInfo.id = deviceId
        return P.resolve(deviceInfo)
      }),
      devices: sinon.spy(function () {
        return P.resolve([])
      })
    }
    var mockRequest = {
      auth: {
        credentials: {
          uid: uid.toString('hex'),
        }
      },
      payload: {
        name: 'new device name',
        type: 'phone',
      }
    }
    var accountRoutes = makeRoutes({
      db: mockDB,
      log: mockLog
    })

    return new P(function(resolve) {
      getRoute(accountRoutes, '/account/device')
        .handler(mockRequest, function(response) {
          resolve(response)
        })
    })
    .then(
      function(response) {
        t.equal(mockLog.event.callCount, 1)
        t.equal(mockLog.event.args[0].length, 3)
        t.equal(mockLog.event.args[0][0], 'device:create')
        t.deepEqual(mockLog.event.args[0][2], {
          uid: uid.toString('hex'),
          id: deviceId,
          type: 'phone',
          timestamp: timestamp
        })
      },
      function(err) {
        t.fail('should have succeeded', err)
      }
    )
  }
)

test(
  'device deletion emits SNS event',
  function (t) {
    var uid = uuid.v4('binary')
    var deviceId = crypto.randomBytes(16).toString('hex')
    var mockLog = mocks.mockLog({
      event: sinon.spy()
    })
    var mockDB = {
      deleteDevice: sinon.spy(function (uid, sessionTokenId) {
        return P.resolve(true)
      }),
      devices: sinon.spy(function () {
        return P.resolve([{
          id: deviceId,
          name: 'My Phone',
          type: 'mobile'
        }])
      }),
    }
    var mockRequest = {
      auth: {
        credentials: {
          uid: uid.toString('hex'),
        }
      },
      payload: {
        id: deviceId
      }
    }
    var accountRoutes = makeRoutes({
      db: mockDB,
      log: mockLog
    })

    return new P(function(resolve) {
      getRoute(accountRoutes, '/account/device/destroy')
        .handler(mockRequest, function(response) {
          resolve(response)
        })
    })
    .then(
      function(response) {
        t.equal(mockLog.event.callCount, 1)
        t.equal(mockLog.event.args[0].length, 3)
        t.equal(mockLog.event.args[0][0], 'device:delete')
        var details = mockLog.event.args[0][2]
        t.equal(details.uid, uid.toString('hex'))
        t.equal(details.id, deviceId)
        t.ok(Date.now() - details.timestamp < 100)
      },
      function(err) {
        t.fail('should have succeeded', err)
      }
    )
  }
)

test(
  '/account/create validates metrics context data',
  function (t) {
    var mockRequest = {
      app: {
        acceptLangage: 'en-US'
      },
      headers: {
        'user-agent': 'test-user-agent'
      },
      payload: {
        email: TEST_EMAIL,
        authPW: crypto.randomBytes(32).toString('hex'),
        service: 'sync',
        metricsContext: {
          flowBeginTime: Date.now(),
          flowId: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          entrypoint: 'preferences'
        }
      }
    }
    var mockLog = mocks.mockLog()
    mockLog.metricsContext = mocks.mockMetricsContext()
    var mockDB = {
      emailRecord: sinon.spy(function () {
        return P.resolve({})
      })
    }
    var accountRoutes = makeRoutes({
      log: mockLog,
      db: mockDB
    })
    return new P(function (resolve, reject) {
      getRoute(accountRoutes, '/account/create')
        .handler(mockRequest, function(response) {
          resolve(response)
        })
    })
    .then(function () {
      t.equal(mockLog.metricsContext.validate.callCount, 1, 'metricsContext.validate was called')
      var call = mockLog.metricsContext.validate.getCall(0)
      t.equal(call.args.length, 1, 'validate was called with a single argument')
      t.deepEqual(call.args[0], mockRequest, 'validate was called with the request')
    })
  }
)

test(
  '/account/login validates metrics context data',
  function (t) {
    var mockRequest = {
      app: {
        acceptLangage: 'en-US'
      },
      headers: {
        'user-agent': 'test-user-agent'
      },
      query: {
        keys: false
      },
      payload: {
        email: TEST_EMAIL,
        authPW: crypto.randomBytes(32).toString('hex'),
        service: 'sync',
        reason: 'signin',
        metricsContext: {
          flowBeginTime: Date.now(),
          flowId: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          entrypoint: 'preferences'
        }
      }
    }
    var mockDB = {
      emailRecord: sinon.spy(function () {
        return P.resolve({})
      }),
      createSessionToken: sinon.spy(function () {
        return P.resolve({})
      }),
      sessions: sinon.spy(function () {
        return P.resolve([{}, {}, {}])
      })
    }
    var mockLog = mocks.mockLog()
    mockLog.metricsContext = mocks.mockMetricsContext()
    var accountRoutes = makeRoutes({
      db: mockDB,
      log: mockLog,
      checkPassword: function () {
        return P.resolve(true)
      }
    })
    return new P(function (resolve) {
      getRoute(accountRoutes, '/account/login')
        .handler(mockRequest, function(response) {
          resolve(response)
        })
    })
    .then(function () {
      t.equal(mockLog.metricsContext.validate.callCount, 1, 'metricsContext.validate was called')
      var call = mockLog.metricsContext.validate.getCall(0)
      t.equal(call.args.length, 1, 'validate was called with a single argument')
      t.deepEqual(call.args[0], mockRequest, 'validate was called with the request')
    })
  }
)
