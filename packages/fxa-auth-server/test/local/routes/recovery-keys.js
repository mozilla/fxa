/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const getRoute = require('../../routes_helpers').getRoute
const mocks = require('../../mocks')
const P = require('../../../lib/promise')
const sinon = require('sinon')

let log, db, customs, routes, route, request, response
const email = 'test@email.com'
const recoveryKeyId = '000000'
const recoveryData = '11111111111'
const uid = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

describe('POST /recoveryKeys', () => {
  describe('should create recovery key', () => {
    beforeEach(() => {
      const requestOptions = {
        credentials: {uid, email},
        log,
        payload: {recoveryKeyId, recoveryData}
      }
      return setup({db: {}}, {}, '/recoveryKeys', requestOptions).then(r => response = r)
    })

    it('returned the correct response', () => {
      assert.deepEqual(response, {})
    })

    it('called log.begin correctly', () => {
      assert.equal(log.begin.callCount, 1)
      const args = log.begin.args[0]
      assert.equal(args.length, 2)
      assert.equal(args[0], 'createRecoveryKey')
      assert.equal(args[1], request)
    })

    it('called db.createRecoveryKey correctly', () => {
      assert.equal(db.createRecoveryKey.callCount, 1)
      const args = db.createRecoveryKey.args[0]
      assert.equal(args.length, 3)
      assert.equal(args[0], uid)
      assert.equal(args[1], recoveryKeyId)
      assert.equal(args[2], recoveryData)
    })

    it('called log.info correctly', () => {
      assert.equal(log.info.callCount, 1)
      const args = log.info.args[0]
      assert.equal(args.length, 1)
      assert.equal(args[0]['op'], 'account.recoveryKey.created')
    })

    it('called request.emitMetricsEvent correctly', () => {
      assert.equal(request.emitMetricsEvent.callCount, 1, 'called emitMetricsEvent')
      const args = request.emitMetricsEvent.args[0]
      assert.equal(args[0], 'recoveryKey.created', 'called emitMetricsEvent with correct event')
      assert.equal(args[1]['uid'], uid, 'called emitMetricsEvent with correct event')
    })
  })

  describe('should fail for unverified session', () => {
    it('returned the correct response', () => {
      const requestOptions = {
        credentials: {uid, email, tokenVerificationId: '1232311'},
      }
      return setup({db: {}}, {}, '/recoveryKeys', requestOptions)
        .then(assert.fail, (err) => {
          assert.deepEqual(err.errno, 138, 'returns unverified session error')
        })
    })
  })
})

describe('GET /recoveryKeys/{recoveryKeyId}', () => {
  describe('should get recovery key', () => {
    beforeEach(() => {
      const requestOptions = {
        credentials: {uid, email},
        params: {recoveryKeyId},
        log
      }
      return setup({db: {recoveryData}}, {}, '/recoveryKeys/{recoveryKeyId}', requestOptions)
        .then(r => response = r)
    })

    it('returned the correct response', () => {
      assert.deepEqual(response.recoveryData, recoveryData, 'return recovery data')
    })

    it('called log.begin correctly', () => {
      assert.equal(log.begin.callCount, 1)
      const args = log.begin.args[0]
      assert.equal(args.length, 2)
      assert.equal(args[0], 'getRecoveryKey')
      assert.equal(args[1], request)
    })

    it('called customs.checkAuthenticated correctly', () => {
      assert.equal(customs.checkAuthenticated.callCount, 1)
      const args = customs.checkAuthenticated.args[0]
      assert.equal(args.length, 3)
      assert.equal(args[0], 'getRecoveryKey')
      assert.equal(args[1], request.app.clientAddress)
      assert.equal(args[2], uid)
    })

    it('called db.getRecoveryKey correctly', () => {
      assert.equal(db.getRecoveryKey.callCount, 1)
      const args = db.getRecoveryKey.args[0]
      assert.equal(args.length, 2)
      assert.equal(args[0], uid)
      assert.equal(args[1], recoveryKeyId)
    })
  })
})

function setup(results, errors, path, requestOptions) {
  results = results || {}
  errors = errors || {}

  log = mocks.mockLog()
  db = mocks.mockDB(results.db, errors.db)
  customs = mocks.mockCustoms(errors.customs)
  routes = makeRoutes({log, db, customs})
  route = getRoute(routes, path)
  request = mocks.mockRequest(requestOptions)
  request.emitMetricsEvent = sinon.spy(() => P.resolve({}))
  return runTest(route, request)
}

function makeRoutes(options = {}) {
  const log = options.log || mocks.mockLog()
  const db = options.db || mocks.mockDB()
  const customs = options.customs || mocks.mockCustoms()
  const config = options.config || {signinConfirmation: {}}
  const Password = require('../../../lib/crypto/password')(log, config)
  return require('../../../lib/routes/recovery-keys')(log, db, Password, config.verifierVersion, customs)
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
