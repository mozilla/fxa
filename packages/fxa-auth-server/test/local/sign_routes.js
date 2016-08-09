/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var crypto = require('crypto')
var uuid = require('uuid')
var error = require('../../lib/error')
var getRoute = require('../routes_helpers').getRoute
var isA = require('joi')
var mocks = require('../mocks')
var P = require('../../lib/promise')
var test = require('../ptaptest')

test(
  '/certificate/sign',
  function (t) {
    t.plan(4)
    var deviceId = crypto.randomBytes(16)
    var mockDevices = mocks.mockDevices({
      deviceId: deviceId
    })
    var mockLog = mocks.spyLog()
    var mockRequest = mocks.mockRequest({
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

    t.test('without service', function (t) {
      return runTest({
        devices: mockDevices,
        log: mockLog
      }, mockRequest, function () {
        t.equal(mockDevices.upsert.callCount, 1, 'devices.upsert was called once')
        var args = mockDevices.upsert.args[0]
        t.equal(args.length, 3, 'devices.upsert was passed one argument')
        t.equal(args[0], mockRequest, 'first argument was request object')
        t.equal(args[1], mockRequest.auth.credentials, 'second argument was sessionToken')
        t.deepEqual(args[2], {}, 'third argument was empty object')

        t.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
        args = mockLog.activityEvent.args[0]
        t.equal(args.length, 3, 'log.activityEvent was passed three arguments')
        t.equal(args[0], 'account.signed', 'first argument was event name')
        t.equal(args[1], mockRequest, 'second argument was request object')
        t.deepEqual(args[2], {
          uid: mockRequest.auth.credentials.uid.toString('hex'),
          account_created_at: mockRequest.auth.credentials.accountCreatedAt,
          device_id: deviceId.toString('hex')
        }, 'third argument was event data')
      })
      .then(function () {
        mockLog.activityEvent.reset()
        mockDevices.upsert.reset()
      })
    })

    t.test('with service=sync', function (t) {
      mockRequest.query.service = 'sync'

      return runTest({
        devices: mockDevices,
        log: mockLog
      }, mockRequest, function () {
        t.equal(mockDevices.upsert.callCount, 1, 'devices.upsert was called once')
        t.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
      })
      .then(function () {
        mockLog.activityEvent.reset()
        mockDevices.upsert.reset()
      })
    })

    t.test('with service=foo', function (t) {
      mockRequest.query.service = 'foo'

      return runTest({
        devices: mockDevices,
        log: mockLog
      }, mockRequest, function () {
        t.equal(mockDevices.upsert.callCount, 0, 'devices.upsert was not called')
        t.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
        t.equal(mockLog.activityEvent.args[0][2].device_id, undefined, 'device_id was undefined')
      })
      .then(function () {
        mockLog.activityEvent.reset()
        mockDevices.upsert.reset()
      })
    })

    t.test('with deviceId', function (t) {
      mockRequest.query.service = 'sync'
      mockRequest.auth.credentials.deviceId = crypto.randomBytes(16)

      return runTest({
        devices: mockDevices,
        log: mockLog
      }, mockRequest, function () {
        t.equal(mockDevices.upsert.callCount, 0, 'devices.upsert was not called')
        t.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
        t.equal(mockLog.activityEvent.args[0][2].device_id, mockRequest.auth.credentials.deviceId.toString('hex'), 'device_id was correct')
      })
      .then(function () {
        mockLog.activityEvent.reset()
        mockDevices.upsert.reset()
      })
    })
  }
)

function runTest (options, request, assertions) {
  return new P(function (resolve) {
    getRoute(makeRoutes(options), '/certificate/sign')
      .handler(request, resolve)
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

