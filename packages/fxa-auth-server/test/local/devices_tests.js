/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var uuid = require('uuid')
var crypto = require('crypto')
var test = require('../ptaptest')
var mocks = require('../mocks')

var modulePath = '../../lib/devices'

test('require', function (t) {
  t.plan(3)
  t.equal(typeof require(modulePath), 'function', 'require returns function')
  t.equal(require(modulePath).length, 3, 'returned function expects three arguments')

  t.test('instantiate', function (t) {
    t.plan(8)
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

    t.equal(typeof devices, 'object', 'devices is object')
    t.equal(Object.keys(devices).length, 2, 'devices has two properties')

    t.equal(typeof devices.upsert, 'function', 'devices has upsert method')
    t.equal(devices.upsert.length, 3, 'devices.upsert expects three arguments')

    t.equal(typeof devices.synthesizeName, 'function', 'devices has synthesizeName method')
    t.equal(devices.synthesizeName.length, 1, 'devices.synthesizeName expects 1 argument')

    t.test('devices.upsert', function (t) {
      t.plan(3)
      var request = {}
      var sessionToken = {
        tokenId: crypto.randomBytes(16),
        uid: uuid.v4('binary')
      }

      t.test('create', function (t) {
        return devices.upsert(request, sessionToken, device)
          .then(function (result) {
            t.deepEqual(result, {
              id: deviceId,
              name: device.name,
              type: device.type,
              createdAt: deviceCreatedAt
            }, 'result was correct')

            t.equal(db.updateDevice.callCount, 0, 'db.updateDevice was not called')

            t.equal(db.createDevice.callCount, 1, 'db.createDevice was called once')
            var args = db.createDevice.args[0]
            t.equal(args.length, 3, 'db.createDevice was passed three arguments')
            t.deepEqual(args[0], sessionToken.uid, 'first argument was uid')
            t.deepEqual(args[1], sessionToken.tokenId, 'second argument was sessionTokenId')
            t.equal(args[2], device, 'third argument was device')

            t.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
            args = log.activityEvent.args[0]
            t.equal(args.length, 3, 'log.activityEvent was passed three arguments')
            t.equal(args[0], 'device.created', 'first argument was event name')
            t.equal(args[1], request, 'second argument was request object')
            t.deepEqual(args[2], {
              uid: sessionToken.uid.toString('hex'),
              device_id: deviceId.toString('hex'),
              is_placeholder: false
            }, 'third argument contained uid, device_id and is_placeholder')

            t.equal(log.info.callCount, 0, 'log.info was not called')

            t.equal(log.notifyAttachedServices.callCount, 1, 'log.notifyAttachedServices was called once')
            args = log.notifyAttachedServices.args[0]
            t.equal(args.length, 3, 'log.notifyAttachedServices was passed three arguments')
            t.equal(args[0], 'device:create', 'first argument was event name')
            t.equal(args[1], request, 'second argument was request object')
            t.deepEqual(args[2], {
              uid: sessionToken.uid,
              id: deviceId,
              type: device.type,
              timestamp: deviceCreatedAt,
              isPlaceholder: false
            }, 'third argument was event data')

            t.equal(push.notifyDeviceConnected.callCount, 1, 'push.notifyDeviceConnected was called once')
            args = push.notifyDeviceConnected.args[0]
            t.equal(args.length, 3, 'push.notifyDeviceConnected was passed three arguments')
            t.equal(args[0], sessionToken.uid, 'first argument was uid')
            t.equal(args[1], device.name, 'second arguent was device name')
            t.equal(args[2], deviceId.toString('hex'), 'third argument was device id')
          })
          .then(function () {
            db.createDevice.reset()
            push.notifyDeviceConnected.reset()
            log.activityEvent.reset()
            log.notifyAttachedServices.reset()
          })
      })

      t.test('create placeholder', function (t) {
        return devices.upsert(request, sessionToken, {})
          .then(function (result) {
            t.equal(db.updateDevice.callCount, 0, 'db.updateDevice was not called')
            t.equal(db.createDevice.callCount, 1, 'db.createDevice was called once')

            t.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
            t.equal(log.activityEvent.args[0][2].is_placeholder, true, 'is_placeholder was correct')

            t.equal(log.info.callCount, 1, 'log.info was called once')
            t.equal(log.info.args[0].length, 1, 'log.info was passed one argument')
            t.deepEqual(log.info.args[0][0], {
              op: 'device:createPlaceholder',
              uid: sessionToken.uid,
              id: result.id
            }, 'argument was event data')

            t.equal(log.notifyAttachedServices.callCount, 1, 'log.notifyAttachedServices was called once')
            t.equal(log.notifyAttachedServices.args[0][2].isPlaceholder, true, 'isPlaceholder was correct')

            t.equal(push.notifyDeviceConnected.callCount, 1, 'push.notifyDeviceConnected was called once')
          })
          .then(function () {
            db.createDevice.reset()
            push.notifyDeviceConnected.reset()
            log.activityEvent.reset()
            log.info.reset()
            log.notifyAttachedServices.reset()
          })
      })

      t.test('update', function (t) {
        var deviceInfo = {
          id: deviceId,
          name: device.name,
          type: device.type
        }
        return devices.upsert(request, sessionToken, deviceInfo)
          .then(function (result) {
            t.equal(result, deviceInfo, 'result was correct')

            t.equal(db.createDevice.callCount, 0, 'db.createDevice was not called')

            t.equal(db.updateDevice.callCount, 1, 'db.updateDevice was called once')
            var args = db.updateDevice.args[0]
            t.equal(args.length, 3, 'db.createDevice was passed three arguments')
            t.deepEqual(args[0], sessionToken.uid, 'first argument was uid')
            t.deepEqual(args[1], sessionToken.tokenId, 'second argument was sessionTokenId')
            t.deepEqual(args[2], {
              id: deviceId,
              name: device.name,
              type: device.type
            }, 'device info was unmodified')

            t.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
            args = log.activityEvent.args[0]
            t.equal(args.length, 3, 'log.activityEvent was passed three arguments')
            t.equal(args[0], 'device.updated', 'first argument was event name')
            t.equal(args[1], request, 'second argument was request object')
            t.deepEqual(args[2], {
              uid: sessionToken.uid.toString('hex'),
              device_id: deviceId.toString('hex'),
              is_placeholder: false
            }, 'third argument contained uid and device_id')

            t.equal(log.info.callCount, 0, 'log.info was not called')

            t.equal(log.notifyAttachedServices.callCount, 0, 'log.notifyAttachedServices was not called')

            t.equal(push.notifyDeviceConnected.callCount, 0, 'push.notifyDeviceConnected was not called')
          })
          .then(function () {
            db.createDevice.reset()
            log.activityEvent.reset()
            log.notifyAttachedServices.reset()
          })
      })
    })

    t.test('devices.synthesizeName', function (t) {
      t.equal(devices.synthesizeName({
        uaBrowser: 'foo',
        uaBrowserVersion: 'bar',
        uaOS: 'baz',
        uaOSVersion: 'qux'
      }), 'foo bar, baz qux', 'result is correct when all ua properties are set')

      t.equal(devices.synthesizeName({
        uaBrowserVersion: 'foo',
        uaOS: 'bar',
        uaOSVersion: 'baz'
      }), 'bar baz', 'result is correct when uaBrowser property is missing')

      t.equal(devices.synthesizeName({
        uaBrowser: 'foo',
        uaOS: 'bar',
        uaOSVersion: 'baz'
      }), 'foo, bar baz', 'result is correct when uaBrowserVersion property is missing')

      t.equal(devices.synthesizeName({
        uaBrowser: 'foo',
        uaBrowserVersion: 'bar',
        uaOSVersion: 'baz'
      }), 'foo bar', 'result is correct when uaOS property is missing')

      t.equal(devices.synthesizeName({
        uaBrowser: 'foo',
        uaBrowserVersion: 'bar',
        uaOS: 'baz'
      }), 'foo bar, baz', 'result is correct when uaOSVersion property is missing')

      t.equal(devices.synthesizeName({
        uaBrowser: 'wibble',
        uaBrowserVersion: 'blee'
      }), 'wibble blee', 'result is correct when both uaOS properties are missing')

      t.equal(devices.synthesizeName({
        uaOS: 'foo'
      }), 'foo', 'result is correct when only uaOS property is present')

      t.equal(devices.synthesizeName({
        uaOSVersion: 'foo'
      }), '', 'result defaults to the empty string')

      t.end()
    })
  })
})

