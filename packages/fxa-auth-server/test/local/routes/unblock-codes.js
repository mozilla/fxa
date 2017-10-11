/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const getRoute = require('../../routes_helpers').getRoute
const mocks = require('../../mocks')
const P = require('../../../lib/promise')
const proxyquire = require('proxyquire')
const uuid = require('uuid')

function makeRoutes (options, requireMocks) {
  options = options || {}

  const config = options.config || {}
  const log = options.log || mocks.mockLog()
  const db = options.db || mocks.mockDB()
  const customs = options.customs || {
    check: function () { return P.resolve(true) }
  }

  return proxyquire('../../../lib/routes/unblock-codes', requireMocks || {})(
    log, db, options.mailer || {}, config.signinUnblock || {}, customs
  )
}

function runTest (route, request, assertions) {
  return new P(function (resolve, reject) {
    route.handler(request, response => {
      if (response instanceof Error) {
        reject(response)
      } else {
        resolve(response)
      }
    })
  })
    .then(assertions)
}

describe('/account/login/send_unblock_code', function () {
  var uid = uuid.v4('binary').toString('hex')
  var email = 'unblock@example.com'
  const mockLog = mocks.mockLog()
  var mockRequest = mocks.mockRequest({
    log: mockLog,
    payload: {
      email: email,
      metricsContext: {
        flowBeginTime: Date.now(),
        flowId: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103'
      }
    }
  })
  var mockMailer = mocks.mockMailer()
  var mockDb = mocks.mockDB({
    uid: uid,
    email: email
  })
  var config = {
    signinUnblock: {}
  }
  var accountRoutes = makeRoutes({
    config: config,
    db: mockDb,
    log: mockLog,
    mailer: mockMailer
  })
  var route = getRoute(accountRoutes, '/account/login/send_unblock_code')

  afterEach(function () {
    mockDb.emailRecord.reset()
    mockDb.createUnblockCode.reset()
    mockMailer.sendUnblockCode.reset()
  })

  it('signin unblock enabled', function () {
    return runTest(route, mockRequest, function (response) {
      assert.ok(! (response instanceof Error), response.stack)
      assert.deepEqual(response, {}, 'response has no keys')

      assert.equal(mockDb.emailRecord.callCount, 1, 'db.emailRecord called')
      assert.equal(mockDb.emailRecord.args[0][0], email)

      assert.equal(mockDb.createUnblockCode.callCount, 1, 'db.createUnblockCode called')
      var dbArgs = mockDb.createUnblockCode.args[0]
      assert.equal(dbArgs.length, 1)
      assert.equal(dbArgs[0], uid)

      assert.equal(mockMailer.sendUnblockCode.callCount, 1, 'called mailer.sendUnblockCode')
      var args = mockMailer.sendUnblockCode.args[0]
      assert.equal(args.length, 3, 'mailer.sendUnblockCode called with 3 args')

      assert.equal(mockLog.flowEvent.callCount, 1, 'log.flowEvent was called once')
      assert.equal(mockLog.flowEvent.args[0][0].event, 'account.login.sentUnblockCode', 'event was account.login.sentUnblockCode')
      mockLog.flowEvent.reset()
    })
  })

  it('uses normalized email address for feature flag', function () {
    mockRequest.payload.email = 'UNBLOCK@example.com'

    return runTest(route, mockRequest, function(response) {
      assert.ok(! (response instanceof Error), response.stack)
      assert.deepEqual(response, {}, 'response has no keys')

      assert.equal(mockDb.emailRecord.callCount, 1, 'db.emailRecord called')
      assert.equal(mockDb.emailRecord.args[0][0], mockRequest.payload.email)
      assert.equal(mockDb.createUnblockCode.callCount, 1, 'db.createUnblockCode called')
      assert.equal(mockMailer.sendUnblockCode.callCount, 1, 'called mailer.sendUnblockCode')
    })
  })
})

describe('/account/login/reject_unblock_code', function () {
  it('should consume the unblock code', () => {
    var uid = uuid.v4('binary').toString('hex')
    var unblockCode = 'A1B2C3D4'
    var mockRequest = mocks.mockRequest({
      payload: {
        uid: uid,
        unblockCode: unblockCode
      }
    })
    var mockDb = mocks.mockDB()
    var accountRoutes = makeRoutes({
      db: mockDb
    })
    var route = getRoute(accountRoutes, '/account/login/reject_unblock_code')

    return runTest(route, mockRequest, function (response) {
      assert.ok(! (response instanceof Error), response.stack)
      assert.deepEqual(response, {}, 'response has no keys')

      assert.equal(mockDb.consumeUnblockCode.callCount, 1, 'consumeUnblockCode is called')
      var args = mockDb.consumeUnblockCode.args[0]
      assert.equal(args.length, 2)
      assert.equal(args[0].toString('hex'), uid)
      assert.equal(args[1], unblockCode)
    })
  })
})
