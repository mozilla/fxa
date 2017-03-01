/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var sinon = require('sinon')

const assert = require('insist')
var mocks = require('../../mocks')
var getRoute = require('../../routes_helpers').getRoute
var proxyquire = require('proxyquire')

var P = require('../../../lib/promise')
var uuid = require('uuid')
var crypto = require('crypto')
var isA = require('joi')
var error = require('../../../lib/error')

var makeRoutes = function (options, requireMocks) {
  options = options || {}

  var config = options.config || {}
  config.verifierVersion = config.verifierVersion || 0
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
  config.lastAccessTimeUpdates = {}
  config.signinConfirmation = config.signinConfirmation || {}
  config.signinUnblock = config.signinUnblock || {}

  var log = options.log || mocks.mockLog()
  var Password = options.Password || require('../../../lib/crypto/password')(log, config)
  var db = options.db || mocks.mockDB()
  var isPreVerified = require('../../../lib/preverifier')(error, config)
  var customs = options.customs || {
    check: function () { return P.resolve(true) }
  }
  var checkPassword = options.checkPassword || require('../../../lib/routes/utils/password_check')(log, config, Password, customs, db)
  var push = options.push || require('../../../lib/push')(log, db, {})
  return proxyquire('../../../lib/routes/account', requireMocks || {})(
    log,
    require('../../../lib/crypto/random'),
    P,
    uuid,
    isA,
    error,
    db,
    options.mailer || {},
    Password,
    config,
    customs,
    isPreVerified,
    checkPassword,
    push,
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

describe('/account/device', function () {
  var config = {}
  var uid = uuid.v4('binary')
  var deviceId = crypto.randomBytes(16)
  var mockRequest = mocks.mockRequest({
    credentials: {
      deviceCallbackPublicKey: '',
      deviceCallbackURL: '',
      deviceId: deviceId,
      deviceName: 'my awesome device',
      deviceType: 'desktop',
      tokenId: crypto.randomBytes(16),
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
      assert.equal(mockLog.increment.callCount, 1, 'a counter was incremented')
      assert.equal(mockLog.increment.firstCall.args[0], 'device.update.spurious')

      assert.deepEqual(response, mockRequest.payload)
    })
      .then(function () {
        mockLog.increment.reset()
      })
  })

  it('different data', function () {
    mockRequest.auth.credentials.deviceId = crypto.randomBytes(16)
    var payload = mockRequest.payload
    payload.name = 'my even awesomer device'
    payload.type = 'phone'
    payload.pushCallback = 'https://push.services.mozilla.com/123456'
    payload.pushPublicKey = 'SomeEncodedBinaryStuffThatDoesntGetValidedByThisTest'

    return runTest(route, mockRequest, function (response) {
      assert.equal(mockLog.increment.callCount, 5, 'the counters were incremented')
      assert.equal(mockLog.increment.getCall(0).args[0], 'device.update.sessionToken')
      assert.equal(mockLog.increment.getCall(1).args[0], 'device.update.name')
      assert.equal(mockLog.increment.getCall(2).args[0], 'device.update.type')
      assert.equal(mockLog.increment.getCall(3).args[0], 'device.update.pushCallback')
      assert.equal(mockLog.increment.getCall(4).args[0], 'device.update.pushPublicKey')

      assert.equal(mockDevices.upsert.callCount, 1, 'devices.upsert was called once')
      var args = mockDevices.upsert.args[0]
      assert.equal(args.length, 3, 'devices.upsert was passed three arguments')
      assert.equal(args[0], mockRequest, 'first argument was request object')
      assert.deepEqual(args[1].tokenId, mockRequest.auth.credentials.tokenId, 'second argument was session token')
      assert.deepEqual(args[1].uid, uid, 'sessionToken.uid was correct')
      assert.deepEqual(args[2], mockRequest.payload, 'third argument was payload')
    })
      .then(function () {
        mockLog.increment.reset()
        mockDevices.upsert.reset()
      })
  })

  it('with no id in payload', function () {
    mockRequest.payload.id = undefined

    return runTest(route, mockRequest, function (response) {
      assert.equal(mockLog.increment.callCount, 0, 'log.increment was not called')

      assert.equal(mockDevices.upsert.callCount, 1, 'devices.upsert was called once')
      var args = mockDevices.upsert.args[0]
      assert.equal(args[2].id, mockRequest.auth.credentials.deviceId.toString('hex'), 'payload.id defaulted to credentials.deviceId')
    })
      .then(function () {
        mockLog.increment.reset()
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
  var uid = uuid.v4('binary')
  var mockRequest = mocks.mockRequest({
    credentials: {
      uid: uid.toString('hex')
    }
  })
  var pushPayload = {
    isValid: true,
    version: 1,
    command: 'sync:collection_changed',
    data: {
      collections: ['clients']
    }
  }
  var mockPush = mocks.mockPush()
  var validate = sinon.spy(function (payload) { return payload.isValid })
  var mockAjv = function () {
    return {
      compile: function () {
        return validate
      }
    }
  }
  var sandbox = sinon.sandbox.create()
  var mockCustoms = mocks.mockCustoms()
  var accountRoutes = makeRoutes({
    config: config,
    customs: mockCustoms,
    push: mockPush
  }, {
    ajv: mockAjv
  })
  var route = getRoute(accountRoutes, '/account/devices/notify')

  it('bad payload', function () {
    mockRequest.payload = {
      to: ['bogusid1'],
      payload: {
        isValid: false
      }
    }
    return runTest(route, mockRequest, function () {
      assert(false, 'should have thrown')
    })
      .then(() => assert(false), function (err) {
        assert.equal(validate.callCount, 1, 'ajv validator function was called')
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
        assert.equal(args[0], uid.toString('hex'), 'first argument was the device uid')
        assert.equal(args[1], 'devicesNotify', 'second argument was the devicesNotify reason')
        assert.deepEqual(args[2], {
          data: Buffer.from(JSON.stringify(pushPayload)),
          excludedDeviceIds: ['bogusid'],
          TTL: 60
        }, 'third argument was the push options')
      })
    })
  })

  it('specific devices', function () {
    mockCustoms.checkAuthenticated.reset()
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
        assert.equal(args[0], uid.toString('hex'), 'first argument was the device uid')
        assert.deepEqual(args[1], ['bogusid1', 'bogusid2'], 'second argument was the list of device ids')
        assert.equal(args[2], 'devicesNotify', 'third argument was the devicesNotify reason')
        assert.deepEqual(args[3], {
          data: Buffer.from(JSON.stringify(pushPayload)),
          TTL: 60
        }, 'fourth argument was the push options')
      })
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
    config.deviceNotificationsEnabled = true

    mockCustoms = mocks.mockCustoms({
      checkAuthenticated: sandbox.spy(function () {
        throw error.tooManyRequests(1)
      })
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
    var uid = uuid.v4('binary')
    var deviceId = crypto.randomBytes(16).toString('hex')
    var mockLog = mocks.spyLog()
    var mockDB = mocks.mockDB()
    var mockRequest = mocks.mockRequest({
      credentials: {
        uid: uid.toString('hex'),
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
      assert.equal(details.uid, uid.toString('hex'))
      assert.equal(details.id, deviceId)
      assert.ok(Date.now() - details.timestamp < 100)
    })
  })
})

describe('/account/devices', function () {
  it('should return the devices list', () => {
    var mockRequest = mocks.mockRequest({
      credentials: {
        uid: crypto.randomBytes(16),
        tokenId: crypto.randomBytes(16)
      },
      payload: {}
    })
    var unnamedDevice = { sessionToken: crypto.randomBytes(16) }
    var mockDB = mocks.mockDB({
      devices: [
        { name: 'current session', type: 'mobile', sessionToken: mockRequest.auth.credentials.tokenId },
        { name: 'has no type', sessionToken: crypto.randomBytes(16) },
        { name: 'has device type', sessionToken: crypto.randomBytes(16), uaDeviceType: 'wibble' },
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
})
