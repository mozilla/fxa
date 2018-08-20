/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const sinon = require('sinon')
const assert = Object.assign({}, sinon.assert, require('insist'))
const crypto = require('crypto')
const error = require('../../../lib/error')
const getRoute = require('../../routes_helpers').getRoute
const isA = require('joi')
const mocks = require('../../mocks')
const moment = require('fxa-shared/node_modules/moment') // Ensure consistency with production code
const P = require('../../../lib/promise')
const proxyquire = require('proxyquire')
const uuid = require('uuid')

const EARLIEST_SANE_TIMESTAMP = 31536000000

function makeRoutes (options = {}, requireMocks) {

  const config = options.config || {}
  config.smtp = config.smtp ||  {}
  config.memcached = config.memcached || {
    address: '127.0.0.1:1121',
    idle: 500,
    lifetime: 30
  }
  config.i18n = {
    supportedLanguages: [ 'en', 'fr' ],
    defaultLanguage: 'en'
  }
  config.push = {
    allowedServerRegex: /^https:\/\/updates\.push\.services\.mozilla\.com(\/.*)?$/
  }
  config.lastAccessTimeUpdates = {
    earliestSaneTimestamp: EARLIEST_SANE_TIMESTAMP
  }
  config.publicUrl = 'https://public.url'

  const log = options.log || mocks.mockLog()
  const db = options.db || mocks.mockDB()
  const customs = options.customs || {
    check: function () { return P.resolve(true) }
  }
  const push = options.push || require('../../../lib/push')(log, db, {})
  const pushbox = options.pushbox || mocks.mockPushbox()
  return proxyquire('../../../lib/routes/devices-and-sessions', requireMocks || {})(
    log, db, config, customs, push, pushbox,
    options.devices || require('../../../lib/devices')(log, db, push)
  )
}

function runTest(route, request, onSuccess, onError) {
  return route.handler(request)
    .then(onSuccess, onError)
    .catch(onError)
}

function hexString (bytes) {
  return crypto.randomBytes(bytes).toString('hex')
}

describe('/account/device', function () {
  var config = {}
  var uid = uuid.v4('binary').toString('hex')
  var deviceId = crypto.randomBytes(16).toString('hex')
  var mockDeviceName = 'my awesome device 🍓🔥'
  var mockRequest = mocks.mockRequest({
    credentials: {
      deviceCallbackPublicKey: '',
      deviceCallbackURL: '',
      deviceCallbackIsExpired: false,
      deviceId: deviceId,
      deviceName: mockDeviceName,
      deviceType: 'desktop',
      id: crypto.randomBytes(16).toString('hex'),
      uid: uid
    },
    payload: {
      id: deviceId.toString('hex'),
      name: mockDeviceName
    }
  })
  var mockDevices = mocks.mockDevices()
  var mockLog = mocks.mockLog()
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
      assert.deepEqual(args[1].id, mockRequest.auth.credentials.id, 'second argument was session token')
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

  it('removes the push endpoint expired flag on callback URL update', function () {
    var mockDevices = mocks.mockDevices()
    var route = getRoute(makeRoutes({devices: mockDevices}), '/account/device')

    var mockRequest = mocks.mockRequest({
      credentials: {
        deviceCallbackPublicKey: '',
        deviceCallbackURL: 'https://updates.push.services.mozilla.com/update/50973923bc3e4507a0aa4e285513194a',
        deviceCallbackIsExpired: true,
        deviceId: deviceId,
        deviceName: mockDeviceName,
        deviceType: 'desktop',
        id: crypto.randomBytes(16).toString('hex'),
        uid: uid
      },
      payload: {
        id: deviceId.toString('hex'),
        pushCallback: 'https://updates.push.services.mozilla.com/update/d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c75'
      }
    })

    return runTest(route, mockRequest, function (response) {
      assert.equal(mockDevices.upsert.callCount, 1, 'mockDevices.upsert was called')
      assert.equal(mockDevices.upsert.args[0][2].pushEndpointExpired, false, 'pushEndpointExpired is updated to false')
    })
  })

  it('should not remove the push endpoint expired flag on any other property update', function () {
    var mockDevices = mocks.mockDevices()
    var route = getRoute(makeRoutes({devices: mockDevices}), '/account/device')

    var mockRequest = mocks.mockRequest({
      credentials: {
        deviceCallbackPublicKey: '',
        deviceCallbackURL: 'https://updates.push.services.mozilla.com/update/50973923bc3e4507a0aa4e285513194a',
        deviceCallbackIsExpired: true,
        deviceId: deviceId,
        deviceName: mockDeviceName,
        deviceType: 'desktop',
        id: crypto.randomBytes(16).toString('hex'),
        uid: uid
      },
      payload: {
        id: deviceId.toString('hex'),
        name: 'beep beep'
      }
    })

    return runTest(route, mockRequest, function (response) {
      assert.equal(mockDevices.upsert.callCount, 1, 'mockDevices.upsert was called')
      assert.equal(mockDevices.upsert.args[0][2].pushEndpointExpired, undefined, 'pushEndpointExpired is not updated')
    })
  })
})

describe('/account/devices/notify', function () {
  var config = {}
  var uid = uuid.v4('binary').toString('hex')
  var deviceId = crypto.randomBytes(16).toString('hex')
  var mockLog = mocks.mockLog()
  var mockRequest = mocks.mockRequest({
    log: mockLog,
    devices: [
      {
        id: 'bogusid1',
        type: 'mobile'
      },
      {
        id: 'bogusid2',
        type: 'desktop',
      }
    ],
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
        assert.equal(mockPush.sendPush.callCount, 0, 'mockPush.sendPush was not called')
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
    // We don't wait on sendPush in the request handler, that's why
    // we have to wait on it manually by spying.
    var sendPushPromise = P.defer()
    mockPush.sendPush = sinon.spy(function () {
      sendPushPromise.resolve()
      return P.resolve()
    })
    return runTest(route, mockRequest, function (response) {
      return sendPushPromise.promise.then(function () {
        assert.equal(mockCustoms.checkAuthenticated.callCount, 1, 'mockCustoms.checkAuthenticated was called once')
        assert.equal(mockPush.sendPush.callCount, 1, 'mockPush.sendPush was called once')
        var args = mockPush.sendPush.args[0]
        assert.equal(args.length, 4, 'mockPush.sendPush was passed four arguments')
        assert.equal(args[0], uid, 'first argument was the device uid')
        assert.ok(Array.isArray(args[1]), 'second argument was devices array')
        assert.equal(args[2], 'devicesNotify', 'second argument was the devicesNotify reason')
        assert.deepEqual(args[3], {
          data: pushPayload,
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
    // We don't wait on sendPush in the request handler, that's why
    // we have to wait on it manually by spying.
    var sendPushPromise = P.defer()
    mockPush.sendPush = sinon.spy(function () {
      sendPushPromise.resolve()
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
    // We don't wait on sendPush in the request handler, that's why
    // we have to wait on it manually by spying.
    var sendPushPromise = P.defer()
    mockPush.sendPush = sinon.spy(function () {
      sendPushPromise.resolve()
      return P.resolve()
    })
    return runTest(route, mockRequest, function (response) {
      return sendPushPromise.promise.then(function () {
        assert.equal(mockCustoms.checkAuthenticated.callCount, 1, 'mockCustoms.checkAuthenticated was called once')
        assert.equal(mockPush.sendPush.callCount, 1, 'mockPush.sendPush was called once')
        var args = mockPush.sendPush.args[0]
        assert.equal(args.length, 4, 'mockPush.sendPush was passed four arguments')
        assert.equal(args[0], uid, 'first argument was the device uid')
        assert.ok(Array.isArray(args[1]), 'second argument was devices array')
        assert.equal(args[2], 'devicesNotify', 'third argument was the devicesNotify reason')
        assert.deepEqual(args[3], {
          data: pushPayload,
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

  it('does not log activity event for non-send-tab-related notifications', function () {
    mockPush.sendPush.reset()
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
      assert.equal(mockPush.sendPush.callCount, 1, 'mockPush.sendPush was called once')
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

    const mockCustoms = mocks.mockCustoms({
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

    var mockLog = mocks.mockLog()
    var mockPush = mocks.mockPush({
      sendPush: () => P.reject('devices empty')
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

  it('can send account verification message with empty payload', () => {
    mockRequest.payload = {
      to: 'all',
      _endpointAction: 'accountVerify',
      payload: {}
    }
    const sendPushPromise = P.defer()
    mockPush.sendPush = sinon.spy(() => {
      sendPushPromise.resolve()
      return P.resolve()
    })
    const mockCustoms = {
      checkAuthenticated: () => P.resolve()
    }
    route = getRoute(makeRoutes({
      customs: mockCustoms,
      log: mockLog,
      push: mockPush
    }), '/account/devices/notify')

    return runTest(route, mockRequest, () => {
      return sendPushPromise.promise.then(() => {
        assert.equal(mockPush.sendPush.callCount, 1, 'mockPush.sendPush was called once')
        const args = mockPush.sendPush.args[0]
        assert.equal(args.length, 4, 'mockPush.sendPush was passed four arguments')
        assert.equal(args[0], uid, 'first argument was the device uid')
        assert.ok(Array.isArray(args[1]), 'second argument was devices array')
        assert.equal(args[2], 'accountVerify', 'second argument was the accountVerify reason')
        assert.deepEqual(args[3], {
          data: {}
        }, 'third argument was the push options')
      })
    })
  })

  it('reject account verification message with non-empty payload', () => {
    mockRequest.payload = {
      to: 'all',
      _endpointAction: 'accountVerify',
      payload: pushPayload
    }
    route = getRoute(makeRoutes({
      customs: mockCustoms,
      log: mockLog,
      push: mockPush
    }), '/account/devices/notify')

    return runTest(route, mockRequest).then(() => {
      assert.fail('should not have succeed')
    }, (err) => {
      assert.equal(err.errno, 107, 'invalid parameter in request body')
    })
  })
})

describe('/account/device/commands', function () {
  const uid = uuid.v4('binary').toString('hex')
  const deviceId = crypto.randomBytes(16).toString('hex')
  const mockLog = mocks.mockLog()
  const mockRequest = mocks.mockRequest({
    log: mockLog,
    credentials: {
      uid: uid,
      deviceId: deviceId
    }
  })
  const mockCustoms = mocks.mockCustoms()

  it('retrieves messages using the pushbox service', () => {
    const mockResponse = {
      last: true,
      index: 4,
      messages: [
        { index: 3, data: { number: 'three' } },
        { index: 4, data: { number: 'four'} }
      ]
    }
    const mockPushbox = mocks.mockPushbox()
    mockPushbox.retrieve = sinon.spy(() => P.resolve(mockResponse))

    mockRequest.query = {
      index: 2
    }
    const route = getRoute(makeRoutes({
      customs: mockCustoms,
      log: mockLog,
      pushbox: mockPushbox
    }), '/account/device/commands')

    mockRequest.query = isA.validate(mockRequest.query, route.options.validate.query).value
    assert.ok(mockRequest.query)
    return runTest(route, mockRequest).then(response => {
      assert.equal(mockPushbox.retrieve.callCount, 1, 'pushbox was called')
      assert.calledWithExactly(mockPushbox.retrieve, uid, deviceId, 100, 2)
      assert.deepEqual(response, mockResponse)
    })
  })

  it('accepts a custom limit parameter', () => {
    const mockPushbox = mocks.mockPushbox()
    mockRequest.query = {
      index: 2,
      limit: 12
    }
    const route = getRoute(makeRoutes({
      customs: mockCustoms,
      log: mockLog,
      pushbox: mockPushbox
    }), '/account/device/commands')

    return runTest(route, mockRequest).then(() => {
      assert.equal(mockPushbox.retrieve.callCount, 1, 'pushbox was called')
      assert.calledWithExactly(mockPushbox.retrieve, uid, deviceId, 12, 2)
    })
  })

  it('relays errors from the pushbox service', () => {
    const mockPushbox = mocks.mockPushbox({
      retrieve() {
        const error = new Error()
        error.message = 'Boom!'
        error.statusCode = 500
        return Promise.reject(error)
      }
    })
    mockRequest.query = {
      index: 2
    }
    const route = getRoute(makeRoutes({
      customs: mockCustoms,
      log: mockLog,
      pushbox: mockPushbox
    }), '/account/device/commands')

    return runTest(route, mockRequest).then(() => {
      assert.ok(false, 'should not go here')
    }, (err) => {
      assert.equal(err.message, 'Boom!')
      assert.equal(err.statusCode, 500)
    })
  })
})

describe('/account/devices/invoke_command', function () {
  const uid = uuid.v4('binary').toString('hex')
  const command = 'bogusCommandName'
  const mockDevices = [
    {
      id: 'bogusid1',
      type: 'mobile',
      availableCommands: {
        bogusCommandName: 'bogusData'
      }
    },
    {
      id: 'bogusid2',
      type: 'desktop',
    }
  ]
  let mockLog, mockDB, mockRequest, mockPush, mockCustoms

  beforeEach(() => {
    mockLog = mocks.mockLog()
    mockDB = mocks.mockDB({
      devices: mockDevices
    })
    mockRequest = mocks.mockRequest({
      log: mockLog,
      credentials: {
        uid: uid,
        deviceId: 'bogusid2'
      }
    })
    mockPush = mocks.mockPush()
    mockCustoms = mocks.mockCustoms()
  })

  it('stores commands using the pushbox service and sends a notification', () => {
    const mockPushbox = mocks.mockPushbox({
      store: sinon.spy(() => {
        return Promise.resolve({ index: 15 })
      })
    })
    const target = 'bogusid1'
    const sender = 'bogusid2'
    const payload = { 'bogus': 'payload' }
    mockRequest.payload = {
      target,
      command,
      payload
    }
    const route = getRoute(makeRoutes({
      customs: mockCustoms,
      log: mockLog,
      push: mockPush,
      pushbox: mockPushbox,
      db: mockDB
    }), '/account/devices/invoke_command')

    return runTest(route, mockRequest).then(() => {
      assert.equal(mockDB.device.callCount, 1, 'device record was fetched')
      assert.calledWithExactly(mockDB.device, uid, target)

      assert.equal(mockPushbox.store.callCount, 1, 'pushbox was called')
      assert.calledWithExactly(mockPushbox.store, uid, target, {
        command,
        payload,
        sender,
      }, undefined)

      assert.equal(mockPush.notifyCommandReceived.callCount, 1, 'notifyCommandReceived was called')
      assert.calledWithExactly(mockPush.notifyCommandReceived,
         uid,
         mockDevices[0],
         command,
         sender,
         15,
         'https://public.url/v1/account/device/commands?index=15&limit=1',
         undefined
      )
    })
  })

  it('rejects if sending to an unknown device', () => {
    const mockPushbox = mocks.mockPushbox()
    const target = 'unknowndevice'
    const payload = { 'bogus': 'payload' }
    mockRequest.payload = {
      target,
      command,
      payload
    }
    mockDB.device = sinon.spy(() => P.reject(error.unknownDevice()))
    const route = getRoute(makeRoutes({
      customs: mockCustoms,
      log: mockLog,
      push: mockPush,
      pushbox: mockPushbox,
      db: mockDB
    }), '/account/devices/invoke_command')

    return runTest(route, mockRequest, () => {
      assert(false, 'should have thrown')
    }, (err) => {
      assert.equal(err.errno, 123, 'Unknown device')
      assert.equal(mockPushbox.store.callCount, 0, 'pushbox was not called')
      assert.equal(mockPush.notifyCommandReceived.callCount, 0, 'notifyMessageReceived was not called')
    })
  })

  it('rejects if invoking an unavailable command', () => {
    const mockPushbox = mocks.mockPushbox()
    const target = 'bogusid1'
    const payload = { 'bogus': 'payload' }
    mockRequest.payload = {
      target,
      command: 'nonexistentCommandName',
      payload
    }
    const route = getRoute(makeRoutes({
      customs: mockCustoms,
      log: mockLog,
      push: mockPush,
      pushbox: mockPushbox,
      db: mockDB
    }), '/account/devices/invoke_command')

    return runTest(route, mockRequest, () => {
      assert(false, 'should have thrown')
    }, (err) => {
      assert.equal(err.errno, 157, 'unavailable device command')
      assert.equal(mockPushbox.store.callCount, 0, 'pushbox was not called')
      assert.equal(mockPush.notifyCommandReceived.callCount, 0,
        'notifyMessageReceived was not called')
    })
  })

  it('relays errors from the pushbox service', () => {
    const mockPushbox = mocks.mockPushbox({
      store: sinon.spy(() => {
        const error = new Error()
        error.message = 'Boom!'
        error.statusCode = 500
        return Promise.reject(error)
      })
    })
    const target = 'bogusid1'
    const payload = { 'bogus': 'payload' }
    mockRequest.payload = {
      target,
      command,
      payload
    }
    const route = getRoute(makeRoutes({
      customs: mockCustoms,
      log: mockLog,
      push: mockPush,
      pushbox: mockPushbox,
      db: mockDB
    }), '/account/devices/invoke_command')

    return runTest(route, mockRequest, () => {
      assert(false, 'should have thrown')
    }, (err) => {
      assert.equal(mockPushbox.store.callCount, 1, 'pushbox was called')
      assert.equal(err.message, 'Boom!')
      assert.equal(err.statusCode, 500)
      assert.equal(mockPush.notifyCommandReceived.callCount, 0,
        'notifyMessageReceived was not called')
    })
  })
})

describe('/account/device/destroy', function () {
  it('should work', () => {
    var uid = uuid.v4('binary').toString('hex')
    var deviceId = crypto.randomBytes(16).toString('hex')
    var deviceId2 = crypto.randomBytes(16).toString('hex')
    var mockLog = mocks.mockLog()
    var mockDB = mocks.mockDB()
    var mockRequest = mocks.mockRequest({
      credentials: {
        uid: uid
      },
      log: mockLog,
      devices: [deviceId, deviceId2],
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
      assert.ok(mockDB.deleteDevice.calledBefore(mockPush.notifyDeviceDisconnected))
      assert.equal(mockPush.notifyDeviceDisconnected.callCount, 1)
      assert.equal(mockPush.notifyDeviceDisconnected.firstCall.args[0], mockRequest.auth.credentials.uid)
      assert.deepEqual(mockPush.notifyDeviceDisconnected.firstCall.args[1], [deviceId, deviceId2])
      assert.equal(mockPush.notifyDeviceDisconnected.firstCall.args[2], deviceId)

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

describe('/account/devices', () => {
  it('should return the devices list (translated)', () => {
    const credentials = {
      uid: crypto.randomBytes(16).toString('hex'),
      id: crypto.randomBytes(16).toString('hex')
    }
    const unnamedDevice = {
      sessionToken: crypto.randomBytes(16).toString('hex'),
      lastAccessTime: EARLIEST_SANE_TIMESTAMP
    }
    const mockRequest = mocks.mockRequest({
      acceptLanguage: 'en;q=0.5, fr;q=0.51',
      credentials,
      devices: [
        {
          name: 'current session',
          type: 'mobile',
          sessionToken: credentials.id,
          lastAccessTime: Date.now()
        },
        {
          name: 'has no type',
          sessionToken: crypto.randomBytes(16).toString('hex' ),
          lastAccessTime: 1
        },
        {
          name: 'has device type',
          sessionToken: crypto.randomBytes(16).toString('hex'),
          uaDeviceType: 'wibble',
          lastAccessTime: EARLIEST_SANE_TIMESTAMP - 1,
          location: {
            city: 'Bournemouth',
            state: 'England',
            stateCode: 'EN',
            country: 'United Kingdom',
            countryCode: 'GB'
          }
        },
        unnamedDevice
      ],
      payload: {}
    })
    const mockDB = mocks.mockDB()
    const mockDevices = mocks.mockDevices()
    const log = mocks.mockLog()
    const accountRoutes = makeRoutes({
      db: mockDB,
      devices: mockDevices,
      log
    })
    const route = getRoute(accountRoutes, '/account/devices')

    return runTest(route, mockRequest, response => {
      const now = Date.now()

      assert.ok(Array.isArray(response), 'response is array')
      assert.equal(response.length, 4, 'response contains 4 items')

      assert.equal(response[0].name, 'current session')
      assert.equal(response[0].type, 'mobile')
      assert.equal(response[0].sessionToken, undefined)
      assert.equal(response[0].isCurrentDevice, true)
      assert.ok(response[0].lastAccessTime > now - 10000 && response[0].lastAccessTime <= now)
      assert.equal(response[0].lastAccessTimeFormatted, 'il y a quelques secondes')
      assert.equal(response[0].approximateLastAccessTime, undefined)
      assert.equal(response[0].approximateLastAccessTimeFormatted, undefined)
      assert.deepEqual(response[0].location, {})

      assert.equal(response[1].name, 'has no type')
      assert.equal(response[1].type, 'desktop')
      assert.equal(response[1].sessionToken, undefined)
      assert.equal(response[1].isCurrentDevice, false)
      assert.equal(response[1].lastAccessTime, 1)
      assert.equal(response[1].lastAccessTimeFormatted, moment(1).locale('fr').fromNow())
      assert.equal(response[1].approximateLastAccessTime, EARLIEST_SANE_TIMESTAMP)
      assert.equal(response[1].approximateLastAccessTimeFormatted, moment(EARLIEST_SANE_TIMESTAMP).locale('fr').fromNow())
      assert.deepEqual(response[1].location, {})

      assert.equal(response[2].name, 'has device type')
      assert.equal(response[2].type, 'wibble')
      assert.equal(response[2].isCurrentDevice, false)
      assert.equal(response[2].lastAccessTime, EARLIEST_SANE_TIMESTAMP - 1)
      assert.equal(response[2].lastAccessTimeFormatted, moment(EARLIEST_SANE_TIMESTAMP - 1).locale('fr').fromNow())
      assert.equal(response[2].approximateLastAccessTime, EARLIEST_SANE_TIMESTAMP)
      assert.equal(response[2].approximateLastAccessTimeFormatted, moment(EARLIEST_SANE_TIMESTAMP).locale('fr').fromNow())
      assert.deepEqual(response[2].location, {
        country: 'Royaume-Uni'
      })

      assert.equal(response[3].name, null)
      assert.equal(response[3].lastAccessTime, EARLIEST_SANE_TIMESTAMP)
      assert.equal(response[3].lastAccessTimeFormatted, moment(EARLIEST_SANE_TIMESTAMP).locale('fr').fromNow())
      assert.equal(response[3].approximateLastAccessTime, undefined)
      assert.equal(response[3].approximateLastAccessTimeFormatted, undefined)

      assert.equal(log.error.callCount, 0, 'log.error was not called')

      assert.equal(mockDB.devices.callCount, 0, 'db.devices was not called')

      assert.equal(mockDevices.synthesizeName.callCount, 1, 'mockDevices.synthesizeName was called once')
      assert.equal(mockDevices.synthesizeName.args[0].length, 1, 'mockDevices.synthesizeName was passed one argument')
      assert.equal(mockDevices.synthesizeName.args[0][0], unnamedDevice, 'mockDevices.synthesizeName was passed unnamed device')
    })
  })

  it('should return the devices list (not translated)', () => {
    const credentials = {
      uid: crypto.randomBytes(16).toString('hex'),
      id: crypto.randomBytes(16).toString('hex')
    }
    const request = mocks.mockRequest({
      acceptLanguage: 'en-US,en;q=0.5',
      credentials,
      devices: [
        {
          name: 'wibble',
          sessionToken: credentials.id,
          lastAccessTime: Date.now(),
          location: {
            city: 'Bournemouth',
            state: 'England',
            stateCode: 'EN',
            country: 'United Kingdom',
            countryCode: 'GB'
          }
        }
      ],
      payload: {}
    })
    const db = mocks.mockDB()
    const devices = mocks.mockDevices()
    const log = mocks.mockLog()
    const accountRoutes = makeRoutes({ db, devices, log })
    const route = getRoute(accountRoutes, '/account/devices')

    return runTest(route, request, response => {
      assert.equal(response.length, 1)
      assert.equal(response[0].name, 'wibble')
      assert.deepEqual(response[0].location, {
        city: 'Bournemouth',
        country: 'United Kingdom',
        state: 'England',
        stateCode: 'EN'
      })
      assert.equal(log.error.callCount, 0, 'log.error was not called')
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
        type: 'test',
        pushEndpointExpired: false
      }
    ]
    isA.assert(res, route.options.response.schema)
  })

  it('should allow returning approximateLastAccessTime', () => {
    const route = getRoute(makeRoutes({}), '/account/devices')
    isA.assert([{
      id: crypto.randomBytes(16).toString('hex'),
      isCurrentDevice: true,
      lastAccessTime: 0,
      approximateLastAccessTime: EARLIEST_SANE_TIMESTAMP,
      approximateLastAccessTimeFormatted: '',
      name: 'test',
      type: 'test',
      pushEndpointExpired: false
    }], route.options.response.schema)
  })

  it('should not allow returning approximateLastAccessTime < EARLIEST_SANE_TIMESTAMP', () => {
    const route = getRoute(makeRoutes({}), '/account/devices')
    assert.throws(() => isA.assert([{
      id: crypto.randomBytes(16).toString('hex'),
      isCurrentDevice: true,
      lastAccessTime: 0,
      approximateLastAccessTime: EARLIEST_SANE_TIMESTAMP - 1,
      approximateLastAccessTimeFormatted: '',
      name: 'test',
      type: 'test',
      pushEndpointExpired: false
    }], route.config.response.schema))
  })
})

describe('/account/sessions', () => {
  const now = Date.now()
  const times = [ now, now + 1, now + 2, now + 3, now + 4, now + 5, now + 6, now + 7, now + 8 ]
  const tokenIds = [ 'foo', 'bar', 'baz', 'qux' ]
  const sessions = [
    {
      id: tokenIds[0], uid: 'qux', createdAt: times[0], lastAccessTime: times[1],
      uaBrowser: 'Firefox', uaBrowserVersion: '50.0', uaOS: 'Windows', uaOSVersion: '10',
      uaDeviceType: null, deviceId: null, deviceCreatedAt: times[2], deviceAvailableCommands: { 'foo': 'bar' },
      deviceCallbackURL: 'callback', deviceCallbackPublicKey: 'publicKey', deviceCallbackAuthKey: 'authKey',
      deviceCallbackIsExpired: false,
      location: {
        city: 'Toronto',
        country: 'Canada',
        countryCode: 'CA',
        state: 'Ontario',
        stateCode: 'ON'
      }
    },
    {
      id: tokenIds[1], uid: 'wibble', createdAt: times[3], lastAccessTime: EARLIEST_SANE_TIMESTAMP - 1,
      uaBrowser: 'Nightly', uaBrowserVersion: null, uaOS: 'Android', uaOSVersion: '6',
      uaDeviceType: 'mobile', deviceId: 'deviceId', deviceCreatedAt: times[4], deviceAvailableCommands: { 'foo': 'bar' },
      deviceCallbackURL: null, deviceCallbackPublicKey: null, deviceCallbackAuthKey: null,
      deviceCallbackIsExpired: false,
      location: {
        city: 'Bournemouth',
        country: 'United Kingdom',
        countryCode: 'GB',
        state: 'England',
        stateCode: 'EN'
      }
    },
    {
      id: tokenIds[2], uid: 'blee', createdAt: times[5], lastAccessTime: EARLIEST_SANE_TIMESTAMP,
      uaBrowser: null, uaBrowserVersion: '50', uaOS: null, uaOSVersion: '10',
      uaDeviceType: 'tablet', deviceId: 'deviceId', deviceCreatedAt: times[6], deviceAvailableCommands: {},
      deviceCallbackURL: 'callback', deviceCallbackPublicKey: 'publicKey', deviceCallbackAuthKey: 'authKey',
      deviceCallbackIsExpired: false,
      location: null
    },
    {
      id: tokenIds[3], uid: 'blee', createdAt: times[7], lastAccessTime: 1,
      uaBrowser: null, uaBrowserVersion: '50', uaOS: null, uaOSVersion: '10',
      uaDeviceType: 'tablet', deviceId: 'deviceId', deviceCreatedAt: times[8],
      deviceCallbackURL: 'callback', deviceCallbackPublicKey: 'publicKey', deviceCallbackAuthKey: 'authKey',
      deviceCallbackIsExpired: false,
      location: null
    }
  ]
  const db = mocks.mockDB({ sessions })
  const accountRoutes = makeRoutes({ db })
  const request = mocks.mockRequest({
    acceptLanguage: 'xx',
    credentials: {
      id: tokenIds[0],
      uid: hexString(16)
    },
    payload: {}
  })

  it('should list account sessions', () => {
    const route = getRoute(accountRoutes, '/account/sessions')

    return runTest(route, request, result => {
      assert.ok(Array.isArray(result))
      assert.equal(result.length, 4)
      assert.deepEqual(result, [
        {
          deviceId: null,
          deviceName: 'Firefox 50, Windows 10',
          deviceType: 'desktop',
          deviceAvailableCommands: { 'foo': 'bar' },
          deviceCallbackURL: 'callback',
          deviceCallbackPublicKey: 'publicKey',
          deviceCallbackAuthKey: 'authKey',
          deviceCallbackIsExpired: false,
          id: 'foo',
          isCurrentDevice: true,
          isDevice: false,
          lastAccessTime: times[1],
          lastAccessTimeFormatted: moment(times[1]).locale('en').fromNow(),
          createdTime: times[0],
          createdTimeFormatted: 'a few seconds ago',
          os: 'Windows',
          userAgent: 'Firefox 50',
          location: {
            city: 'Toronto',
            country: 'Canada',
            state: 'Ontario',
            stateCode: 'ON'
          }
        },
        {
          deviceId: 'deviceId',
          deviceName: 'Nightly, Android 6',
          deviceType: 'mobile',
          deviceAvailableCommands: { 'foo': 'bar' },
          deviceCallbackURL: null,
          deviceCallbackPublicKey: null,
          deviceCallbackAuthKey: null,
          deviceCallbackIsExpired: false,
          id: 'bar',
          isCurrentDevice: false,
          isDevice: true,
          lastAccessTime: EARLIEST_SANE_TIMESTAMP - 1,
          lastAccessTimeFormatted: moment(EARLIEST_SANE_TIMESTAMP - 1).locale('en').fromNow(),
          approximateLastAccessTime: EARLIEST_SANE_TIMESTAMP,
          approximateLastAccessTimeFormatted: moment(EARLIEST_SANE_TIMESTAMP).locale('en').fromNow(),
          createdTime: times[3],
          createdTimeFormatted: 'a few seconds ago',
          os: 'Android',
          userAgent: 'Nightly',
          location: {
            city: 'Bournemouth',
            country: 'United Kingdom',
            state: 'England',
            stateCode: 'EN'
          }
        },
        {
          deviceId: 'deviceId',
          deviceName: '',
          deviceType: 'tablet',
          deviceAvailableCommands: {},
          deviceCallbackURL: 'callback',
          deviceCallbackPublicKey: 'publicKey',
          deviceCallbackAuthKey: 'authKey',
          deviceCallbackIsExpired: false,
          id: 'baz',
          isCurrentDevice: false,
          isDevice: true,
          lastAccessTime: EARLIEST_SANE_TIMESTAMP,
          lastAccessTimeFormatted: moment(EARLIEST_SANE_TIMESTAMP).locale('en').fromNow(),
          createdTime: times[5],
          createdTimeFormatted: 'a few seconds ago',
          os: null,
          userAgent: '',
          location: {}
        },
        {
          deviceId: 'deviceId',
          deviceName: '',
          deviceType: 'tablet',
          deviceAvailableCommands: null,
          deviceCallbackURL: 'callback',
          deviceCallbackPublicKey: 'publicKey',
          deviceCallbackAuthKey: 'authKey',
          deviceCallbackIsExpired: false,
          id: 'qux',
          isCurrentDevice: false,
          isDevice: true,
          lastAccessTime: 1,
          lastAccessTimeFormatted: moment(1).locale('en').fromNow(),
          approximateLastAccessTime: EARLIEST_SANE_TIMESTAMP,
          approximateLastAccessTimeFormatted: moment(EARLIEST_SANE_TIMESTAMP).locale('en').fromNow(),
          createdTime: times[7],
          createdTimeFormatted: 'a few seconds ago',
          os: null,
          userAgent: '',
          location: {}
        }
      ])
    })
  })
})
