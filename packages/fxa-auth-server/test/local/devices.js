/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const { assert } = require('chai')
const crypto = require('crypto')
const mocks = require('../mocks')
const uuid = require('uuid')

const MODULE_PATH = '../../lib/devices'

describe('lib/devices:', () => {
  it('should export the correct interface', () => {
    assert.equal(typeof require(MODULE_PATH), 'function')
    assert.equal(require(MODULE_PATH).length, 3)
    assert.equal(typeof require(MODULE_PATH).schema, 'object')
    assert.notEqual(require(MODULE_PATH).schema, null)
  })

  describe('instantiate:', () => {
    let log, deviceCreatedAt, deviceId, device, db, push, devices

    beforeEach(() => {
      log = mocks.mockLog()
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
      devices = require(MODULE_PATH)(log, db, push)
    })

    it('returns the expected interface', () => {
      assert.equal(typeof devices, 'object')
      assert.equal(Object.keys(devices).length, 3)

      assert.equal(typeof devices.isSpuriousUpdate, 'function')
      assert.equal(devices.isSpuriousUpdate.length, 2)

      assert.equal(typeof devices.upsert, 'function')
      assert.equal(devices.upsert.length, 3)

      assert.equal(typeof devices.synthesizeName, 'function')
      assert.equal(devices.synthesizeName.length, 1)
    })

    describe('isSpuriousUpdate:', () => {
      it('returns false when token has no device record', () => {
        assert.strictEqual(devices.isSpuriousUpdate({}, {}), false)
      })

      it('returns false when token has different device id', () => {
        assert.strictEqual(devices.isSpuriousUpdate({
          id: 'foo'
        }, {
          deviceId: 'bar'
        }), false)
      })

      it('returns true when ids match', () => {
        assert.strictEqual(devices.isSpuriousUpdate({
          id: 'foo'
        }, {
          deviceId: 'foo'
        }), true)
      })

      it('returns false when token has different device name', () => {
        assert.strictEqual(devices.isSpuriousUpdate({
          id: 'foo',
          name: 'foo'
        }, {
          deviceId: 'foo',
          deviceName: 'bar'
        }), false)
      })

      it('returns true when ids and names match', () => {
        assert.strictEqual(devices.isSpuriousUpdate({
          id: 'foo',
          name: 'foo'
        }, {
          deviceId: 'foo',
          deviceName: 'foo'
        }), true)
      })

      it('returns false when token has different device type', () => {
        assert.strictEqual(devices.isSpuriousUpdate({
          id: 'foo',
          type: 'foo'
        }, {
          deviceId: 'foo',
          deviceType: 'bar'
        }), false)
      })

      it('returns true when ids and types match', () => {
        assert.strictEqual(devices.isSpuriousUpdate({
          id: 'foo',
          type: 'foo'
        }, {
          deviceId: 'foo',
          deviceType: 'foo'
        }), true)
      })

      it('returns false when token has different device callback URL', () => {
        assert.strictEqual(devices.isSpuriousUpdate({
          id: 'foo',
          pushCallback: 'foo'
        }, {
          deviceId: 'foo',
          deviceCallbackURL: 'bar'
        }), false)
      })

      it('returns true when ids and callback URLs match', () => {
        assert.strictEqual(devices.isSpuriousUpdate({
          id: 'foo',
          pushCallback: 'foo'
        }, {
          deviceId: 'foo',
          deviceCallbackURL: 'foo'
        }), true)
      })

      it('returns false when token has different device callback public key', () => {
        assert.strictEqual(devices.isSpuriousUpdate({
          id: 'foo',
          pushPublicKey: 'foo'
        }, {
          deviceId: 'foo',
          deviceCallbackPublicKey: 'bar'
        }), false)
      })

      it('returns true when ids and callback public keys match', () => {
        assert.strictEqual(devices.isSpuriousUpdate({
          id: 'foo',
          pushPublicKey: 'foo'
        }, {
          deviceId: 'foo',
          deviceCallbackPublicKey: 'foo'
        }), true)
      })

      it('returns false when payload has different available commands', () => {
        assert.strictEqual(devices.isSpuriousUpdate({
          id: 'foo',
          availableCommands: {
            foo: 'bar',
            baz: 'qux'
          }
        }, {
          deviceId: 'foo',
          deviceAvailableCommands: {
            foo: 'bar'
          }
        }), false)
      })

      it('returns false when token has different device available commands', () => {
        assert.strictEqual(devices.isSpuriousUpdate({
          id: 'foo',
          availableCommands: {
            foo: 'bar'
          }
        }, {
          deviceId: 'foo',
          deviceAvailableCommands: {
            foo: 'bar',
            baz: 'qux'
          }
        }), false)
      })

      it('returns true when ids and available commands match', () => {
        assert.strictEqual(devices.isSpuriousUpdate({
          id: 'foo',
          availableCommands: {
            foo: 'bar'
          }
        }, {
          deviceId: 'foo',
          deviceAvailableCommands: {
            foo: 'bar'
          }
        }), true)
      })

      it('returns true when all properties match', () => {
        assert.strictEqual(devices.isSpuriousUpdate({
          id: 'foo',
          name: 'bar',
          type: 'baz',
          pushCallback: 'wibble',
          pushPublicKey: 'blee',
          availableCommands: {
            frop: 'punv',
            thib: 'blap'
          }
        }, {
          deviceId: 'foo',
          deviceName: 'bar',
          deviceType: 'baz',
          deviceCallbackURL: 'wibble',
          deviceCallbackPublicKey: 'blee',
          deviceAvailableCommands: {
            frop: 'punv',
            thib: 'blap'
          }
        }), true)
      })
    })

    describe('upsert:', () => {

      var request, sessionToken

      beforeEach(() => {
        request = mocks.mockRequest({
          log: log
        })
        sessionToken = {
          id: crypto.randomBytes(16).toString('hex'),
          uid: uuid.v4('binary').toString('hex'),
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
            assert.deepEqual(args[1], sessionToken.id, 'second argument was sessionTokenId')
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
            assert.ok(Array.isArray(args[1]), 'second argument was devices array')
            assert.equal(args[2], device.name, 'third argument was device name')
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
            assert.equal(push.notifyDeviceConnected.args[0][2], 'Firefox', 'device name was included')

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
            assert.deepEqual(args[1], sessionToken.id, 'second argument was sessionTokenId')
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
        uaBrowserVersion: 'bar.bar',
        uaOS: 'baz',
        uaOSVersion: 'qux',
        uaFormFactor: 'wibble'
      }), 'foo bar, wibble', 'result is correct when all ua properties are set')

      assert.equal(devices.synthesizeName({
        uaBrowserVersion: 'foo.foo',
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
        uaBrowserVersion: 'bar.bar',
        uaOSVersion: 'baz',
        uaFormFactor: 'wibble'
      }), 'foo bar, wibble', 'result is correct when uaOS property is missing')

      assert.equal(devices.synthesizeName({
        uaBrowser: 'foo',
        uaBrowserVersion: 'bar.bar',
        uaOS: 'baz',
        uaFormFactor: 'wibble'
      }), 'foo bar, wibble', 'result is correct when uaOSVersion property is missing')

      assert.equal(devices.synthesizeName({
        uaBrowser: 'foo',
        uaBrowserVersion: 'bar.bar',
        uaOS: 'baz',
        uaOSVersion: 'qux'
      }), 'foo bar, baz qux', 'result is correct when uaFormFactor property is missing')

      assert.equal(devices.synthesizeName({
        uaOS: 'bar',
        uaFormFactor: 'wibble'
      }), 'wibble', 'result is correct when uaBrowser and uaBrowserVersion properties are missing')

      assert.equal(devices.synthesizeName({
        uaBrowser: 'wibble',
        uaBrowserVersion: 'blee.blee',
        uaOSVersion: 'qux'
      }), 'wibble blee', 'result is correct when uaOS and uaFormFactor properties are missing')

      assert.equal(devices.synthesizeName({
        uaBrowser: 'foo',
        uaBrowserVersion: 'bar.bar',
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
