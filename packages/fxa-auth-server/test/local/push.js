/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const ROOT_DIR = '../..'

const assert = require('insist')
var proxyquire = require('proxyquire')
var sinon = require('sinon')
var ajv = require('ajv')()
var fs = require('fs')
var path = require('path')

const P = require(`${ROOT_DIR}/lib/promise`)
const mocks = require('../mocks')
const mockLog = mocks.mockLog
var mockUid = Buffer.from('foo')
var mockConfig = {}

const PUSH_PAYLOADS_SCHEMA_PATH = `${ROOT_DIR}/docs/pushpayloads.schema.json`
var TTL = '42'
const pushModulePath = `${ROOT_DIR}/lib/push`

var mockDbEmpty = {
  devices: function () {
    return P.resolve([])
  }
}

var mockDevices = [
  {
    'id': '0f7aa00356e5416e82b3bef7bc409eef',
    'isCurrentDevice': true,
    'lastAccessTime': 1449235471335,
    'name': 'My Phone',
    'type': 'mobile',
    'pushCallback': 'https://updates.push.services.mozilla.com/update/abcdef01234567890abcdefabcdef01234567890abcdef',
    'pushPublicKey': mocks.MOCK_PUSH_KEY,
    'pushAuthKey': 'w3b14Zjc-Afj2SDOLOyong=='
  },
  {
    'id': '3a45e6d0dae543qqdKyqjuvAiEupsnOd',
    'isCurrentDevice': false,
    'lastAccessTime': 1417699471335,
    'name': 'My Desktop',
    'type': null,
    'pushCallback': 'https://updates.push.services.mozilla.com/update/d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c75',
    'pushPublicKey': mocks.MOCK_PUSH_KEY,
    'pushAuthKey': 'w3b14Zjc-Afj2SDOLOyong=='
  }
]

var mockDbResult = {
  devices: function (/* uid */) {
    return P.resolve(mockDevices)
  }
}

describe('push', () => {
  it(
    'pushToDevices throws on device not found',
    () => {
      var push = require(pushModulePath)(mockLog(), mockDbEmpty, mockConfig)
      sinon.spy(push, 'sendPush')

      return push.pushToDevices([mockUid], 'bogusid').then(function () {
        assert(false, 'must throw')
      }, function(err) {
        assert(! push.sendPush.called)
      })
    }
  )

  it(
    'pushToAllDevices does not throw on empty device result',
    () => {
      var thisMockLog = mockLog({
        info: function (log) {
          if (log.name === 'push.account_verify.success') {
            assert.fail('must not call push.success')
          }
        }
      })

      var push = require(pushModulePath)(thisMockLog, mockDbEmpty, mockConfig)
      return push.pushToAllDevices(mockUid, 'accountVerify')
    }
  )

  it(
    'pushToAllDevices does not send notification to an excluded device',
    () => {
      var mocks = {
        'web-push': {
          sendNotification: function (sub, payload, options) {
            return P.resolve()
          }
        }
      }

      var push = proxyquire(pushModulePath, mocks)(mockLog(), mockDbResult, mockConfig)
      var options = { excludedDeviceIds: [mockDevices[0].id] }
      return push.pushToAllDevices(mockUid, 'accountVerify', options)
    }
  )

  it(
    'pushToAllDevices calls sendPush',
    () => {
      var push = require(pushModulePath)(mockLog(), mockDbResult, mockConfig)
      sinon.stub(push, 'sendPush')
      var excluded = [mockDevices[0].id]
      var data = Buffer.from('foobar')
      var options = { data: data, excludedDeviceIds: excluded, TTL: TTL }
      return push.pushToAllDevices(mockUid, 'deviceConnected', options)
      .then(function() {
        assert.ok(push.sendPush.calledOnce, 'push was called')
        assert.equal(push.sendPush.getCall(0).args[0], mockUid)
        assert.deepEqual(push.sendPush.getCall(0).args[1], [mockDevices[1]])
        assert.equal(push.sendPush.getCall(0).args[2], 'deviceConnected')
        assert.deepEqual(push.sendPush.getCall(0).args[3], { data: data, TTL: TTL })
        push.sendPush.restore()
      })
    }
  )

  it(
    'pushToDevices calls sendPush',
    () => {
      var push = require(pushModulePath)(mockLog(), mockDbResult, mockConfig)
      sinon.stub(push, 'sendPush')
      var data = Buffer.from('foobar')
      var options = { data: data, TTL: TTL }
      return push.pushToDevices(mockUid, [mockDevices[0].id], 'deviceConnected', options)
      .then(function() {
        assert.ok(push.sendPush.calledOnce, 'push was called')
        assert.equal(push.sendPush.getCall(0).args[0], mockUid)
        assert.deepEqual(push.sendPush.getCall(0).args[1], [mockDevices[0]])
        assert.equal(push.sendPush.getCall(0).args[2], 'deviceConnected')
        assert.deepEqual(push.sendPush.getCall(0).args[3], { data: data, TTL: TTL })
        push.sendPush.restore()
      })
    }
  )

  it(
    'pushToDevice calls pushToDevices',
    () => {
      var push = require(pushModulePath)(mockLog(), mockDbResult, mockConfig)
      sinon.stub(push, 'pushToDevices')
      var data = Buffer.from('foobar')
      var options = { data: data, TTL: TTL }
      push.pushToDevice(mockUid, mockDevices[0].id, 'deviceConnected', options)

      assert.ok(push.pushToDevices.calledOnce, 'pushToDevices was called')
      assert.equal(push.pushToDevices.getCall(0).args[0], mockUid)
      assert.deepEqual(push.pushToDevices.getCall(0).args[1], [mockDevices[0].id])
      assert.equal(push.pushToDevices.getCall(0).args[2], 'deviceConnected')
      assert.deepEqual(push.pushToDevices.getCall(0).args[3], { data: data, TTL: TTL })
      push.pushToDevices.restore()
    }
  )

  it(
    'sendPush sends notifications with a TTL of 0',
    () => {
      var successCalled = 0
      var thisMockLog = mockLog({
        info: function (log) {
          if (log.name === 'push.account_verify.success') {
            // notification sent
            successCalled++
          }
        }
      })

      var mocks = {
        'web-push': {
          sendNotification: function (sub, payload, options) {
            assert.equal(options.TTL, '0', 'sends the proper ttl header')
            return P.resolve()
          }
        }
      }

      var push = proxyquire(pushModulePath, mocks)(thisMockLog, mockDbResult, mockConfig)
      return push.sendPush(mockUid, mockDevices, 'accountVerify')
        .then(() => {
          assert.equal(successCalled, 2)
        })
    }
  )

  it(
    'sendPush sends notifications with user-defined TTL',
    () => {
      var successCalled = 0
      var thisMockLog = mockLog({
        info: function (log) {
          if (log.name === 'push.account_verify.success') {
            // notification sent
            successCalled++
          }
        }
      })

      var mocks = {
        'web-push': {
          sendNotification: function (sub, payload, options) {
            assert.equal(options.TTL, TTL, 'sends the proper ttl header')
            return P.resolve()
          }
        }
      }

      var push = proxyquire(pushModulePath, mocks)(thisMockLog, mockDbResult, mockConfig)
      var options = { TTL: TTL }
      return push.sendPush(mockUid, mockDevices, 'accountVerify', options)
        .then(() => {
          assert.equal(successCalled, 2)
        })
    }
  )

  it(
    'sendPush sends data',
    () => {
      var count = 0
      var data = Buffer.from('foobar')
      var mocks = {
        'web-push': {
          sendNotification: function (sub, payload, options) {
            count++
            assert.ok(sub.keys.p256dh)
            assert.ok(sub.keys.auth)
            assert.deepEqual(payload, data)
            return P.resolve()
          }
        }
      }

      var push = proxyquire(pushModulePath, mocks)(mockLog(), mockDbResult, mockConfig)
      var options = { data: data }
      return push.sendPush(mockUid, mockDevices, 'accountVerify', options)
        .then(() => {
          assert.equal(count, 2)
        })
    }
  )

  it(
    'push fails if data is present but both keys are not present',
    () => {
      let count = 0
      var thisMockLog = mockLog({
        info: function (log) {
          if (log.name === 'push.account_verify.data_but_no_keys') {
            // data detected but device had no keys
            count++
          }
        }
      })

      var devices = [{
        'id': 'foo',
        'name': 'My Phone',
        'pushCallback': 'https://updates.push.services.mozilla.com/update/abcdef01234567890abcdefabcdef01234567890abcdef',
        'pushAuthKey': 'bogus'
      }]

      var push = require(pushModulePath)(thisMockLog, mockDbResult, mockConfig)
      var options = { data: Buffer.from('foobar') }
      return push.sendPush(mockUid, devices, 'accountVerify', options)
        .then(() => {
          assert.equal(count, 1)
        })
    }
  )

  it(
    'push catches devices with no push callback',
    () => {
      let count = 0
      var thisMockLog = mockLog({
        info: function (log) {
          if (log.name === 'push.account_verify.no_push_callback') {
            // device had no push callback
            count++
          }
        }
      })

      var devices = [{
        'id': 'foo',
        'name': 'My Phone'
      }]

      var push = require(pushModulePath)(thisMockLog, mockDbResult, mockConfig)
      return push.sendPush(mockUid, devices, 'accountVerify')
        .then(() => {
          assert.equal(count, 1)
        })
    }
  )

  it(
    'push reports errors when web-push fails',
    () => {
      let count = 0
      var thisMockLog = mockLog({
        info: function (log) {
          if (log.name === 'push.account_verify.failed') {
            // web-push failed
            count++
          }
        }
      })

      var mocks = {
        'web-push': {
          sendNotification: function (sub, payload, options) {
            return P.reject(new Error('Failed'))
          }
        }
      }

      var push = proxyquire(pushModulePath, mocks)(thisMockLog, mockDbResult, mockConfig)
      return push.sendPush(mockUid, [mockDevices[0]], 'accountVerify')
        .then(() => {
          assert.equal(count, 1)
        })
    }
  )

  it(
    'push logs an error when asked to send to more than 200 devices',
    () => {
      var thisMockLog = mockLog({
        error: sinon.spy()
      })

      var devices = []
      for (var i = 0; i < 200; i++) {
        devices.push(mockDevices[0])
      }

      var mocks = {
        'web-push': {
          sendNotification: function (sub, payload, options) {
            assert.equal(options.TTL, '0', 'sends the proper ttl header')
            return P.resolve()
          }
        }
      }
      var push = proxyquire(pushModulePath, mocks)(thisMockLog, mockDbResult, mockConfig)

      return push.sendPush(mockUid, devices, 'accountVerify').then(function () {
        assert.equal(thisMockLog.error.callCount, 0, 'log.error was not called')
        devices.push(mockDevices[0])
        return push.sendPush(mockUid, devices, 'accountVerify')
      }).then(function () {
        assert.equal(thisMockLog.error.callCount, 1, 'log.error was called')
        var arg = thisMockLog.error.getCall(0).args[0]
        assert.equal(arg.op, 'push.pushToDevices')
        assert.equal(arg.err.message, 'Too many devices connected to account')
      })
    }
  )

  it(
    'push resets device push data when push server responds with a 400 level error',
    () => {
      var mockDb = {
        updateDevice: sinon.spy(function () {
          return P.resolve()
        })
      }

      let count = 0
      var thisMockLog = mockLog({
        info: function (log) {
          if (log.name === 'push.account_verify.reset_settings') {
            // web-push failed
            assert.equal(mockDb.updateDevice.callCount, 1, 'db.updateDevice was called once')
            var args = mockDb.updateDevice.args[0]
            assert.equal(args.length, 3, 'db.updateDevice was passed three arguments')
            assert.equal(args[1], null, 'sessionTokenId argument was null')
            count++
          }
        }
      })

      var mocks = {
        'web-push': {
          sendNotification: function (sub, payload, options) {
            var err = new Error('Failed')
            err.statusCode = 410
            return P.reject(err)
          }
        }
      }

      var push = proxyquire(pushModulePath, mocks)(thisMockLog, mockDb, mockConfig)
      // Careful, the argument gets modified in-place.
      var device = JSON.parse(JSON.stringify(mockDevices[0]))
      return push.sendPush(mockUid, [device], 'accountVerify')
        .then(() => {
          assert.equal(count, 1)
        })
    }
  )

  it(
    'push resets device push data when a failure is caused by bad encryption keys',
    () => {
      var mockDb = {
        updateDevice: sinon.spy(function () {
          return P.resolve()
        })
      }

      let count = 0
      var thisMockLog = mockLog({
        info: function (log) {
          if (log.name === 'push.account_verify.reset_settings') {
            // web-push failed
            assert.equal(mockDb.updateDevice.callCount, 1, 'db.updateDevice was called once')
            var args = mockDb.updateDevice.args[0]
            assert.equal(args.length, 3, 'db.updateDevice was passed three arguments')
            assert.equal(args[1], null, 'sessionTokenId argument was null')
            count++
          }
        }
      })

      var mocks = {
        'web-push': {
          sendNotification: function (sub, payload, options) {
            var err = new Error('Failed')
            return P.reject(err)
          }
        }
      }

      var push = proxyquire(pushModulePath, mocks)(thisMockLog, mockDb, mockConfig)
      // Careful, the argument gets modified in-place.
      var device = JSON.parse(JSON.stringify(mockDevices[0]))
      device.pushPublicKey = 'E' + device.pushPublicKey.substring(1) // make the key invalid
      return push.sendPush(mockUid, [device], 'accountVerify')
        .then(() => {
          assert.equal(count, 1)
        })
    }
  )

  it(
    'push does not reset device push data after an unexpected failure',
    () => {
      var mockDb = {
        updateDevice: sinon.spy(function () {
          return P.resolve()
        })
      }

      let count = 0
      var thisMockLog = mockLog({
        info: function (log) {
          if (log.name === 'push.account_verify.failed') {
            // web-push failed
            assert.equal(mockDb.updateDevice.callCount, 0, 'db.updateDevice was not called')
            count++
          }
        }
      })

      var mocks = {
        'web-push': {
          sendNotification: function (sub, payload, options) {
            var err = new Error('Failed')
            return P.reject(err)
          }
        }
      }

      var push = proxyquire(pushModulePath, mocks)(thisMockLog, mockDb, mockConfig)
      return push.sendPush(mockUid, [mockDevices[0]], 'accountVerify')
        .then(() => {
          assert.equal(count, 1)
        })
    }
  )

  it(
    'notifyUpdate calls pushToAllDevices',
    () => {
      var push = require(pushModulePath)(mockLog(), mockDbEmpty, mockConfig)
      sinon.spy(push, 'pushToAllDevices')
      return push.notifyUpdate(mockUid, 'passwordReset')
      .then(function() {
        assert.ok(push.pushToAllDevices.calledOnce, 'pushToAllDevices was called')
        assert.equal(push.pushToAllDevices.getCall(0).args[0], mockUid)
        assert.equal(push.pushToAllDevices.getCall(0).args[1], 'passwordReset')
        push.pushToAllDevices.restore()
      })
    }
  )

  it(
    'notifyUpdate without a 2nd arg calls pushToAllDevices with a accountVerify reason',
    () => {
      var push = require(pushModulePath)(mockLog(), mockDbEmpty, mockConfig)
      sinon.spy(push, 'pushToAllDevices')
      return push.notifyUpdate(mockUid)
      .then(function() {
        assert.ok(push.pushToAllDevices.calledOnce, 'pushToAllDevices was called')
        assert.equal(push.pushToAllDevices.getCall(0).args[0], mockUid)
        assert.equal(push.pushToAllDevices.getCall(0).args[1], 'accountVerify')
        push.pushToAllDevices.restore()
      })
    }
  )

  it(
    'notifyDeviceConnected calls pushToAllDevices',
    () => {
      var push = require(pushModulePath)(mockLog(), mockDbEmpty, mockConfig)
      sinon.spy(push, 'pushToAllDevices')
      var deviceId = 'gjfkd5434jk5h5fd'
      var deviceName = 'My phone'
      var expectedData = {
        version: 1,
        command: 'fxaccounts:device_connected',
        data: {
          deviceName: deviceName
        }
      }
      return push.notifyDeviceConnected(mockUid, deviceName, deviceId).catch(function (err) {
        assert.fail('must not throw')
        throw err
      })
      .then(function() {
        assert.ok(push.pushToAllDevices.calledOnce, 'pushToAllDevices was called')
        assert.equal(push.pushToAllDevices.getCall(0).args[0], mockUid)
        assert.equal(push.pushToAllDevices.getCall(0).args[1], 'deviceConnected')
        var options = push.pushToAllDevices.getCall(0).args[2]
        var payload = JSON.parse(options.data.toString('utf8'))
        assert.deepEqual(payload, expectedData)
        var schemaPath = path.resolve(__dirname, PUSH_PAYLOADS_SCHEMA_PATH)
        var schema = JSON.parse(fs.readFileSync(schemaPath))
        assert.ok(ajv.validate(schema, payload))
        assert.deepEqual(options.excludedDeviceIds, [deviceId])
        push.pushToAllDevices.restore()
      })
    }
  )

  it(
    'notifyDeviceDisconnected calls pushToDevice',
    () => {
      var mocks = {
        'web-push': {
          sendNotification: function (sub, payload, options) {
            return P.resolve()
          }
        }
      }
      var push = proxyquire(pushModulePath, mocks)(mockLog(), mockDbResult, mockConfig)
      sinon.spy(push, 'pushToDevice')
      var idToDisconnect = mockDevices[0].id
      var expectedData = {
        version: 1,
        command: 'fxaccounts:device_disconnected',
        data: {
          id: idToDisconnect
        }
      }
      return push.notifyDeviceDisconnected(mockUid, idToDisconnect).catch(function (err) {
        assert.fail('must not throw')
        throw err
      })
      .then(function() {
        assert.ok(push.pushToDevice.calledOnce, 'pushToDevice was called')
        assert.equal(push.pushToDevice.getCall(0).args[0], mockUid)
        assert.equal(push.pushToDevice.getCall(0).args[1], idToDisconnect)
        assert.equal(push.pushToDevice.getCall(0).args[2], 'deviceDisconnected')
        var options = push.pushToDevice.getCall(0).args[3]
        var payload = JSON.parse(options.data.toString('utf8'))
        assert.deepEqual(payload, expectedData)
        var schemaPath = path.resolve(__dirname, PUSH_PAYLOADS_SCHEMA_PATH)
        var schema = JSON.parse(fs.readFileSync(schemaPath))
        assert.ok(ajv.validate(schema, payload))
        assert.ok(options.TTL, 'TTL should be set')
        push.pushToDevice.restore()
      })
    }
  )

  it(
    'notifyPasswordChanged calls sendPush',
    () => {
      var mocks = {
        'web-push': {
          sendNotification: function (sub, payload, options) {
            return P.resolve()
          }
        }
      }
      var push = proxyquire(pushModulePath, mocks)(mockLog(), mockDbResult, mockConfig)
      sinon.spy(push, 'sendPush')
      var expectedData = {
        version: 1,
        command: 'fxaccounts:password_changed'
      }
      return push.notifyPasswordChanged(mockUid, mockDevices).catch(function (err) {
        assert.fail('must not throw')
        throw err
      })
      .then(function() {
        assert.ok(push.sendPush.calledOnce, 'sendPush was called')
        assert.equal(push.sendPush.getCall(0).args[0], mockUid)
        assert.equal(push.sendPush.getCall(0).args[1], mockDevices)
        assert.equal(push.sendPush.getCall(0).args[2], 'passwordChange')
        var options = push.sendPush.getCall(0).args[3]
        var payload = JSON.parse(options.data.toString('utf8'))
        assert.deepEqual(payload, expectedData)
        var schemaPath = path.resolve(__dirname, PUSH_PAYLOADS_SCHEMA_PATH)
        var schema = JSON.parse(fs.readFileSync(schemaPath))
        assert.ok(ajv.validate(schema, payload))
        push.sendPush.restore()
      })
    }
  )

  it(
    'notifyPasswordReset calls sendPush',
    () => {
      var mocks = {
        'web-push': {
          sendNotification: function (sub, payload, options) {
            return P.resolve()
          }
        }
      }
      var push = proxyquire(pushModulePath, mocks)(mockLog(), mockDbEmpty, mockConfig)
      sinon.spy(push, 'sendPush')
      var expectedData = {
        version: 1,
        command: 'fxaccounts:password_reset'
      }
      return push.notifyPasswordReset(mockUid, mockDevices).catch(function (err) {
        assert.fail('must not throw')
        throw err
      })
      .then(function() {
        assert.ok(push.sendPush.calledOnce, 'sendPush was called')
        assert.equal(push.sendPush.getCall(0).args[0], mockUid)
        assert.equal(push.sendPush.getCall(0).args[1], mockDevices)
        assert.equal(push.sendPush.getCall(0).args[2], 'passwordReset')
        var options = push.sendPush.getCall(0).args[3]
        var payload = JSON.parse(options.data.toString('utf8'))
        assert.deepEqual(payload, expectedData)
        var schemaPath = path.resolve(__dirname, PUSH_PAYLOADS_SCHEMA_PATH)
        var schema = JSON.parse(fs.readFileSync(schemaPath))
        assert.ok(ajv.validate(schema, payload))
        push.sendPush.restore()
      })
    }
  )

  it(
    'sendPush includes VAPID identification if it is configured',
    () => {
      let count = 0
      var thisMockLog = mockLog({
        info: function (log) {
          if (log.name === 'push.account_verify.success') {
            count++
          }
        }
      })

      var mockConfig = {
        publicUrl: 'https://example.com',
        vapidKeysFile: path.join(__dirname, '../config/mock-vapid-keys.json')
      }

      var mocks = {
        'web-push': {
          sendNotification: function (sub, payload, options) {
            assert.ok(options.vapidDetails, 'sends the VAPID params object')
            assert.equal(options.vapidDetails.subject, mockConfig.publicUrl, 'sends the correct VAPID subject')
            assert.equal(options.vapidDetails.privateKey, 'private', 'sends the correct VAPID privkey')
            assert.equal(options.vapidDetails.publicKey, 'public', 'sends the correct VAPID pubkey')
            return P.resolve()
          }
        }
      }

      var push = proxyquire(pushModulePath, mocks)(thisMockLog, mockDbResult, mockConfig)
      return push.sendPush(mockUid, mockDevices, 'accountVerify')
        .then(() => {
          assert.equal(count, 2)
        })
    }
  )

  it(
    'sendPush errors out cleanly if given an unknown reason argument',
    () => {
      var thisMockLog = mockLog()
      var mockConfig = {}
      var mocks = {
        'web-push': {
          sendNotification: function (sub, payload, options) {
            assert.fail('should not have called sendNotification')
            return P.reject('Should not have called sendNotification')
          }
        }
      }

      var push = proxyquire(pushModulePath, mocks)(thisMockLog, mockDbResult, mockConfig)
      return push.sendPush(mockUid, mockDevices, 'anUnknownReasonString').then(
        function () {
          assert(false, 'calling sendPush should have failed')
        },
        function (err) {
          assert.equal(err, 'Unknown push reason: anUnknownReasonString')
        }
      )
    }
  )
})
