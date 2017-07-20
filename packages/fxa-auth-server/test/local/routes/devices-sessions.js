/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const crypto = require('crypto')
const error = require('../../../lib/error')
const getRoute = require('../../routes_helpers').getRoute
const isA = require('joi')
const mocks = require('../../mocks')
const P = require('../../../lib/promise')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const uuid = require('uuid')

function makeRoutes (options, requireMocks) {
  options = options || {}

  const config = options.config || {}
  config.smtp = config.smtp ||  {}
  config.memcached = config.memcached || {
    address: '127.0.0.1:1121',
    idle: 500,
    lifetime: 30
  }
  config.i18n = {
    supportedLanguages: ['en'],
    defaultLanguage: 'en'
  }
  config.push = {
    allowedServerRegex: /^https:\/\/updates\.push\.services\.mozilla\.com(\/.*)?$/
  }

  const log = options.log || mocks.mockLog()
  const db = options.db || mocks.mockDB()
  const customs = options.customs || {
    check: function () { return P.resolve(true) }
  }
  const push = options.push || require('../../../lib/push')(log, db, {})
  return proxyquire('../../../lib/routes/devices-sessions', requireMocks || {})(
    log, db, config, customs, push,
    options.devices || require('../../../lib/devices')(log, db, push)
  )
}

function runTest (route, request, assertions) {
  return new P(function (resolve, reject) {
    route.handler(request, function (response) {
      //resolve(response)
      if (response instanceof Error) {
        reject(response)
      } else {
        resolve(response)
      }
    })
  })
    .then(assertions)
}

function hexString (bytes) {
  return crypto.randomBytes(bytes).toString('hex')
}

describe('/account/device', function () {
  var config = {}
  var uid = uuid.v4('binary').toString('hex')
  var deviceId = crypto.randomBytes(16).toString('hex')
  var mockRequest = mocks.mockRequest({
    credentials: {
      deviceCallbackPublicKey: '',
      deviceCallbackURL: '',
      deviceId: deviceId,
      deviceName: 'my awesome device',
      deviceType: 'desktop',
      tokenId: crypto.randomBytes(16).toString('hex'),
      uid: uid
    },
    payload: {
      id: deviceId.toString('hex'),
      name: 'my awesome device'
    }
  })
  var mockDevices = mocks.mockDevices()
  var mockLog = mocks.spyLog()
  var accountRoutes = makeRoutes({
    config: config,
    devices: mockDevices,
    log: mockLog
  })
  var route = getRoute(accountRoutes, '/account/device')

  it('identical data', function () {
    return runTest(route, mockRequest, function (response) {
      assert.equal(mockDevices.upsert.callCount, 0, 'the device was not updated')
      assert.deepEqual(response, mockRequest.payload)
    })
      .then(function () {
        mockDevices.upsert.reset()
      })
  })

  it('different data', function () {
    mockRequest.auth.credentials.deviceId = crypto.randomBytes(16).toString('hex')
    var payload = mockRequest.payload
    payload.name = 'my even awesomer device'
    payload.type = 'phone'
    payload.pushCallback = 'https://push.services.mozilla.com/123456'
    payload.pushPublicKey = mocks.MOCK_PUSH_KEY

    return runTest(route, mockRequest, function (response) {
      assert.equal(mockDevices.upsert.callCount, 1, 'devices.upsert was called once')
      var args = mockDevices.upsert.args[0]
      assert.equal(args.length, 3, 'devices.upsert was passed three arguments')
      assert.equal(args[0], mockRequest, 'first argument was request object')
      assert.deepEqual(args[1].tokenId, mockRequest.auth.credentials.tokenId, 'second argument was session token')
      assert.deepEqual(args[1].uid, uid, 'sessionToken.uid was correct')
      assert.deepEqual(args[2], mockRequest.payload, 'third argument was payload')
    })
      .then(function () {
        mockDevices.upsert.reset()
      })
  })

  it('with no id in payload', function () {
    mockRequest.payload.id = undefined

    return runTest(route, mockRequest, function (response) {
      assert.equal(mockDevices.upsert.callCount, 1, 'devices.upsert was called once')
      var args = mockDevices.upsert.args[0]
      assert.equal(args[2].id, mockRequest.auth.credentials.deviceId.toString('hex'), 'payload.id defaulted to credentials.deviceId')
    })
      .then(function () {
        mockDevices.upsert.reset()
      })
  })

  it('device updates disabled', function () {
    config.deviceUpdatesEnabled = false

    return runTest(route, mockRequest, function () {
      assert(false, 'should have thrown')
    })
      .then(() => assert.ok(false), function (err) {
        assert.equal(err.output.statusCode, 503, 'correct status code is returned')
        assert.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED, 'correct errno is returned')
      })
  })
})

describe('/account/devices/notify', function () {
  var config = {}
  var uid = uuid.v4('binary').toString('hex')
  var deviceId = crypto.randomBytes(16).toString('hex')
  var mockLog = mocks.spyLog()
  var mockRequest = mocks.mockRequest({
    log: mockLog,
    credentials: {
      uid: uid,
      deviceId: deviceId
    }
  })
  var pushPayload = {
    version: 1,
    command: 'sync:collection_changed',
    data: {
      collections: ['clients']
    }
  }
  var mockPush = mocks.mockPush()
  var mockCustoms = mocks.mockCustoms()
  var accountRoutes = makeRoutes({
    config: config,
    customs: mockCustoms,
    push: mockPush
  })
  var route = getRoute(accountRoutes, '/account/devices/notify')

  it('bad payload', function () {
    mockRequest.payload = {
      to: ['bogusid1'],
      payload: {
        bogus: 'payload'
      }
    }
    return runTest(route, mockRequest, function () {
      assert(false, 'should have thrown')
    })
      .then(() => assert(false), function (err) {
        assert.equal(mockPush.pushToDevices.callCount, 0, 'mockPush.pushToDevices was not called')
        assert.equal(err.errno, 107, 'Correct errno for invalid push payload')
      })
  })

  it('all devices', function () {
    mockRequest.payload = {
      to: 'all',
      excluded: ['bogusid'],
      TTL: 60,
      payload: pushPayload
    }
    // We don't wait on pushToAllDevices in the request handler, that's why
    // we have to wait on it manually by spying.
    var pushToAllDevicesPromise = P.defer()
    mockPush.pushToAllDevices = sinon.spy(function () {
      pushToAllDevicesPromise.resolve()
      return P.resolve()
    })
    return runTest(route, mockRequest, function (response) {
      return pushToAllDevicesPromise.promise.then(function () {
        assert.equal(mockCustoms.checkAuthenticated.callCount, 1, 'mockCustoms.checkAuthenticated was called once')
        assert.equal(mockPush.pushToAllDevices.callCount, 1, 'mockPush.pushToAllDevices was called once')
        var args = mockPush.pushToAllDevices.args[0]
        assert.equal(args.length, 3, 'mockPush.pushToAllDevices was passed three arguments')
        assert.equal(args[0], uid, 'first argument was the device uid')
        assert.equal(args[1], 'devicesNotify', 'second argument was the devicesNotify reason')
        assert.deepEqual(args[2], {
          data: Buffer.from(JSON.stringify(pushPayload)),
          excludedDeviceIds: ['bogusid'],
          TTL: 60
        }, 'third argument was the push options')
      })
    })
  })

  it('extra push payload properties are rejected', function () {
    var extraPropsPayload = JSON.parse(JSON.stringify(pushPayload))
    extraPropsPayload.extra = true
    extraPropsPayload.data.extra = true
    mockRequest.payload = {
      to: 'all',
      excluded: ['bogusid'],
      TTL: 60,
      payload: extraPropsPayload
    }
    // We don't wait on pushToAllDevices in the request handler, that's why
    // we have to wait on it manually by spying.
    var pushToAllDevicesPromise = P.defer()
    mockPush.pushToAllDevices = sinon.spy(function () {
      pushToAllDevicesPromise.resolve()
      return Promise.resolve()
    })
    return runTest(route, mockRequest, function () {
      assert(false, 'should have thrown')
    })
    .then(() => assert.ok(false), function (err) {
      assert.equal(err.output.statusCode, 400, 'correct status code is returned')
      assert.equal(err.errno, error.ERRNO.INVALID_PARAMETER, 'correct errno is returned')
    })
  })

  it('specific devices', function () {
    mockCustoms.checkAuthenticated.reset()
    mockLog.activityEvent.reset()
    mockLog.error.reset()
    mockRequest.payload = {
      to: ['bogusid1', 'bogusid2'],
      TTL: 60,
      payload: pushPayload
    }
    // We don't wait on pushToDevices in the request handler, that's why
    // we have to wait on it manually by spying.
    var pushToDevicesPromise = P.defer()
    mockPush.pushToDevices = sinon.spy(function () {
      pushToDevicesPromise.resolve()
      return P.resolve()
    })
    return runTest(route, mockRequest, function (response) {
      return pushToDevicesPromise.promise.then(function () {
        assert.equal(mockCustoms.checkAuthenticated.callCount, 1, 'mockCustoms.checkAuthenticated was called once')
        assert.equal(mockPush.pushToDevices.callCount, 1, 'mockPush.pushToDevices was called once')
        var args = mockPush.pushToDevices.args[0]
        assert.equal(args.length, 4, 'mockPush.pushToDevices was passed four arguments')
        assert.equal(args[0], uid, 'first argument was the device uid')
        assert.deepEqual(args[1], ['bogusid1', 'bogusid2'], 'second argument was the list of device ids')
        assert.equal(args[2], 'devicesNotify', 'third argument was the devicesNotify reason')
        assert.deepEqual(args[3], {
          data: Buffer.from(JSON.stringify(pushPayload)),
          TTL: 60
        }, 'fourth argument was the push options')
        assert.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
        args = mockLog.activityEvent.args[0]
        assert.equal(args.length, 1, 'log.activityEvent was passed one argument')
        assert.deepEqual(args[0], {
          event: 'sync.sentTabToDevice',
          service: 'sync',
          userAgent: 'test user-agent',
          uid: uid.toString('hex'),
          device_id: deviceId.toString('hex')
        }, 'event data was correct')
        assert.equal(mockLog.error.callCount, 0, 'log.error was not called')
      })
    })
  })

  it('does not log activity event for non-send-tab-related messages', function () {
    mockPush.pushToDevices.reset()
    mockLog.activityEvent.reset()
    mockLog.error.reset()
    mockRequest.payload = {
      to: ['bogusid1', 'bogusid2'],
      TTL: 60,
      payload: {
        version: 1,
        command: 'fxaccounts:password_reset'
      }
    }
    return runTest(route, mockRequest, function (response) {
      assert.equal(mockPush.pushToDevices.callCount, 1, 'mockPush.pushToDevices was called once')
      assert.equal(mockLog.activityEvent.callCount, 0, 'log.activityEvent was not called')
      assert.equal(mockLog.error.callCount, 0, 'log.error was not called')
    })
  })

  it('device driven notifications disabled', function () {
    config.deviceNotificationsEnabled = false
    mockRequest.payload = {
      to: 'all',
      excluded: ['bogusid'],
      TTL: 60,
      payload: pushPayload
    }

    return runTest(route, mockRequest, function () {
      assert(false, 'should have thrown')
    })
      .then(() => assert.ok(false), function (err) {
        assert.equal(err.output.statusCode, 503, 'correct status code is returned')
        assert.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED, 'correct errno is returned')
      })
  })

  it('throws error if customs blocked the request', function () {
    mockRequest.payload = {
      to: 'all',
      excluded: ['bogusid'],
      TTL: 60,
      payload: pushPayload
    }
    config.deviceNotificationsEnabled = true

    mockCustoms = mocks.mockCustoms({
      checkAuthenticated: error.tooManyRequests(1)
    })
    route = getRoute(makeRoutes({customs: mockCustoms}), '/account/devices/notify')

    return runTest(route, mockRequest, function (response) {
      assert(false, 'should have thrown')
    })
      .then(() => assert(false), function (err) {
        assert.equal(mockCustoms.checkAuthenticated.callCount, 1, 'mockCustoms.checkAuthenticated was called once')
        assert.equal(err.message, 'Client has sent too many requests')
      })
  })

  it('logs error if no devices found', () => {
    mockRequest.payload = {
      to: ['bogusid1', 'bogusid2'],
      TTL: 60,
      payload: pushPayload
    }

    var mockLog = mocks.spyLog()
    var mockPush = mocks.mockPush({
      pushToDevices: () => P.reject('Devices ids not found in devices')
    })
    var mockCustoms = {
      checkAuthenticated: () => P.resolve()
    }

    route = getRoute(makeRoutes({
      customs: mockCustoms,
      log: mockLog,
      push: mockPush
    }), '/account/devices/notify')

    return runTest(route, mockRequest, function (response) {
      assert.equal(JSON.stringify(response), '{}', 'response should not throw push errors')
    })
  })
})

describe('/account/device/destroy', function () {
  it('should work', () => {
    var uid = uuid.v4('binary').toString('hex')
    var deviceId = crypto.randomBytes(16).toString('hex')
    var mockLog = mocks.spyLog()
    var mockDB = mocks.mockDB()
    var mockRequest = mocks.mockRequest({
      credentials: {
        uid: uid
      },
      log: mockLog,
      payload: {
        id: deviceId
      }
    })
    var mockPush = mocks.mockPush()
    var accountRoutes = makeRoutes({
      db: mockDB,
      log: mockLog,
      push: mockPush
    })
    var route = getRoute(accountRoutes, '/account/device/destroy')

    return runTest(route, mockRequest, function () {
      assert.equal(mockDB.deleteDevice.callCount, 1)

      assert.equal(mockPush.notifyDeviceDisconnected.callCount, 1)
      assert.equal(mockPush.notifyDeviceDisconnected.firstCall.args[0], mockRequest.auth.credentials.uid)
      assert.equal(mockPush.notifyDeviceDisconnected.firstCall.args[1], deviceId)

      assert.equal(mockLog.activityEvent.callCount, 1, 'log.activityEvent was called once')
      var args = mockLog.activityEvent.args[0]
      assert.equal(args.length, 1, 'log.activityEvent was passed one argument')
      assert.deepEqual(args[0], {
        event: 'device.deleted',
        service: undefined,
        userAgent: 'test user-agent',
        uid: uid.toString('hex'),
        device_id: deviceId
      }, 'event data was correct')

      assert.equal(mockLog.notifyAttachedServices.callCount, 1)
      args = mockLog.notifyAttachedServices.args[0]
      assert.equal(args.length, 3)
      assert.equal(args[0], 'device:delete')
      assert.equal(args[1], mockRequest)
      var details = args[2]
      assert.equal(details.uid, uid)
      assert.equal(details.id, deviceId)
      assert.ok(Date.now() - details.timestamp < 100)
    })
  })
})

describe('/account/devices', function () {
  it('should return the devices list', () => {
    var mockRequest = mocks.mockRequest({
      credentials: {
        uid: crypto.randomBytes(16).toString('hex'),
        tokenId: crypto.randomBytes(16).toString('hex')
      },
      payload: {}
    })
    var unnamedDevice = { sessionToken: crypto.randomBytes(16).toString('hex') }
    var mockDB = mocks.mockDB({
      devices: [
        { name: 'current session', type: 'mobile', sessionToken: mockRequest.auth.credentials.tokenId },
        { name: 'has no type', sessionToken: crypto.randomBytes(16).toString('hex' )},
        { name: 'has device type', sessionToken: crypto.randomBytes(16).toString('hex'), uaDeviceType: 'wibble' },
        unnamedDevice
      ]
    })
    var mockDevices = mocks.mockDevices()
    var accountRoutes = makeRoutes({
      db: mockDB,
      devices: mockDevices
    })
    var route = getRoute(accountRoutes, '/account/devices')

    return runTest(route, mockRequest, function (response) {
      assert.ok(Array.isArray(response), 'response is array')
      assert.equal(response.length, 4, 'response contains 4 items')

      assert.equal(response[0].name, 'current session')
      assert.equal(response[0].type, 'mobile')
      assert.equal(response[0].sessionToken, undefined)
      assert.equal(response[0].isCurrentDevice, true)

      assert.equal(response[1].name, 'has no type')
      assert.equal(response[1].type, 'desktop')
      assert.equal(response[1].sessionToken, undefined)
      assert.equal(response[1].isCurrentDevice, false)

      assert.equal(response[2].name, 'has device type')
      assert.equal(response[2].type, 'wibble')
      assert.equal(response[2].isCurrentDevice, false)

      assert.equal(response[3].name, null)

      assert.equal(mockDB.devices.callCount, 1, 'db.devices was called once')
      assert.equal(mockDB.devices.args[0].length, 1, 'db.devices was passed one argument')
      assert.deepEqual(mockDB.devices.args[0][0], mockRequest.auth.credentials.uid, 'db.devices was passed uid')

      assert.equal(mockDevices.synthesizeName.callCount, 1, 'mockDevices.synthesizeName was called once')
      assert.equal(mockDevices.synthesizeName.args[0].length, 1, 'mockDevices.synthesizeName was passed one argument')
      assert.equal(mockDevices.synthesizeName.args[0][0], unnamedDevice, 'mockDevices.synthesizeName was passed unnamed device')
    })
  })

  it('should allow returning a lastAccessTime of 0', () => {
    const route = getRoute(makeRoutes({}), '/account/devices')
    const res = [
      {
        id: crypto.randomBytes(16).toString('hex'),
        isCurrentDevice: true,
        lastAccessTime: 0,
        name: 'test',
        type: 'test'
      }
    ]
    isA.assert(res, route.config.response.schema)
  })
})

describe('/account/sessions', () => {
  const now = Date.now()
  const times = [ now, now + 1, now + 2, now + 3, now + 4, now + 5, now + 6, now + 7, now + 8 ]
  const tokenIds = [ 'foo', 'bar', 'baz' ]
  const sessions = [
    {
      tokenId: tokenIds[0], uid: 'qux', createdAt: times[0], lastAccessTime: times[1],
      uaBrowser: 'Firefox', uaBrowserVersion: '50', uaOS: 'Windows', uaOSVersion: '10',
      uaDeviceType: null, deviceId: null, deviceCreatedAt: times[2],
      deviceCallbackURL: 'callback', deviceCallbackPublicKey: 'publicKey', deviceCallbackAuthKey: 'authKey'
    },
    {
      tokenId: tokenIds[1], uid: 'wibble', createdAt: times[3], lastAccessTime: times[4],
      uaBrowser: 'Nightly', uaBrowserVersion: null, uaOS: 'Android', uaOSVersion: '6',
      uaDeviceType: 'mobile', deviceId: 'deviceId', deviceCreatedAt: times[5],
      deviceCallbackURL: null, deviceCallbackPublicKey: null, deviceCallbackAuthKey: null
    },
    {
      tokenId: tokenIds[2], uid: 'blee', createdAt: times[6], lastAccessTime: times[7],
      uaBrowser: null, uaBrowserVersion: '50', uaOS: null, uaOSVersion: '10',
      uaDeviceType: 'tablet', deviceId: 'deviceId', deviceCreatedAt: times[8],
      deviceCallbackURL: 'callback', deviceCallbackPublicKey: 'publicKey', deviceCallbackAuthKey: 'authKey'
    }
  ]
  const db = mocks.mockDB({ sessions })
  const accountRoutes = makeRoutes({ db })
  const request = mocks.mockRequest({
    credentials: {
      tokenId: tokenIds[0],
      uid: hexString(16)
    },
    payload: {}
  })

  it('should list account sessions', () => {
    const route = getRoute(accountRoutes, '/account/sessions')

    return runTest(route, request, result => {
      assert.ok(Array.isArray(result))
      assert.equal(result.length, 3)
      assert.deepEqual(result, [
        {
          deviceId: null,
          deviceName: 'Firefox 50, Windows 10',
          deviceType: 'desktop',
          deviceCallbackURL: 'callback',
          deviceCallbackPublicKey: 'publicKey',
          deviceCallbackAuthKey: 'authKey',
          id: 'foo',
          isCurrentDevice: true,
          isDevice: false,
          lastAccessTime: times[1],
          lastAccessTimeFormatted: 'a few seconds ago',
          createdTime: times[0],
          createdTimeFormatted: 'a few seconds ago',
          os: 'Windows',
          userAgent: 'Firefox 50'
        },
        {
          deviceId: 'deviceId',
          deviceName: 'Nightly, Android 6',
          deviceType: 'mobile',
          deviceCallbackURL: null,
          deviceCallbackPublicKey: null,
          deviceCallbackAuthKey: null,
          id: 'bar',
          isCurrentDevice: false,
          isDevice: true,
          lastAccessTime: times[4],
          lastAccessTimeFormatted: 'a few seconds ago',
          createdTime: times[3],
          createdTimeFormatted: 'a few seconds ago',
          os: 'Android',
          userAgent: 'Nightly'
        },
        {
          deviceId: 'deviceId',
          deviceName: '',
          deviceType: 'tablet',
          deviceCallbackURL: 'callback',
          deviceCallbackPublicKey: 'publicKey',
          deviceCallbackAuthKey: 'authKey',
          id: 'baz',
          isCurrentDevice: false,
          isDevice: true,
          lastAccessTime: times[7],
          lastAccessTimeFormatted: 'a few seconds ago',
          createdTime: times[6],
          createdTimeFormatted: 'a few seconds ago',
          os: null,
          userAgent: ''
        },
      ])
    })
  })
})

