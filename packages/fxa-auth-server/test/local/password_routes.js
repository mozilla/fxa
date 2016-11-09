/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var mocks = require('../mocks')
var getRoute = require('../routes_helpers').getRoute

var P = require('../../lib/promise')
var uuid = require('uuid')
var crypto = require('crypto')
var isA = require('joi')
var error = require('../../lib/error')
const sinon = require('sinon')
const log = require('../../lib/log')

var TEST_EMAIL = 'foo@gmail.com'

function makeRoutes(options) {
  options = options || {}

  var config = options.config || {
    verifierVersion: 0,
    smtp: {}
  }
  var log = options.log || mocks.mockLog()
  var db = options.db || {}
  var Password = require('../../lib/crypto/password')(log, config)
  var customs = options.customs || {}
  var checkPassword = require('../../lib/routes/utils/password_check')(log, config, Password, customs, db)
  return require('../../lib/routes/password')(
    log,
    isA,
    error,
    db,
    Password,
    config.smtp.redirectDomain || '',
    options.mailer || {},
    config.verifierVersion,
    options.customs || {},
    checkPassword,
    options.push || {}
  )
}

describe('/password', () => {
  it(
    '/forgot/send_code',
    () => {
      var mockCustoms = mocks.mockCustoms()
      var uid = uuid.v4('binary')
      var mockDB = mocks.mockDB({
        email: TEST_EMAIL,
        passCode: 'foo',
        passwordForgotTokenId: crypto.randomBytes(16),
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
          email: TEST_EMAIL
        },
        query: {},
        metricsContext: mockMetricsContext
      })
      return new P(function(resolve) {
        getRoute(passwordRoutes, '/password/forgot/send_code')
          .handler(mockRequest, resolve)
      })
      .then(function(response) {
        assert.equal(mockDB.emailRecord.callCount, 1, 'db.emailRecord was called once')

        assert.equal(mockDB.createPasswordForgotToken.callCount, 1, 'db.createPasswordForgotToken was called once')
        var args = mockDB.createPasswordForgotToken.args[0]
        assert.equal(args.length, 1, 'db.createPasswordForgotToken was passed one argument')
        assert.deepEqual(args[0].uid, uid, 'db.createPasswordForgotToken was passed the correct uid')
        assert.equal(args[0].createdAt, undefined, 'db.createPasswordForgotToken was not passed a createdAt timestamp')

        assert.equal(mockRequest.validateMetricsContext.callCount, 1, 'validateMetricsContext was called')
        assert.equal(mockLog.flowEvent.callCount, 2, 'log.flowEvent was called twice')
        assert.equal(mockLog.flowEvent.args[0][0], 'password.forgot.send_code.start', 'password.forgot.send_code.start event was logged')
        assert.equal(mockLog.flowEvent.args[1][0], 'password.forgot.send_code.completed', 'password.forgot.send_code.completed event was logged')
      })
    }
  )

  it(
    '/forgot/resend_code',
    () => {
      var mockCustoms = mocks.mockCustoms()
      var uid = uuid.v4('binary')
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
          data: crypto.randomBytes(16),
          email: TEST_EMAIL,
          passCode: Buffer('abcdef', 'hex'),
          ttl: function () { return 17 },
          uid: uid
        },
        log: mockLog,
        payload: {
          email: TEST_EMAIL
        },
        query: {},
        metricsContext: mockMetricsContext
      })
      return new P(function(resolve) {
        getRoute(passwordRoutes, '/password/forgot/resend_code')
          .handler(mockRequest, resolve)
      })
        .then(function(response) {
          assert.equal(mockMailer.sendRecoveryCode.callCount, 1, 'mailer.sendRecoveryCode was called once')

          assert.equal(mockRequest.validateMetricsContext.callCount, 1, 'validateMetricsContext was called')
          assert.equal(mockLog.flowEvent.callCount, 2, 'log.flowEvent was called twice')
          assert.equal(mockLog.flowEvent.args[0][0], 'password.forgot.resend_code.start', 'password.forgot.resend_code.start event was logged')
          assert.equal(mockLog.flowEvent.args[1][0], 'password.forgot.resend_code.completed', 'password.forgot.resend_code.completed event was logged')
        })
    }
  )

  it(
    '/forgot/verify_code',
    () => {
      var mockCustoms = mocks.mockCustoms()
      var uid = uuid.v4('binary')
      var accountResetToken = {
        data: crypto.randomBytes(16)
      }
      var mockDB = mocks.mockDB({
        accountResetToken: accountResetToken,
        email: TEST_EMAIL,
        passCode: 'abcdef',
        passwordForgotTokenId: crypto.randomBytes(16),
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
          code: 'abcdef'
        },
        query: {}
      })
      return new P(function(resolve) {
        getRoute(passwordRoutes, '/password/forgot/verify_code')
          .handler(mockRequest, resolve)
      })
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
        assert.equal(mockLog.flowEvent.args[0][0], 'password.forgot.verify_code.start', 'password.forgot.verify_code.start event was logged')
        assert.equal(mockLog.flowEvent.args[1][0], 'password.forgot.verify_code.completed', 'password.forgot.verify_code.completed event was logged')
      })
    }
  )

  it(
    '/change/finish',
    () => {
      var uid = uuid.v4('binary')
      var mockRequest = mocks.mockRequest({
        credentials: {
          uid: uid.toString('hex')
        },
        payload: {
          authPW: crypto.randomBytes(32).toString('hex'),
          wrapKb: crypto.randomBytes(32).toString('hex'),
          sessionToken: crypto.randomBytes(32).toString('hex')
        },
        query: {
          keys: 'true'
        }
      })
      var mockDB = mocks.mockDB({
        email: TEST_EMAIL,
        uid: uid
      })
      var mockPush = mocks.mockPush()
      var mockMailer = mocks.mockMailer()
      var passwordRoutes = makeRoutes({
        db: mockDB,
        push: mockPush,
        mailer: mockMailer
      })

      return new P(function(resolve) {
        getRoute(passwordRoutes, '/password/change/finish')
          .handler(mockRequest, function(response) {
            resolve(response)
          })
      })
      .then(function(response) {
        assert.equal(mockDB.deletePasswordChangeToken.callCount, 1)
        assert.equal(mockDB.resetAccount.callCount, 1)

        assert.equal(mockPush.notifyPasswordChanged.callCount, 1)
        assert.equal(mockPush.notifyPasswordChanged.firstCall.args[0], uid.toString('hex'))

        assert.equal(mockDB.account.callCount, 1)
        assert.equal(mockMailer.sendPasswordChangedNotification.callCount, 1)
        assert.equal(mockMailer.sendPasswordChangedNotification.firstCall.args[0], TEST_EMAIL)
      })
    }
  )
})
