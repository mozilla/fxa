/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var uuid = require('uuid')
var crypto = require('crypto')
var mocks = require('../../mocks')

var modulePath = '../../../lib/devices'

describe('devices', () => {
  it('should be an exported function', () => {
    assert.equal(typeof require(modulePath), 'function', 'require returns function')
    assert.equal(require(modulePath).length, 3, 'returned function expects three arguments')
  })

  describe('instance', () => {
    var log = mocks.spyLog()
    var deviceCreatedAt = Date.now()
    var deviceId = crypto.randomBytes(16)
    var device = {
      name: 'foo',
      type: 'bar'
    }
    var db = mocks.mockDB({
      device: device,
      deviceCreatedAt: deviceCreatedAt,
      deviceId: deviceId
    })
    var push = mocks.mockPush()
    var devices = require(modulePath)(log, db, push)

    it('should instantiate', () => {

      assert.equal(typeof devices, 'object', 'devices is object')
      assert.equal(Object.keys(devices).length, 2, 'devices has two properties')

      assert.equal(typeof devices.upsert, 'function', 'devices has upsert method')
      assert.equal(devices.upsert.length, 3, 'devices.upsert expects three arguments')

      assert.equal(typeof devices.synthesizeName, 'function', 'devices has synthesizeName method')
      assert.equal(devices.synthesizeName.length, 1, 'devices.synthesizeName expects 1 argument')

    })

    describe('.upsert', () => {
      const request = mocks.mockRequest({
        log: log
      })
      var sessionToken = {
        tokenId: crypto.randomBytes(16),
        uid: uuid.v4('binary')
      }

      it('should create', () => {
        return devices.upsert(request, sessionToken, device)
          .then(function (result) {
            assert.deepEqual(result, {
              id: deviceId,
              name: device.name,
              type: device.type,
              createdAt: deviceCreatedAt
            }, 'result was correct')

            assert.equal(db.updateDevice.callCount, 0, 'db.updateDevice was not called')

            assert.equal(db.createDevice.callCount, 1, 'db.createDevice was called once')
            var args = db.createDevice.args[0]
            assert.equal(args.length, 3, 'db.createDevice was passed three arguments')
            assert.deepEqual(args[0], sessionToken.uid, 'first argument was uid')
            assert.deepEqual(args[1], sessionToken.tokenId, 'second argument was sessionTokenId')
            assert.equal(args[2], device, 'third argument was device')

            assert.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
            args = log.activityEvent.args[0]
            assert.equal(args.length, 1, 'log.activityEvent was passed one argument')
            assert.deepEqual(args[0], {
              event: 'device.created',
              service: undefined,
              userAgent: 'test user-agent',
              uid: sessionToken.uid.toString('hex'),
              device_id: deviceId.toString('hex'),
              is_placeholder: false
            }, 'event data was correct')

            assert.equal(log.info.callCount, 0, 'log.info was not called')

            assert.equal(log.notifyAttachedServices.callCount, 1, 'log.notifyAttachedServices was called once')
            args = log.notifyAttachedServices.args[0]
            assert.equal(args.length, 3, 'log.notifyAttachedServices was passed three arguments')
            assert.equal(args[0], 'device:create', 'first argument was event name')
            assert.equal(args[1], request, 'second argument was request object')
            assert.deepEqual(args[2], {
              uid: sessionToken.uid,
              id: deviceId,
              type: device.type,
              timestamp: deviceCreatedAt,
              isPlaceholder: false
            }, 'third argument was event data')

            assert.equal(push.notifyDeviceConnected.callCount, 1, 'push.notifyDeviceConnected was called once')
            args = push.notifyDeviceConnected.args[0]
            assert.equal(args.length, 3, 'push.notifyDeviceConnected was passed three arguments')
            assert.equal(args[0], sessionToken.uid, 'first argument was uid')
            assert.equal(args[1], device.name, 'second arguent was device name')
            assert.equal(args[2], deviceId.toString('hex'), 'third argument was device id')
          })
          .then(function () {
            db.createDevice.reset()
            push.notifyDeviceConnected.reset()
            log.activityEvent.reset()
            log.notifyAttachedServices.reset()
          })
      })

      it('should create placeholders', () => {
        return devices.upsert(request, sessionToken, {})
          .then(function (result) {
            assert.equal(db.updateDevice.callCount, 0, 'db.updateDevice was not called')
            assert.equal(db.createDevice.callCount, 1, 'db.createDevice was called once')

            assert.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
            assert.equal(log.activityEvent.args[0][0].is_placeholder, true, 'is_placeholder was correct')

            assert.equal(log.info.callCount, 1, 'log.info was called once')
            assert.equal(log.info.args[0].length, 1, 'log.info was passed one argument')
            assert.deepEqual(log.info.args[0][0], {
              op: 'device:createPlaceholder',
              uid: sessionToken.uid,
              id: result.id
            }, 'argument was event data')

            assert.equal(log.notifyAttachedServices.callCount, 1, 'log.notifyAttachedServices was called once')
            assert.equal(log.notifyAttachedServices.args[0][2].isPlaceholder, true, 'isPlaceholder was correct')

            assert.equal(push.notifyDeviceConnected.callCount, 1, 'push.notifyDeviceConnected was called once')
          })
          .then(function () {
            db.createDevice.reset()
            push.notifyDeviceConnected.reset()
            log.activityEvent.reset()
            log.info.reset()
            log.notifyAttachedServices.reset()
          })
      })

      it('should update', () => {
        var deviceInfo = {
          id: deviceId,
          name: device.name,
          type: device.type
        }
        return devices.upsert(request, sessionToken, deviceInfo)
          .then(function (result) {
            assert.equal(result, deviceInfo, 'result was correct')

            assert.equal(db.createDevice.callCount, 0, 'db.createDevice was not called')

            assert.equal(db.updateDevice.callCount, 1, 'db.updateDevice was called once')
            var args = db.updateDevice.args[0]
            assert.equal(args.length, 3, 'db.createDevice was passed three arguments')
            assert.deepEqual(args[0], sessionToken.uid, 'first argument was uid')
            assert.deepEqual(args[1], sessionToken.tokenId, 'second argument was sessionTokenId')
            assert.deepEqual(args[2], {
              id: deviceId,
              name: device.name,
              type: device.type
            }, 'device info was unmodified')

            assert.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
            args = log.activityEvent.args[0]
            assert.equal(args.length, 1, 'log.activityEvent was passed one argument')
            assert.deepEqual(args[0], {
              event: 'device.updated',
              service: undefined,
              userAgent: 'test user-agent',
              uid: sessionToken.uid.toString('hex'),
              device_id: deviceId.toString('hex'),
              is_placeholder: false
            }, 'event data was correct')

            assert.equal(log.info.callCount, 0, 'log.info was not called')

            assert.equal(log.notifyAttachedServices.callCount, 0, 'log.notifyAttachedServices was not called')

            assert.equal(push.notifyDeviceConnected.callCount, 0, 'push.notifyDeviceConnected was not called')
          })
          .then(function () {
            db.createDevice.reset()
            log.activityEvent.reset()
            log.notifyAttachedServices.reset()
          })
      })
    })

    it('should synthesizeName', () => {
      assert.equal(devices.synthesizeName({
        uaBrowser: 'foo',
        uaBrowserVersion: 'bar',
        uaOS: 'baz',
        uaOSVersion: 'qux'
      }), 'foo bar, baz qux', 'result is correct when all ua properties are set')

      assert.equal(devices.synthesizeName({
        uaBrowserVersion: 'foo',
        uaOS: 'bar',
        uaOSVersion: 'baz'
      }), 'bar baz', 'result is correct when uaBrowser property is missing')

      assert.equal(devices.synthesizeName({
        uaBrowser: 'foo',
        uaOS: 'bar',
        uaOSVersion: 'baz'
      }), 'foo, bar baz', 'result is correct when uaBrowserVersion property is missing')

      assert.equal(devices.synthesizeName({
        uaBrowser: 'foo',
        uaBrowserVersion: 'bar',
        uaOSVersion: 'baz'
      }), 'foo bar', 'result is correct when uaOS property is missing')

      assert.equal(devices.synthesizeName({
        uaBrowser: 'foo',
        uaBrowserVersion: 'bar',
        uaOS: 'baz'
      }), 'foo bar, baz', 'result is correct when uaOSVersion property is missing')

      assert.equal(devices.synthesizeName({
        uaBrowser: 'wibble',
        uaBrowserVersion: 'blee'
      }), 'wibble blee', 'result is correct when both uaOS properties are missing')

      assert.equal(devices.synthesizeName({
        uaOS: 'foo'
      }), 'foo', 'result is correct when only uaOS property is present')

      assert.equal(devices.synthesizeName({
        uaOSVersion: 'foo'
      }), '', 'result defaults to the empty string')
    })
  })
})
