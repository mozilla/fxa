/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var crypto = require('crypto')
var uuid = require('uuid')
var error = require('../../lib/error')
var getRoute = require('../routes_helpers').getRoute
var isA = require('joi')
var mocks = require('../mocks')
var P = require('../../lib/promise')

describe('/certificate/sign', () => {
  var deviceId = crypto.randomBytes(16)
  var mockDevices = mocks.mockDevices({
    deviceId: deviceId
  })
  const mockLog = mocks.spyLog()
  const mockRequest = mocks.mockRequest({
    credentials: {
      accountCreatedAt: Date.now(),
      emailVerified: true,
      lastAuthAt: function () {
        return Date.now()
      },
      locale: 'en',
      tokenId: crypto.randomBytes(16),
      uid: uuid.v4('binary')
    },
    log: mockLog,
    payload: {
      duration: 0,
      publicKey: {
        algorithm: 'RS',
        n: 'bar',
        e: 'baz'
      }
    },
    query: {}
  })

  it('without service', function () {
    return runTest({
      devices: mockDevices,
      log: mockLog
    }, mockRequest, function () {
      assert.equal(mockDevices.upsert.callCount, 1, 'devices.upsert was called once')
      var args = mockDevices.upsert.args[0]
      assert.equal(args.length, 3, 'devices.upsert was passed one argument')
      assert.equal(args[0], mockRequest, 'first argument was request object')
      assert.equal(args[1], mockRequest.auth.credentials, 'second argument was sessionToken')
      assert.deepEqual(args[2], {}, 'third argument was empty object')

      assert.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
      args = mockLog.activityEvent.args[0]
      assert.equal(args.length, 1, 'log.activityEvent was passed one argument')
      assert.deepEqual(args[0], {
        account_created_at: mockRequest.auth.credentials.accountCreatedAt,
        device_id: deviceId.toString('hex'),
        event: 'account.signed',
        service: undefined,
        uid: mockRequest.auth.credentials.uid.toString('hex'),
        userAgent: 'test user-agent'
      }, 'argument was event data')
    })
    .then(function () {
      mockLog.activityEvent.reset()
      mockDevices.upsert.reset()
    })
  })

  it('with service=sync', () => {
    mockRequest.query.service = 'sync'

    return runTest({
      devices: mockDevices,
      log: mockLog
    }, mockRequest, function () {
      assert.equal(mockDevices.upsert.callCount, 1, 'devices.upsert was called once')
      assert.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
    })
    .then(function () {
      mockLog.activityEvent.reset()
      mockDevices.upsert.reset()
    })
  })

  it('with service=foo', () => {
    mockRequest.query.service = 'foo'

    return runTest({
      devices: mockDevices,
      log: mockLog
    }, mockRequest, function () {
      assert.equal(mockDevices.upsert.callCount, 0, 'devices.upsert was not called')
      assert.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
      assert.equal(mockLog.activityEvent.args[0][0].device_id, undefined, 'device_id was undefined')
    })
    .then(function () {
      mockLog.activityEvent.reset()
      mockDevices.upsert.reset()
    })
  })

  it('with deviceId', () => {
    mockRequest.query.service = 'sync'
    mockRequest.auth.credentials.deviceId = crypto.randomBytes(16)

    return runTest({
      devices: mockDevices,
      log: mockLog
    }, mockRequest, function () {
      assert.equal(mockDevices.upsert.callCount, 0, 'devices.upsert was not called')
      assert.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
      assert.equal(mockLog.activityEvent.args[0][0].device_id, mockRequest.auth.credentials.deviceId.toString('hex'), 'device_id was correct')
    })
    .then(function () {
      mockLog.activityEvent.reset()
      mockDevices.upsert.reset()
    })
  })

  function runTest (options, request, assertions) {
    return new P(function (resolve, reject) {
      getRoute(makeRoutes(options), '/certificate/sign')
        .handler(request, (res) => {
          if (res instanceof Error) {
            reject(res)
          } else {
            resolve(res)
          }
        })
    })
    .then(assertions)
  }

  function makeRoutes (options) {
    options = options || {}

    var log = options.log || mocks.mockLog()

    return require('../../lib/routes/sign')(
      log,
      P,
      isA,
      error,
      options.signer || {
        sign: function () {
          return P.resolve({})
        }
      },
      options.db || {
        updateSessionToken: function () {},
        updateLocale: function () {}
      },
      options.domain || 'wibble',
      options.devices
    )
  }

})
