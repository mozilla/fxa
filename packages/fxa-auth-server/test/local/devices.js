/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var uuid = require('uuid')
var crypto = require('crypto')
const mocks = require('../mocks')

const modulePath = '../../lib/devices'

describe('devices', () => {
  it('should export the correct interface', () => {
    assert.equal(typeof require(modulePath), 'function', 'require returns function')
    assert.equal(require(modulePath).length, 3, 'returned function expects three arguments')
    assert.equal(typeof require(modulePath).schema, 'object', 'devices.schema is object')
    assert.notEqual(require(modulePath).schema, null, 'devices.schema is not null')
  })

  describe('instance', () => {

    var log, deviceCreatedAt, deviceId, device, db, push, devices

    beforeEach(() => {
      log = mocks.spyLog()
      deviceCreatedAt = Date.now()
      deviceId = crypto.randomBytes(16).toString('hex')
      device = {
        name: 'foo',
        type: 'bar'
      }
      db = mocks.mockDB({
        device: device,
        deviceCreatedAt: deviceCreatedAt,
        deviceId: deviceId
      })
      push = mocks.mockPush()
      devices = require(modulePath)(log, db, push)
    })

    it('should instantiate', () => {

      assert.equal(typeof devices, 'object', 'devices is object')
      assert.equal(Object.keys(devices).length, 2, 'devices has two properties')

      assert.equal(typeof devices.upsert, 'function', 'devices has upsert method')
      assert.equal(devices.upsert.length, 3, 'devices.upsert expects three arguments')

      assert.equal(typeof devices.synthesizeName, 'function', 'devices has synthesizeName method')
      assert.equal(devices.synthesizeName.length, 1, 'devices.synthesizeName expects 1 argument')

    })

    describe('.upsert', () => {

      var request, sessionToken

      beforeEach(() => {
        request = mocks.mockRequest({
          log: log
        })
        sessionToken = {
          tokenId: crypto.randomBytes(16).toString('hex'),
          uid: uuid.v4('binary'),
          tokenVerified: true
        }
      })

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
              uid: sessionToken.uid,
              device_id: deviceId,
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
            assert.equal(args[2], deviceId, 'third argument was device id')
          })
      })

      it('should not call notifyDeviceConnected with unverified token', () => {
        sessionToken.tokenVerified = false
        device.name = 'device with an unverified sessionToken'
        return devices.upsert(request, sessionToken, device)
          .then(function () {
            assert.equal(push.notifyDeviceConnected.callCount, 0, 'push.notifyDeviceConnected was not called')
            sessionToken.tokenVerified = true
          })
      })

      it('should create placeholders', () => {
        delete device.name
        return devices.upsert(request, sessionToken, { uaBrowser: 'Firefox' })
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
            assert.equal(push.notifyDeviceConnected.args[0][0], sessionToken.uid, 'uid was correct')
            assert.equal(push.notifyDeviceConnected.args[0][1], 'Firefox', 'device name was included')

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
              uid: sessionToken.uid,
              device_id: deviceId,
              is_placeholder: false
            }, 'event data was correct')

            assert.equal(log.info.callCount, 0, 'log.info was not called')

            assert.equal(log.notifyAttachedServices.callCount, 0, 'log.notifyAttachedServices was not called')

            assert.equal(push.notifyDeviceConnected.callCount, 0, 'push.notifyDeviceConnected was not called')
          })
      })
    })

    it('should synthesizeName', () => {
      assert.equal(devices.synthesizeName({
        uaBrowser: 'foo',
        uaBrowserVersion: 'bar',
        uaOS: 'baz',
        uaOSVersion: 'qux',
        uaFormFactor: 'wibble'
      }), 'foo bar, wibble', 'result is correct when all ua properties are set')

      assert.equal(devices.synthesizeName({
        uaBrowserVersion: 'foo',
        uaOS: 'bar',
        uaOSVersion: 'baz',
        uaFormFactor: 'wibble'
      }), 'wibble', 'result is correct when uaBrowser property is missing')

      assert.equal(devices.synthesizeName({
        uaBrowser: 'foo',
        uaOS: 'bar',
        uaOSVersion: 'baz',
        uaFormFactor: 'wibble'
      }), 'foo, wibble', 'result is correct when uaBrowserVersion property is missing')

      assert.equal(devices.synthesizeName({
        uaBrowser: 'foo',
        uaBrowserVersion: 'bar',
        uaOSVersion: 'baz',
        uaFormFactor: 'wibble'
      }), 'foo bar, wibble', 'result is correct when uaOS property is missing')

      assert.equal(devices.synthesizeName({
        uaBrowser: 'foo',
        uaBrowserVersion: 'bar',
        uaOS: 'baz',
        uaFormFactor: 'wibble'
      }), 'foo bar, wibble', 'result is correct when uaOSVersion property is missing')

      assert.equal(devices.synthesizeName({
        uaBrowser: 'foo',
        uaBrowserVersion: 'bar',
        uaOS: 'baz',
        uaOSVersion: 'qux'
      }), 'foo bar, baz qux', 'result is correct when uaFormFactor property is missing')

      assert.equal(devices.synthesizeName({
        uaOS: 'bar',
        uaFormFactor: 'wibble'
      }), 'wibble', 'result is correct when uaBrowser and uaBrowserVersion properties are missing')

      assert.equal(devices.synthesizeName({
        uaBrowser: 'wibble',
        uaBrowserVersion: 'blee',
        uaOSVersion: 'qux'
      }), 'wibble blee', 'result is correct when uaOS and uaFormFactor properties are missing')

      assert.equal(devices.synthesizeName({
        uaBrowser: 'foo',
        uaBrowserVersion: 'bar',
        uaOS: 'baz'
      }), 'foo bar, baz', 'result is correct when uaOSVersion and uaFormFactor properties are missing')

      assert.equal(devices.synthesizeName({
        uaOS: 'foo'
      }), 'foo', 'result is correct when only uaOS property is present')

      assert.equal(devices.synthesizeName({
        uaFormFactor: 'bar'
      }), 'bar', 'result is correct when only uaFormFactor property is present')

      assert.equal(devices.synthesizeName({
        uaOS: 'foo',
        uaOSVersion: 'bar'
      }), 'foo bar', 'result is correct when only uaOS and uaOSVersion properties are present')

      assert.equal(devices.synthesizeName({
        uaOSVersion: 'foo'
      }), '', 'result defaults to the empty string')
    })
  })
})
