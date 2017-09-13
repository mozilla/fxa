/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var mocks = require('../../mocks')
var getRoute = require('../../routes_helpers').getRoute

var P = require('../../../lib/promise')
var uuid = require('uuid')
var crypto = require('crypto')
var error = require('../../../lib/error')
const sinon = require('sinon')
const log = require('../../../lib/log')

var TEST_EMAIL = 'foo@gmail.com'

function makeRoutes(options) {
  options = options || {}

  var config = options.config || {
    verifierVersion: 0,
    smtp: {}
  }
  var log = options.log || mocks.mockLog()
  var db = options.db || {}
  var Password = require('../../../lib/crypto/password')(log, config)
  var customs = options.customs || {}
  var checkPassword = require('../../../lib/routes/utils/password_check')(log, config, Password, customs, db)
  config.secondaryEmail = config.secondaryEmail || {}
  return require('../../../lib/routes/password')(
    log,
    db,
    Password,
    config.smtp.redirectDomain || '',
    options.mailer || {},
    config.verifierVersion,
    options.customs || {},
    checkPassword,
    options.push || {},
    config
  )
}

function runRoute(routes, name, request) {
  return new P((resolve, reject) => {
    getRoute(routes, name).handler(request, res => {
      if (res instanceof Error) {
        reject(res)
      } else {
        resolve(res)
      }
    })
  })
}

describe('/password', () => {
  it(
    '/forgot/send_code',
    () => {
      var mockCustoms = mocks.mockCustoms()
      var uid = uuid.v4('binary').toString('hex')
      var mockDB = mocks.mockDB({
        email: TEST_EMAIL,
        passCode: 'foo',
        passwordForgotTokenId: crypto.randomBytes(16).toString('hex'),
        uid: uid
      })
      var mockMailer = mocks.mockMailer()
      var mockMetricsContext = mocks.mockMetricsContext()
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
      mockLog.flowEvent = sinon.spy(() => {
        return P.resolve()
      })
      var passwordRoutes = makeRoutes({
        customs: mockCustoms,
        db: mockDB,
        mailer : mockMailer,
        metricsContext: mockMetricsContext,
        log: mockLog
      })

      var mockRequest = mocks.mockRequest({
        log: mockLog,
        payload: {
          email: TEST_EMAIL,
          metricsContext: {
            flowId: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
            flowBeginTime: Date.now() - 1
          }
        },
        query: {},
        metricsContext: mockMetricsContext
      })
      return runRoute(passwordRoutes, '/password/forgot/send_code', mockRequest)
      .then(function(response) {
        assert.equal(mockDB.accountRecord.callCount, 1, 'db.emailRecord was called once')

        assert.equal(mockDB.createPasswordForgotToken.callCount, 1, 'db.createPasswordForgotToken was called once')
        var args = mockDB.createPasswordForgotToken.args[0]
        assert.equal(args.length, 1, 'db.createPasswordForgotToken was passed one argument')
        assert.deepEqual(args[0].uid, uid, 'db.createPasswordForgotToken was passed the correct uid')
        assert.equal(args[0].createdAt, undefined, 'db.createPasswordForgotToken was not passed a createdAt timestamp')

        assert.equal(mockRequest.validateMetricsContext.callCount, 1, 'validateMetricsContext was called')
        assert.equal(mockLog.flowEvent.callCount, 2, 'log.flowEvent was called twice')
        assert.equal(mockLog.flowEvent.args[0][0].event, 'password.forgot.send_code.start', 'password.forgot.send_code.start event was logged')
        assert.equal(mockLog.flowEvent.args[1][0].event, 'password.forgot.send_code.completed', 'password.forgot.send_code.completed event was logged')

        assert.equal(mockMailer.sendRecoveryCode.callCount, 1, 'mailer.sendRecoveryCode was called once')
        assert.equal(mockMailer.sendRecoveryCode.getCall(0).args[2].location.city, 'Mountain View')
        assert.equal(mockMailer.sendRecoveryCode.getCall(0).args[2].location.country, 'United States')
        assert.equal(mockMailer.sendRecoveryCode.getCall(0).args[2].timeZone, 'America/Los_Angeles')
        assert.equal(mockMailer.sendRecoveryCode.getCall(0).args[2].uid, uid)
      })
    }
  )

  it(
    '/forgot/resend_code',
    () => {
      var mockCustoms = mocks.mockCustoms()
      var uid = uuid.v4('binary').toString('hex')
      var mockDB = mocks.mockDB()
      var mockMailer = mocks.mockMailer()
      var mockMetricsContext = mocks.mockMetricsContext()
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
      mockLog.flowEvent = sinon.spy(() => {
        return P.resolve()
      })
      var passwordRoutes = makeRoutes({
        customs: mockCustoms,
        db: mockDB,
        mailer : mockMailer,
        metricsContext: mockMetricsContext,
        log: mockLog
      })

      var mockRequest = mocks.mockRequest({
        credentials: {
          data: crypto.randomBytes(16).toString('hex'),
          email: TEST_EMAIL,
          passCode: Buffer('abcdef', 'hex'),
          ttl: function () { return 17 },
          uid: uid
        },
        log: mockLog,
        payload: {
          email: TEST_EMAIL,
          metricsContext: {
            flowId: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
            flowBeginTime: Date.now() - 1
          }
        },
        query: {},
        metricsContext: mockMetricsContext
      })
      return runRoute(passwordRoutes, '/password/forgot/resend_code', mockRequest)
        .then(function(response) {
          assert.equal(mockMailer.sendRecoveryCode.callCount, 1, 'mailer.sendRecoveryCode was called once')
          assert.equal(mockMailer.sendRecoveryCode.args[0][2].uid, uid)

          assert.equal(mockRequest.validateMetricsContext.callCount, 1, 'validateMetricsContext was called')
          assert.equal(mockLog.flowEvent.callCount, 2, 'log.flowEvent was called twice')
          assert.equal(mockLog.flowEvent.args[0][0].event, 'password.forgot.resend_code.start', 'password.forgot.resend_code.start event was logged')
          assert.equal(mockLog.flowEvent.args[1][0].event, 'password.forgot.resend_code.completed', 'password.forgot.resend_code.completed event was logged')
        })
    }
  )

  it(
    '/forgot/verify_code',
    () => {
      var mockCustoms = mocks.mockCustoms()
      var uid = uuid.v4('binary').toString('hex')
      var accountResetToken = {
        data: crypto.randomBytes(16).toString('hex')
      }
      var mockDB = mocks.mockDB({
        accountResetToken: accountResetToken,
        email: TEST_EMAIL,
        passCode: 'abcdef',
        passwordForgotTokenId: crypto.randomBytes(16).toString('hex'),
        uid: uid
      })
      var mockMailer = mocks.mockMailer()
      var mockMetricsContext = mocks.mockMetricsContext()
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
      mockLog.flowEvent = sinon.spy(() => {
        return P.resolve()
      })
      var passwordRoutes = makeRoutes({
        customs: mockCustoms,
        db: mockDB,
        mailer: mockMailer,
        metricsContext: mockMetricsContext
      })

      var mockRequest = mocks.mockRequest({
        log: mockLog,
        credentials: {
          email: TEST_EMAIL,
          passCode: Buffer('abcdef', 'hex'),
          ttl: function () { return 17 },
          uid: uid
        },
        payload: {
          code: 'abcdef',
          metricsContext: {
            flowId: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
            flowBeginTime: Date.now() - 1
          }
        },
        query: {}
      })
      return runRoute(passwordRoutes, '/password/forgot/verify_code', mockRequest)
      .then(function(response) {
        assert.deepEqual(Object.keys(response), ['accountResetToken'], 'an accountResetToken was returned')
        assert.equal(response.accountResetToken, accountResetToken.data.toString('hex'), 'correct accountResetToken was returned')

        assert.equal(mockCustoms.check.callCount, 1, 'customs.check was called once')

        assert.equal(mockDB.forgotPasswordVerified.callCount, 1, 'db.passwordForgotVerified was called once')
        var args = mockDB.forgotPasswordVerified.args[0]
        assert.equal(args.length, 1, 'db.passwordForgotVerified was passed one argument')
        assert.deepEqual(args[0].uid, uid, 'db.forgotPasswordVerified was passed the correct token')

        assert.equal(mockRequest.validateMetricsContext.callCount, 1, 'validateMetricsContext was called')
        assert.equal(mockLog.flowEvent.callCount, 2, 'log.flowEvent was called twice')
        assert.equal(mockLog.flowEvent.args[0][0].event, 'password.forgot.verify_code.start', 'password.forgot.verify_code.start event was logged')
        assert.equal(mockLog.flowEvent.args[1][0].event, 'password.forgot.verify_code.completed', 'password.forgot.verify_code.completed event was logged')

        assert.equal(mockMailer.sendPasswordResetNotification.callCount, 1, 'mailer.sendPasswordResetNotification was called once')
        assert.equal(mockMailer.sendPasswordResetNotification.args[0][2].uid, uid, 'mailer.sendPasswordResetNotification was passed uid')
      })
    }
  )

  describe('/change/finish', () => {
    it(
      'smoke',
      () => {
        var uid = uuid.v4('binary').toString('hex')
        var devices = [
          { uid: uid, id: crypto.randomBytes(16) },
          { uid: uid, id: crypto.randomBytes(16) }
        ]
        var mockDB = mocks.mockDB({
          email: TEST_EMAIL,
          uid,
          devices
        })
        var mockPush = mocks.mockPush()
        var mockMailer = mocks.mockMailer()
        var mockLog = mocks.spyLog()
        var mockRequest = mocks.mockRequest({
          credentials: {
            uid: uid
          },
          devices,
          payload: {
            authPW: crypto.randomBytes(32).toString('hex'),
            wrapKb: crypto.randomBytes(32).toString('hex'),
            sessionToken: crypto.randomBytes(32).toString('hex')
          },
          query: {
            keys: 'true'
          },
          log: mockLog,
          uaBrowser: 'Firefox',
          uaBrowserVersion: '57',
          uaOS: 'Mac OS X',
          uaOSVersion: '10.11'
        })
        var passwordRoutes = makeRoutes({
          db: mockDB,
          push: mockPush,
          mailer: mockMailer,
          log: mockLog
        })

        return runRoute(passwordRoutes, '/password/change/finish', mockRequest)
        .then(function(response) {
          assert.equal(mockDB.deletePasswordChangeToken.callCount, 1)
          assert.equal(mockDB.resetAccount.callCount, 1)

          assert.equal(mockPush.notifyPasswordChanged.callCount, 1, 'sent a push notification of the change')
          assert.deepEqual(mockPush.notifyPasswordChanged.firstCall.args[0], uid, 'notified the correct uid')
          assert.deepEqual(mockPush.notifyPasswordChanged.firstCall.args[1], [devices[1]], 'notified only the second device')

          assert.equal(mockDB.account.callCount, 1)
          assert.equal(mockMailer.sendPasswordChangedNotification.callCount, 1)
          assert.equal(mockMailer.sendPasswordChangedNotification.firstCall.args[1].email, TEST_EMAIL)
          assert.equal(mockMailer.sendPasswordChangedNotification.getCall(0).args[2].location.city, 'Mountain View')
          assert.equal(mockMailer.sendPasswordChangedNotification.getCall(0).args[2].location.country, 'United States')
          assert.equal(mockMailer.sendPasswordChangedNotification.getCall(0).args[2].timeZone, 'America/Los_Angeles')
          assert.equal(mockMailer.sendPasswordChangedNotification.getCall(0).args[2].uid, uid)

          assert.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
          var args = mockLog.activityEvent.args[0]
          assert.equal(args.length, 1, 'log.activityEvent was passed one argument')
          assert.deepEqual(args[0], {
            event: 'account.changedPassword',
            service: undefined,
            uid: uid.toString('hex'),
            userAgent: 'test user-agent'
          }, 'argument was event data')

          assert.equal(mockDB.createSessionToken.callCount, 1, 'db.createSessionToken was called once')
          args = mockDB.createSessionToken.args[0]
          assert.equal(args.length, 1, 'db.createSessionToken was passed one argument')
          assert.equal(args[0].uaBrowser, 'Firefox', 'db.createSessionToken was passed correct browser')
          assert.equal(args[0].uaBrowserVersion, '57', 'db.createSessionToken was passed correct browser version')
          assert.equal(args[0].uaOS, 'Mac OS X', 'db.createSessionToken was passed correct os')
          assert.equal(args[0].uaOSVersion, '10.11', 'db.createSessionToken was passed correct os version')
          assert.equal(args[0].uaDeviceType, null, 'db.createSessionToken was passed correct device type')
          assert.equal(args[0].uaFormFactor, null, 'db.createSessionToken was passed correct form factor')
        })
      }
    )

    it(
      'succeeds even if notification blocked',
      () => {
        var uid = uuid.v4('binary').toString('hex')
        var mockDB = mocks.mockDB({
          email: TEST_EMAIL,
          uid: uid
        })
        var mockPush = mocks.mockPush()
        var mockMailer = {
          sendPasswordChangedNotification: sinon.spy(() => {
            return P.reject(error.emailBouncedHard())
          })
        }
        var mockLog = mocks.spyLog()
        var mockRequest = mocks.mockRequest({
          credentials: {
            uid: uid
          },
          payload: {
            authPW: crypto.randomBytes(32).toString('hex'),
            wrapKb: crypto.randomBytes(32).toString('hex'),
            sessionToken: crypto.randomBytes(32).toString('hex')
          },
          query: {
            keys: 'true'
          },
          log: mockLog
        })
        var passwordRoutes = makeRoutes({
          config: {
            domain: 'wibble',
            smtp: {}
          },
          db: mockDB,
          push: mockPush,
          mailer: mockMailer,
          log: mockLog
        })

        return runRoute(passwordRoutes, '/password/change/finish', mockRequest)
        .then(function(response) {
          assert.equal(mockDB.deletePasswordChangeToken.callCount, 1)
          assert.equal(mockDB.resetAccount.callCount, 1)

          assert.equal(mockPush.notifyPasswordChanged.callCount, 1)
          assert.deepEqual(mockPush.notifyPasswordChanged.firstCall.args[0], uid)

          const notifyArgs = mockLog.notifyAttachedServices.args[0]
          assert.equal(notifyArgs.length, 3, 'log.notifyAttachedServices was passed three arguments')
          assert.equal(notifyArgs[0], 'passwordChange', 'first argument was event name')
          assert.equal(notifyArgs[1], mockRequest, 'second argument was request object')
          assert.equal(notifyArgs[2].uid, uid, 'third argument was event data with a uid')
          assert.equal(notifyArgs[2].iss, 'wibble', 'third argument was event data with an issuer field')

          assert.equal(mockDB.account.callCount, 1)
          assert.equal(mockMailer.sendPasswordChangedNotification.callCount, 1)

          assert.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
          var args = mockLog.activityEvent.args[0]
          assert.equal(args.length, 1, 'log.activityEvent was passed one argument')
          assert.deepEqual(args[0], {
            event: 'account.changedPassword',
            service: undefined,
            uid: uid.toString('hex'),
            userAgent: 'test user-agent'
          }, 'argument was event data')
        })

      }
    )
  })
})
