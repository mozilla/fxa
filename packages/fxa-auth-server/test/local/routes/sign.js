/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const ROOT_DIR = '../../..'

const assert = require('insist')
const crypto = require('crypto')
const uuid = require('uuid')
const getRoute = require('../../routes_helpers').getRoute
const mocks = require('../../mocks')
const P = require(`${ROOT_DIR}/lib/promise`)

describe('/certificate/sign', () => {
  let db, deviceId, mockDevices, mockLog, sessionToken, mockRequest

  before(() => {
    db = mocks.mockDB()
    deviceId = crypto.randomBytes(16).toString('hex')
    mockDevices = mocks.mockDevices({
      deviceId: deviceId
    })
    mockLog = mocks.mockLog()
    const Token = require(`${ROOT_DIR}/lib/tokens/token`)(mockLog)
    const SessionToken = require(`${ROOT_DIR}/lib/tokens/session_token`)(mockLog, Token, {
      tokenLifetimes: {
        sessionTokenWithoutDevice: 2419200000
      }
    })
    return SessionToken.create({
      uid: uuid.v4('binary').toString('hex'),
      email: 'foo@example.com',
      emailVerified: true,
      locale: 'en',
      uaBrowser: 'should be overridden by the request data',
      uaBrowserVersion: '42',
      uaOS: 'foo',
      uaOSVersion: 'bar',
      uaDeviceType: 'baz',
      uaFormFactor: 'qux'
    })
    .then(result => {
      assert.equal(result.lastAccessTime, undefined, 'lastAccessTime is not set')
      sessionToken = result
      mockRequest = mocks.mockRequest({
        credentials: sessionToken,
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:55.0) Gecko/20100101 Firefox/55.0'
        },
        uaBrowser: 'Firefox',
        uaBrowserVersion: '55',
        uaOS: 'Windows',
        uaOSVersion: '10',
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
    })
  })

  it('without service', function () {
    return runTest({
      db,
      devices: mockDevices,
      log: mockLog
    }, mockRequest, function () {
      assert.equal(db.updateSessionToken.callCount, 1, 'db.updateSessionToken was called once')
      let args = db.updateSessionToken.args[0]
      assert.equal(args.length, 2, 'db.updateSessionToken was passed two arguments')
      assert.equal(args[0].uid, sessionToken.uid, 'first argument uid property was correct')
      assert.equal(args[0].email, sessionToken.email, 'first argument email property was correct')
      assert.equal(args[0].uaBrowser, 'Firefox', 'first argument uaBrowser property was correct')
      assert.equal(args[0].uaBrowserVersion, '55', 'first argument uaBrowserVersion property was correct')
      assert.equal(args[0].uaOS, 'Windows', 'first argument uaOS property was correct')
      assert.equal(args[0].uaOSVersion, '10', 'first argument uaOSVersion property was correct')
      assert.equal(args[0].uaDeviceType, null, 'first argument uaDeviceType property was null')
      assert.equal(args[0].uaFormFactor, null, 'first argument uaFormFactor property was null')
      assert.ok(args[0].lastAccessTime, 'lastAccessTime is set')
      assert.ok(args[0].lastAccessTime > args[0].createdAt, 'lastAccessTime is updated')
      assert.equal(args[1], mockRequest.app.geo, 'second argument was getGeoData result')

      assert.equal(mockDevices.upsert.callCount, 1, 'devices.upsert was called once')
      args = mockDevices.upsert.args[0]
      assert.equal(args.length, 3, 'devices.upsert was passed one argument')
      assert.equal(args[0], mockRequest, 'first argument was request object')
      assert.equal(args[1], mockRequest.auth.credentials, 'second argument was sessionToken')
      assert.deepEqual(args[2], {
        uaBrowser: 'Firefox',
        uaBrowserVersion: '55',
        uaOS: 'Windows',
        uaOSVersion: '10',
      }, 'third argument was UA info')

      assert.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
      args = mockLog.activityEvent.args[0]
      assert.equal(args.length, 1, 'log.activityEvent was passed one argument')
      assert.deepEqual(args[0], {
        device_id: deviceId.toString('hex'),
        event: 'account.signed',
        service: undefined,
        uid: mockRequest.auth.credentials.uid.toString('hex'),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:55.0) Gecko/20100101 Firefox/55.0'
      }, 'argument was event data')
    })
    .finally(function () {
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
    .finally(function () {
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
    .finally(function () {
      mockLog.activityEvent.reset()
      mockDevices.upsert.reset()
    })
  })

  it('with deviceId', () => {
    mockRequest.query.service = 'sync'
    mockRequest.auth.credentials.deviceId = crypto.randomBytes(16).toString('hex')

    return runTest({
      devices: mockDevices,
      log: mockLog
    }, mockRequest, function () {
      assert.equal(mockDevices.upsert.callCount, 0, 'devices.upsert was not called')
      assert.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
      assert.equal(mockLog.activityEvent.args[0][0].device_id, mockRequest.auth.credentials.deviceId.toString('hex'), 'device_id was correct')
    })
    .finally(function () {
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

    return require('../../../lib/routes/sign')(
      log,
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
