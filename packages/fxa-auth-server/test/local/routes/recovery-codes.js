/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const sinon = require('sinon')
const assert = Object.assign({}, sinon.assert, require('insist'))
const getRoute = require('../../routes_helpers').getRoute
const mocks = require('../../mocks')
const error = require('../../../lib/error')
const P = require('../../../lib/promise')

let log, db, customs, routes, route, request, requestOptions, mailer
const TEST_EMAIL = 'test@email.com'

function runTest(routePath, requestOptions) {
  const config = { recoveryCodes: {} }
  routes = require('../../../lib/routes/recovery-codes')(log, db, config, customs, mailer)
  route = getRoute(routes, routePath)
  request = mocks.mockRequest(requestOptions)
  request.emitMetricsEvent = sinon.spy(() => P.resolve({}))
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

describe('recovery codes', () => {

  beforeEach(() => {
    log = mocks.mockLog()
    customs = mocks.mockCustoms()
    mailer = mocks.mockMailer()
    db = mocks.mockDB()
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

  describe('/session/verify/recoveryCode', () => {
    it('should rate-limit attempts to use a recovery code via customs', () => {
      requestOptions.payload.code = '1234567890'
      db.consumeRecoveryCode = sinon.spy(code => {
        throw error.recoveryCodeNotFound()
      })
      return runTest('/session/verify/recoveryCode', requestOptions)
        .then(assert.fail, err => {
          assert.equal(err.errno, error.ERRNO.RECOVERY_CODE_NOT_FOUND)
          assert.calledWithExactly(customs.check, request, TEST_EMAIL, 'verifyRecoveryCode')
        })
    })
  })
})
