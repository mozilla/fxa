/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const getRoute = require('../../routes_helpers').getRoute
const mocks = require('../../mocks')
const otplib = require('otplib')
const P = require('../../../lib/promise')
const sinon = require('sinon')

let log, db, customs, routes, route, request, requestOptions, mailer
const TEST_EMAIL = 'test@email.com'
const secret = 'KE3TGQTRNIYFO2KOPE4G6ULBOV2FQQTN'

describe('totp', () => {
  beforeEach(() => {
    requestOptions = {
      metricsContext: mocks.mockMetricsContext(),
      credentials: {
        uid: 'uid',
        email: TEST_EMAIL
      },
      log: log,
      payload: {
        metricsContext: {
          flowBeginTime: Date.now(),
          flowId: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
        }
      }
    }
  })

  describe('/totp/create', () => {
    it('should create TOTP token', () => {
      return setup({db: {email: TEST_EMAIL}}, {}, '/totp/create', requestOptions)
        .then((response) => {
          assert.ok(response.qrCodeUrl)
          assert.ok(response.secret)
          assert.equal(db.createTotpToken.callCount, 1, 'called create TOTP token')

          // emits correct metrics
          assert.equal(request.emitMetricsEvent.callCount, 1, 'called emitMetricsEvent')
          const args = request.emitMetricsEvent.args[0]
          assert.equal(args[0], 'totpToken.created', 'called emitMetricsEvent with correct event')
          assert.equal(args[1]['uid'], 'uid', 'called emitMetricsEvent with correct event')
        })
    })

    it('should be disabled in unverified session', () => {
      requestOptions.credentials.tokenVerificationId = 'notverified'
      return setup({db: {email: TEST_EMAIL}}, {}, '/totp/create', requestOptions)
        .then(assert.fail, (err) => {
          assert.deepEqual(err.errno, 138, 'unverified session error')
        })
    })
  })

  describe('/totp/destroy', () => {
    it('should delete TOTP token', () => {
      return setup({db: {email: TEST_EMAIL}}, {}, '/totp/destroy', requestOptions)
        .then((response) => {
          assert.ok(response)
          assert.equal(db.deleteTotpToken.callCount, 1, 'called delete TOTP token')
        })
    })

    it('should not delete TOTP token in non-totp verified session', () => {
      requestOptions.credentials.authenticatorAssuranceLevel = 1
      return setup({db: {email: TEST_EMAIL}}, {}, '/totp/destroy', requestOptions)
        .then(assert.fail, (err) => {
          assert.deepEqual(err.errno, 138, 'unverified session error')
        })
    })

    it('should be disabled in unverified session', () => {
      requestOptions.credentials.tokenVerificationId = 'notverified'
      return setup({db: {email: TEST_EMAIL}}, {}, '/totp/destroy', requestOptions)
        .then(assert.fail, (err) => {
          assert.deepEqual(err.errno, 138, 'unverified session error')
        })
    })
  })

  describe('/totp/exists', () => {
    it('should check for TOTP token', () => {
      return setup({db: {email: TEST_EMAIL}}, {}, '/totp/exists', requestOptions)
        .then((response) => {
          assert.ok(response)
          assert.equal(db.totpToken.callCount, 1, 'called get TOTP token')
        })
    })

    it('should be disabled in unverified session', () => {
      requestOptions.credentials.tokenVerificationId = 'notverified'
      return setup({db: {email: TEST_EMAIL}}, {}, '/totp/exists', requestOptions)
        .then(assert.fail, (err) => {
          assert.deepEqual(err.errno, 138, 'unverified session error')
        })
    })
  })

  describe('/session/verify/totp', () => {
    it('should return true for valid TOTP code', () => {
      const authenticator = new otplib.authenticator.Authenticator()
      authenticator.options = Object.assign({}, otplib.authenticator.options, {secret})
      requestOptions.payload = {
        code: authenticator.generate(secret)
      }
      return setup({db: {email: TEST_EMAIL}}, {}, '/session/verify/totp', requestOptions)
        .then((response) => {
          assert.equal(response.success, true, 'should be valid code')
          assert.equal(db.totpToken.callCount, 1, 'called get TOTP token')

          // emits correct metrics
          assert.equal(request.emitMetricsEvent.callCount, 1, 'called emitMetricsEvent')
          const args = request.emitMetricsEvent.args[0]
          assert.equal(args[0], 'totpToken.verified', 'called emitMetricsEvent with correct event')
          assert.equal(args[1]['uid'], 'uid', 'called emitMetricsEvent with correct event')
        })
    })

    it('should return false for invalid TOTP code', () => {
      requestOptions.payload = {
        code: 'NOTVALID'
      }
      return setup({db: {email: TEST_EMAIL}}, {}, '/session/verify/totp', requestOptions)
        .then((response) => {
          assert.equal(response.success, false, 'should be valid code')
          assert.equal(db.totpToken.callCount, 1, 'called get TOTP token')

          // emits correct metrics
          assert.equal(request.emitMetricsEvent.callCount, 1, 'called emitMetricsEvent')
          const args = request.emitMetricsEvent.args[0]
          assert.equal(args[0], 'totpToken.unverified', 'called emitMetricsEvent with correct event')
          assert.equal(args[1]['uid'], 'uid', 'called emitMetricsEvent with correct event')
        })
    })
  })
})

function setup(results, errors, routePath, requestOptions) {
  results = results || {}
  errors = errors || {}
  log = mocks.mockLog()
  db = mocks.mockDB(results.db, errors.db)
  customs = mocks.mockCustoms(errors.customs)
  mailer = mocks.mockMailer()
  routes = makeRoutes({log, db, customs, mailer})
  route = getRoute(routes, routePath)
  request = mocks.mockRequest(requestOptions)
  request.emitMetricsEvent = sinon.spy(() => P.resolve({}))
  return runTest(route, request)
}

function makeRoutes(options = {}) {
  const config = {step: 30}
  const log = options.log || mocks.mockLog()
  const db = options.db || mocks.mockDB()
  const mailer = options.mailer || mocks.mockMailer()

  db.createTotpToken = sinon.spy(() => {
    return P.resolve({
      qrCodeUrl: 'some base64 encoded png',
      sharedSecret: secret
    })
  })
  db.totpToken = sinon.spy(() => {
    return P.resolve({
      verified: true,
      enabled: true,
      sharedSecret: secret
    })
  })
  const customs = options.customs || mocks.mockCustoms()

  return require('../../../lib/routes/totp')(log, db, mailer, customs, config)
}

function runTest(route, request) {
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
