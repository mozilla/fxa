/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const sinon = require('sinon');
const crypto = require('crypto');
const mocks = require('../mocks');
const error = require('../../lib/error');
const uuid = require('uuid');

const MODULE_PATH = '../../lib/devices';

describe('lib/devices:', () => {
  it('should export the correct interface', () => {
    assert.equal(typeof require(MODULE_PATH), 'function');
    assert.equal(require(MODULE_PATH).length, 4);
    assert.equal(typeof require(MODULE_PATH).schema, 'object');
    assert.notEqual(require(MODULE_PATH).schema, null);
  });

  describe('instantiate:', () => {
    let log, deviceCreatedAt, deviceId, device, db, oauthdb, push, devices;

    beforeEach(() => {
      log = mocks.mockLog();
      deviceCreatedAt = Date.now();
      deviceId = crypto.randomBytes(16).toString('hex');
      device = {
        name: 'foo',
        type: 'bar',
      };
      db = mocks.mockDB({
        device: device,
        deviceCreatedAt: deviceCreatedAt,
        deviceId: deviceId,
      });
      oauthdb = mocks.mockOAuthDB({});
      push = mocks.mockPush();
      devices = require(MODULE_PATH)(log, db, oauthdb, push);
    });

    it('returns the expected interface', () => {
      assert.equal(typeof devices, 'object');
      assert.equal(Object.keys(devices).length, 4);

      assert.equal(typeof devices.isSpuriousUpdate, 'function');
      assert.equal(devices.isSpuriousUpdate.length, 2);

      assert.equal(typeof devices.upsert, 'function');
      assert.equal(devices.upsert.length, 3);

      assert.equal(typeof devices.destroy, 'function');
      assert.equal(devices.destroy.length, 2);

      assert.equal(typeof devices.synthesizeName, 'function');
      assert.equal(devices.synthesizeName.length, 1);
    });

    describe('isSpuriousUpdate:', () => {
      it('returns false when token has no device record', () => {
        assert.strictEqual(devices.isSpuriousUpdate({}, {}), false);
      });

      it('returns false when token has different device id', () => {
        assert.strictEqual(
          devices.isSpuriousUpdate(
            {
              id: 'foo',
            },
            {
              deviceId: 'bar',
            }
          ),
          false
        );
      });

      it('returns true when ids match', () => {
        assert.strictEqual(
          devices.isSpuriousUpdate(
            {
              id: 'foo',
            },
            {
              deviceId: 'foo',
            }
          ),
          true
        );
      });

      it('returns false when token has different device name', () => {
        assert.strictEqual(
          devices.isSpuriousUpdate(
            {
              id: 'foo',
              name: 'foo',
            },
            {
              deviceId: 'foo',
              deviceName: 'bar',
            }
          ),
          false
        );
      });

      it('returns true when ids and names match', () => {
        assert.strictEqual(
          devices.isSpuriousUpdate(
            {
              id: 'foo',
              name: 'foo',
            },
            {
              deviceId: 'foo',
              deviceName: 'foo',
            }
          ),
          true
        );
      });

      it('returns false when token has different device type', () => {
        assert.strictEqual(
          devices.isSpuriousUpdate(
            {
              id: 'foo',
              type: 'foo',
            },
            {
              deviceId: 'foo',
              deviceType: 'bar',
            }
          ),
          false
        );
      });

      it('returns true when ids and types match', () => {
        assert.strictEqual(
          devices.isSpuriousUpdate(
            {
              id: 'foo',
              type: 'foo',
            },
            {
              deviceId: 'foo',
              deviceType: 'foo',
            }
          ),
          true
        );
      });

      it('returns false when token has different device callback URL', () => {
        assert.strictEqual(
          devices.isSpuriousUpdate(
            {
              id: 'foo',
              pushCallback: 'foo',
            },
            {
              deviceId: 'foo',
              deviceCallbackURL: 'bar',
            }
          ),
          false
        );
      });

      it('returns true when ids and callback URLs match', () => {
        assert.strictEqual(
          devices.isSpuriousUpdate(
            {
              id: 'foo',
              pushCallback: 'foo',
            },
            {
              deviceId: 'foo',
              deviceCallbackURL: 'foo',
            }
          ),
          true
        );
      });

      it('returns false when token has different device callback public key', () => {
        assert.strictEqual(
          devices.isSpuriousUpdate(
            {
              id: 'foo',
              pushPublicKey: 'foo',
            },
            {
              deviceId: 'foo',
              deviceCallbackPublicKey: 'bar',
            }
          ),
          false
        );
      });

      it('returns true when ids and callback public keys match', () => {
        assert.strictEqual(
          devices.isSpuriousUpdate(
            {
              id: 'foo',
              pushPublicKey: 'foo',
            },
            {
              deviceId: 'foo',
              deviceCallbackPublicKey: 'foo',
            }
          ),
          true
        );
      });

      it('returns false when payload has different available commands', () => {
        assert.strictEqual(
          devices.isSpuriousUpdate(
            {
              id: 'foo',
              availableCommands: {
                foo: 'bar',
                baz: 'qux',
              },
            },
            {
              deviceId: 'foo',
              deviceAvailableCommands: {
                foo: 'bar',
              },
            }
          ),
          false
        );
      });

      it('returns false when token has different device available commands', () => {
        assert.strictEqual(
          devices.isSpuriousUpdate(
            {
              id: 'foo',
              availableCommands: {
                foo: 'bar',
              },
            },
            {
              deviceId: 'foo',
              deviceAvailableCommands: {
                foo: 'bar',
                baz: 'qux',
              },
            }
          ),
          false
        );
      });

      it('returns true when ids and available commands match', () => {
        assert.strictEqual(
          devices.isSpuriousUpdate(
            {
              id: 'foo',
              availableCommands: {
                foo: 'bar',
              },
            },
            {
              deviceId: 'foo',
              deviceAvailableCommands: {
                foo: 'bar',
              },
            }
          ),
          true
        );
      });

      it('returns true when all properties match', () => {
        assert.strictEqual(
          devices.isSpuriousUpdate(
            {
              id: 'foo',
              name: 'bar',
              type: 'baz',
              pushCallback: 'wibble',
              pushPublicKey: 'blee',
              availableCommands: {
                frop: 'punv',
                thib: 'blap',
              },
            },
            {
              deviceId: 'foo',
              deviceName: 'bar',
              deviceType: 'baz',
              deviceCallbackURL: 'wibble',
              deviceCallbackPublicKey: 'blee',
              deviceAvailableCommands: {
                frop: 'punv',
                thib: 'blap',
              },
            }
          ),
          true
        );
      });
    });

    describe('upsert:', () => {
      let request, credentials;

      beforeEach(() => {
        request = mocks.mockRequest({
          log: log,
        });
        credentials = {
          id: crypto.randomBytes(16).toString('hex'),
          uid: uuid.v4('binary').toString('hex'),
          tokenVerified: true,
        };
      });

      it('should create', () => {
        return devices.upsert(request, credentials, device).then((result) => {
          assert.deepEqual(
            result,
            {
              id: deviceId,
              name: device.name,
              type: device.type,
              createdAt: deviceCreatedAt,
            },
            'result was correct'
          );

          assert.equal(
            db.updateDevice.callCount,
            0,
            'db.updateDevice was not called'
          );

          assert.equal(
            db.createDevice.callCount,
            1,
            'db.createDevice was called once'
          );
          let args = db.createDevice.args[0];
          assert.equal(
            args.length,
            2,
            'db.createDevice was passed two arguments'
          );
          assert.deepEqual(args[0], credentials.uid, 'first argument was uid');
          assert.equal(args[1], device, 'second argument was device');

          assert.equal(
            log.activityEvent.callCount,
            1,
            'log.activityEvent was called once'
          );
          args = log.activityEvent.args[0];
          assert.equal(
            args.length,
            1,
            'log.activityEvent was passed one argument'
          );
          assert.deepEqual(
            args[0],
            {
              country: 'United States',
              event: 'device.created',
              region: 'California',
              service: undefined,
              userAgent: 'test user-agent',
              uid: credentials.uid,
              device_id: deviceId,
              is_placeholder: false,
            },
            'event data was correct'
          );

          assert.equal(
            log.notifyAttachedServices.callCount,
            1,
            'log.notifyAttachedServices was called once'
          );
          args = log.notifyAttachedServices.args[0];
          assert.equal(
            args.length,
            3,
            'log.notifyAttachedServices was passed three arguments'
          );
          assert.equal(
            args[0],
            'device:create',
            'first argument was event name'
          );
          assert.equal(args[1], request, 'second argument was request object');
          assert.deepEqual(
            args[2],
            {
              uid: credentials.uid,
              id: deviceId,
              type: device.type,
              timestamp: deviceCreatedAt,
              isPlaceholder: false,
            },
            'third argument was event data'
          );

          assert.equal(
            push.notifyDeviceConnected.callCount,
            1,
            'push.notifyDeviceConnected was called once'
          );
          args = push.notifyDeviceConnected.args[0];
          assert.equal(
            args.length,
            3,
            'push.notifyDeviceConnected was passed three arguments'
          );
          assert.equal(args[0], credentials.uid, 'first argument was uid');
          assert.ok(
            Array.isArray(args[1]),
            'second argument was devices array'
          );
          assert.equal(args[2], device.name, 'third argument was device name');
        });
      });

      it('should not call notifyDeviceConnected with unverified token', () => {
        credentials.tokenVerified = false;
        device.name = 'device with an unverified sessionToken';
        return devices.upsert(request, credentials, device).then(() => {
          assert.equal(
            push.notifyDeviceConnected.callCount,
            0,
            'push.notifyDeviceConnected was not called'
          );
          credentials.tokenVerified = true;
        });
      });

      it('should create placeholders', () => {
        delete device.name;
        return devices
          .upsert(request, credentials, { uaBrowser: 'Firefox' })
          .then((result) => {
            assert.equal(
              db.updateDevice.callCount,
              0,
              'db.updateDevice was not called'
            );
            assert.equal(
              db.createDevice.callCount,
              1,
              'db.createDevice was called once'
            );

            assert.equal(
              log.activityEvent.callCount,
              1,
              'log.activityEvent was called once'
            );
            assert.equal(
              log.activityEvent.args[0][0].is_placeholder,
              true,
              'is_placeholder was correct'
            );

            assert.equal(
              log.notifyAttachedServices.callCount,
              1,
              'log.notifyAttachedServices was called once'
            );
            assert.equal(
              log.notifyAttachedServices.args[0][2].isPlaceholder,
              true,
              'isPlaceholder was correct'
            );

            assert.equal(
              push.notifyDeviceConnected.callCount,
              1,
              'push.notifyDeviceConnected was called once'
            );
            assert.equal(
              push.notifyDeviceConnected.args[0][0],
              credentials.uid,
              'uid was correct'
            );
            assert.equal(
              push.notifyDeviceConnected.args[0][2],
              'Firefox',
              'device name was included'
            );
          });
      });

      it('should update', () => {
        const deviceInfo = {
          id: deviceId,
          name: device.name,
          type: device.type,
        };
        return devices
          .upsert(request, credentials, deviceInfo)
          .then((result) => {
            assert.equal(result, deviceInfo, 'result was correct');

            assert.equal(
              db.createDevice.callCount,
              0,
              'db.createDevice was not called'
            );

            assert.equal(
              db.updateDevice.callCount,
              1,
              'db.updateDevice was called once'
            );
            let args = db.updateDevice.args[0];
            assert.equal(
              args.length,
              2,
              'db.createDevice was passed two arguments'
            );
            assert.deepEqual(
              args[0],
              credentials.uid,
              'first argument was uid'
            );
            assert.deepEqual(
              args[1],
              {
                id: deviceId,
                name: device.name,
                type: device.type,
              },
              'device info was unmodified'
            );

            assert.equal(
              log.activityEvent.callCount,
              1,
              'log.activityEvent was called once'
            );
            args = log.activityEvent.args[0];
            assert.equal(
              args.length,
              1,
              'log.activityEvent was passed one argument'
            );
            assert.deepEqual(
              args[0],
              {
                country: 'United States',
                event: 'device.updated',
                region: 'California',
                service: undefined,
                userAgent: 'test user-agent',
                uid: credentials.uid,
                device_id: deviceId,
                is_placeholder: false,
              },
              'event data was correct'
            );

            assert.equal(
              log.notifyAttachedServices.callCount,
              0,
              'log.notifyAttachedServices was not called'
            );

            assert.equal(
              push.notifyDeviceConnected.callCount,
              0,
              'push.notifyDeviceConnected was not called'
            );
          });
      });
    });

    describe('upsert with refreshToken:', () => {
      let request, credentials;

      beforeEach(() => {
        request = mocks.mockRequest({
          log: log,
        });
        credentials = {
          refreshTokenId: crypto.randomBytes(16).toString('hex'),
          uid: uuid.v4('binary').toString('hex'),
          tokenVerified: true,
        };
      });

      it('should create', () => {
        return devices.upsert(request, credentials, device).then((result) => {
          assert.deepEqual(
            result,
            {
              id: deviceId,
              name: device.name,
              type: device.type,
              createdAt: deviceCreatedAt,
            },
            'result was correct'
          );

          assert.equal(
            db.updateDevice.callCount,
            0,
            'db.updateDevice was not called'
          );

          assert.equal(
            db.createDevice.callCount,
            1,
            'db.createDevice was called once'
          );
          let args = db.createDevice.args[0];
          assert.equal(
            args.length,
            2,
            'db.createDevice was passed two arguments'
          );
          assert.deepEqual(args[0], credentials.uid, 'first argument was uid');
          assert.equal(args[1], device, 'second argument was device');

          assert.equal(
            log.activityEvent.callCount,
            1,
            'log.activityEvent was called once'
          );
          args = log.activityEvent.args[0];
          assert.equal(
            args.length,
            1,
            'log.activityEvent was passed one argument'
          );
          assert.deepEqual(
            args[0],
            {
              country: 'United States',
              event: 'device.created',
              region: 'California',
              service: undefined,
              userAgent: 'test user-agent',
              uid: credentials.uid,
              device_id: deviceId,
              is_placeholder: false,
            },
            'event data was correct'
          );

          assert.equal(
            log.notifyAttachedServices.callCount,
            1,
            'log.notifyAttachedServices was called once'
          );
          args = log.notifyAttachedServices.args[0];
          assert.equal(
            args.length,
            3,
            'log.notifyAttachedServices was passed three arguments'
          );
          assert.equal(
            args[0],
            'device:create',
            'first argument was event name'
          );
          assert.equal(args[1], request, 'second argument was request object');
          assert.deepEqual(
            args[2],
            {
              uid: credentials.uid,
              id: deviceId,
              type: device.type,
              timestamp: deviceCreatedAt,
              isPlaceholder: false,
            },
            'third argument was event data'
          );

          assert.equal(
            push.notifyDeviceConnected.callCount,
            1,
            'push.notifyDeviceConnected was called once'
          );
          args = push.notifyDeviceConnected.args[0];
          assert.equal(
            args.length,
            3,
            'push.notifyDeviceConnected was passed three arguments'
          );
          assert.equal(args[0], credentials.uid, 'first argument was uid');
          assert.ok(
            Array.isArray(args[1]),
            'second argument was devices array'
          );
          assert.equal(args[2], device.name, 'third argument was device name');
        });
      });

      it('should create placeholders', () => {
        delete device.name;
        return devices
          .upsert(request, credentials, { uaBrowser: 'Firefox' })
          .then((result) => {
            assert.equal(
              db.updateDevice.callCount,
              0,
              'db.updateDevice was not called'
            );
            assert.equal(
              db.createDevice.callCount,
              1,
              'db.createDevice was called once'
            );

            assert.equal(
              log.activityEvent.callCount,
              1,
              'log.activityEvent was called once'
            );
            assert.equal(
              log.activityEvent.args[0][0].is_placeholder,
              true,
              'is_placeholder was correct'
            );

            assert.equal(
              log.notifyAttachedServices.callCount,
              1,
              'log.notifyAttachedServices was called once'
            );
            assert.equal(
              log.notifyAttachedServices.args[0][2].isPlaceholder,
              true,
              'isPlaceholder was correct'
            );

            assert.equal(
              push.notifyDeviceConnected.callCount,
              1,
              'push.notifyDeviceConnected was called once'
            );
            assert.equal(
              push.notifyDeviceConnected.args[0][0],
              credentials.uid,
              'uid was correct'
            );
            assert.equal(
              push.notifyDeviceConnected.args[0][2],
              'Firefox',
              'device name was included'
            );
          });
      });

      it('should update', () => {
        const deviceInfo = {
          id: deviceId,
          name: device.name,
          type: device.type,
        };
        return devices
          .upsert(request, credentials, deviceInfo)
          .then((result) => {
            assert.equal(result, deviceInfo, 'result was correct');

            assert.equal(
              db.createDevice.callCount,
              0,
              'db.createDevice was not called'
            );

            assert.equal(
              db.updateDevice.callCount,
              1,
              'db.updateDevice was called once'
            );
            let args = db.updateDevice.args[0];
            assert.equal(
              args.length,
              2,
              'db.createDevice was passed two arguments'
            );
            assert.deepEqual(
              args[0],
              credentials.uid,
              'first argument was uid'
            );
            assert.deepEqual(
              args[1],
              {
                id: deviceId,
                name: device.name,
                type: device.type,
              },
              'device info was unmodified'
            );

            assert.equal(
              log.activityEvent.callCount,
              1,
              'log.activityEvent was called once'
            );
            args = log.activityEvent.args[0];
            assert.equal(
              args.length,
              1,
              'log.activityEvent was passed one argument'
            );
            assert.deepEqual(
              args[0],
              {
                country: 'United States',
                event: 'device.updated',
                region: 'California',
                service: undefined,
                userAgent: 'test user-agent',
                uid: credentials.uid,
                device_id: deviceId,
                is_placeholder: false,
              },
              'event data was correct'
            );

            assert.equal(
              log.notifyAttachedServices.callCount,
              0,
              'log.notifyAttachedServices was not called'
            );

            assert.equal(
              push.notifyDeviceConnected.callCount,
              0,
              'push.notifyDeviceConnected was not called'
            );
          });
      });
    });

    describe('destroy:', () => {
      let request, credentials, deviceId2, sessionTokenId, refreshTokenId;

      beforeEach(() => {
        deviceId2 = crypto.randomBytes(16).toString('hex');
        sessionTokenId = crypto.randomBytes(32).toString('hex');
        refreshTokenId = crypto.randomBytes(32).toString('hex');
        credentials = {
          id: crypto.randomBytes(16).toString('hex'),
          uid: uuid.v4('binary').toString('hex'),
          tokenVerified: true,
        };
        request = mocks.mockRequest({
          log: log,
          devices: [deviceId, deviceId2],
          credentials,
        });
        db.deleteDevice = sinon.spy(async () => {
          return device;
        });
      });

      it('should destroy the device record', async () => {
        db.deleteDevice = sinon.spy(async () => {
          return { sessionTokenId, refreshTokenId: null };
        });
        device.sessionTokenId = sessionTokenId;

        const result = await devices.destroy(request, deviceId);
        assert.equal(result.sessionTokenId, sessionTokenId);
        assert.equal(result.refreshTokenId, null);

        assert.equal(db.deleteDevice.callCount, 1);
        assert.ok(db.deleteDevice.calledBefore(push.notifyDeviceDisconnected));
        assert.equal(push.notifyDeviceDisconnected.callCount, 1);
        assert.equal(
          push.notifyDeviceDisconnected.firstCall.args[0],
          request.auth.credentials.uid
        );
        assert.deepEqual(push.notifyDeviceDisconnected.firstCall.args[1], [
          deviceId,
          deviceId2,
        ]);
        assert.equal(push.notifyDeviceDisconnected.firstCall.args[2], deviceId);

        assert.equal(oauthdb.revokeRefreshTokenById.callCount, 0);

        assert.equal(
          log.activityEvent.callCount,
          1,
          'log.activityEvent was called once'
        );
        let args = log.activityEvent.args[0];
        assert.equal(
          args.length,
          1,
          'log.activityEvent was passed one argument'
        );
        assert.deepEqual(
          args[0],
          {
            country: 'United States',
            event: 'device.deleted',
            region: 'California',
            service: undefined,
            userAgent: 'test user-agent',
            uid: request.auth.credentials.uid,
            device_id: deviceId,
          },
          'event data was correct'
        );

        assert.equal(log.notifyAttachedServices.callCount, 1);
        args = log.notifyAttachedServices.args[0];
        assert.equal(args.length, 3);
        assert.equal(args[0], 'device:delete');
        assert.equal(args[1], request);
        const details = args[2];
        assert.equal(details.uid, request.auth.credentials.uid);
        assert.equal(details.id, deviceId);
        assert.isBelow(Date.now() - details.timestamp, 100);
      });

      it('should revoke the refreshToken if present', async () => {
        oauthdb.revokeRefreshTokenById = sinon.spy(async () => {
          return {};
        });
        device.refreshTokenId = refreshTokenId;

        const result = await devices.destroy(request, deviceId);
        assert.equal(result.sessionTokenId, null);
        assert.equal(result.refreshTokenId, refreshTokenId);

        assert.equal(db.deleteDevice.callCount, 1);
        assert.ok(
          oauthdb.revokeRefreshTokenById.calledOnceWith(refreshTokenId)
        );
        assert.equal(log.error.callCount, 0);
        assert.equal(log.notifyAttachedServices.callCount, 1);
      });

      it('should ignore missing tokens when deleting the refreshToken', async () => {
        oauthdb.revokeRefreshTokenById = sinon.spy(async () => {
          throw error.invalidToken();
        });
        device.refreshTokenId = refreshTokenId;

        const result = await devices.destroy(request, deviceId);
        assert.equal(result.sessionTokenId, null);
        assert.equal(result.refreshTokenId, refreshTokenId);

        assert.equal(db.deleteDevice.callCount, 1);
        assert.ok(
          oauthdb.revokeRefreshTokenById.calledOnceWith(refreshTokenId)
        );
        assert.equal(log.error.callCount, 0);
        assert.equal(log.notifyAttachedServices.callCount, 1);
      });

      it('should log other errors when deleting the refreshToken, without failing', async () => {
        oauthdb.revokeRefreshTokenById = sinon.spy(async () => {
          throw error.unexpectedError();
        });
        device.refreshTokenId = refreshTokenId;

        const result = await devices.destroy(request, deviceId);
        assert.equal(result.sessionTokenId, null);
        assert.equal(result.refreshTokenId, refreshTokenId);

        assert.equal(db.deleteDevice.callCount, 1);
        assert.ok(
          oauthdb.revokeRefreshTokenById.calledOnceWith(refreshTokenId)
        );
        assert.equal(log.notifyAttachedServices.callCount, 1);
        assert.isTrue(
          log.error.calledOnceWith('deviceDestroy.revokeRefreshTokenById.error')
        );
      });
    });

    it('should synthesizeName', () => {
      assert.equal(
        devices.synthesizeName({
          uaBrowser: 'foo',
          uaBrowserVersion: 'bar.bar',
          uaOS: 'baz',
          uaOSVersion: 'qux',
          uaFormFactor: 'wibble',
        }),
        'foo bar, wibble',
        'result is correct when all ua properties are set'
      );

      assert.equal(
        devices.synthesizeName({
          uaBrowserVersion: 'foo.foo',
          uaOS: 'bar',
          uaOSVersion: 'baz',
          uaFormFactor: 'wibble',
        }),
        'wibble',
        'result is correct when uaBrowser property is missing'
      );

      assert.equal(
        devices.synthesizeName({
          uaBrowser: 'foo',
          uaOS: 'bar',
          uaOSVersion: 'baz',
          uaFormFactor: 'wibble',
        }),
        'foo, wibble',
        'result is correct when uaBrowserVersion property is missing'
      );

      assert.equal(
        devices.synthesizeName({
          uaBrowser: 'foo',
          uaBrowserVersion: 'bar.bar',
          uaOSVersion: 'baz',
          uaFormFactor: 'wibble',
        }),
        'foo bar, wibble',
        'result is correct when uaOS property is missing'
      );

      assert.equal(
        devices.synthesizeName({
          uaBrowser: 'foo',
          uaBrowserVersion: 'bar.bar',
          uaOS: 'baz',
          uaFormFactor: 'wibble',
        }),
        'foo bar, wibble',
        'result is correct when uaOSVersion property is missing'
      );

      assert.equal(
        devices.synthesizeName({
          uaBrowser: 'foo',
          uaBrowserVersion: 'bar.bar',
          uaOS: 'baz',
          uaOSVersion: 'qux',
        }),
        'foo bar, baz qux',
        'result is correct when uaFormFactor property is missing'
      );

      assert.equal(
        devices.synthesizeName({
          uaOS: 'bar',
          uaFormFactor: 'wibble',
        }),
        'wibble',
        'result is correct when uaBrowser and uaBrowserVersion properties are missing'
      );

      assert.equal(
        devices.synthesizeName({
          uaBrowser: 'wibble',
          uaBrowserVersion: 'blee.blee',
          uaOSVersion: 'qux',
        }),
        'wibble blee',
        'result is correct when uaOS and uaFormFactor properties are missing'
      );

      assert.equal(
        devices.synthesizeName({
          uaBrowser: 'foo',
          uaBrowserVersion: 'bar.bar',
          uaOS: 'baz',
        }),
        'foo bar, baz',
        'result is correct when uaOSVersion and uaFormFactor properties are missing'
      );

      assert.equal(
        devices.synthesizeName({
          uaOS: 'foo',
        }),
        'foo',
        'result is correct when only uaOS property is present'
      );

      assert.equal(
        devices.synthesizeName({
          uaFormFactor: 'bar',
        }),
        'bar',
        'result is correct when only uaFormFactor property is present'
      );

      assert.equal(
        devices.synthesizeName({
          uaOS: 'foo',
          uaOSVersion: 'bar',
        }),
        'foo bar',
        'result is correct when only uaOS and uaOSVersion properties are present'
      );

      assert.equal(
        devices.synthesizeName({
          uaOSVersion: 'foo',
        }),
        '',
        'result defaults to the empty string'
      );
    });
  });
});
