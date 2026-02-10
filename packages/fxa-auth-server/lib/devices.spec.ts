/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export {};

import sinon from 'sinon';

const crypto = require('crypto');
const mocks = require('../test/mocks');
const { AppError: error } = require('@fxa/accounts/errors');
const uuid = require('uuid');

jest.mock('./oauth/db', () => ({
  getRefreshToken: jest.fn(),
  removeRefreshToken: jest.fn(),
}));

const oauthDB = require('./oauth/db');
const devicesModule = require('./devices');

interface DestroyResult {
  sessionTokenId: string | null;
  refreshTokenId: string | null;
}

interface DevicesModule {
  isSpuriousUpdate(
    payload: Record<string, unknown>,
    token: Record<string, unknown>
  ): boolean;
  upsert(
    request: unknown,
    credentials: unknown,
    device: unknown
  ): Promise<Record<string, unknown>>;
  destroy(request: unknown, deviceId: string): Promise<DestroyResult>;
  synthesizeName(info: Record<string, string | undefined>): string;
}

describe('lib/devices:', () => {
  describe('instantiate:', () => {
    let log: ReturnType<typeof mocks.mockLog>,
      deviceCreatedAt: number,
      deviceId: string,
      device: Record<string, unknown>,
      db: ReturnType<typeof mocks.mockDB>,
      push: ReturnType<typeof mocks.mockPush>,
      devices: DevicesModule,
      pushbox: ReturnType<typeof mocks.mockPushbox>;

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
      push = mocks.mockPush();
      pushbox = mocks.mockPushbox();
      oauthDB.getRefreshToken.mockReset();
      oauthDB.removeRefreshToken.mockReset();
      devices = devicesModule(log, db, push, pushbox);
    });

    it('returns the expected interface', () => {
      expect(typeof devices).toBe('object');
      expect(Object.keys(devices).length).toBe(4);

      expect(typeof devices.isSpuriousUpdate).toBe('function');
      expect(devices.isSpuriousUpdate.length).toBe(2);

      expect(typeof devices.upsert).toBe('function');
      expect(devices.upsert.length).toBe(3);

      expect(typeof devices.destroy).toBe('function');
      expect(devices.destroy.length).toBe(2);

      expect(typeof devices.synthesizeName).toBe('function');
      expect(devices.synthesizeName.length).toBe(1);
    });

    describe('isSpuriousUpdate:', () => {
      it('returns false when token has no device record', () => {
        expect(devices.isSpuriousUpdate({}, {})).toBe(false);
      });

      it('returns false when token has different device id', () => {
        expect(
          devices.isSpuriousUpdate(
            { id: 'foo' },
            { deviceId: 'bar' }
          )
        ).toBe(false);
      });

      it('returns true when ids match', () => {
        expect(
          devices.isSpuriousUpdate(
            { id: 'foo' },
            { deviceId: 'foo' }
          )
        ).toBe(true);
      });

      it('returns false when token has different device name', () => {
        expect(
          devices.isSpuriousUpdate(
            { id: 'foo', name: 'foo' },
            { deviceId: 'foo', deviceName: 'bar' }
          )
        ).toBe(false);
      });

      it('returns true when ids and names match', () => {
        expect(
          devices.isSpuriousUpdate(
            { id: 'foo', name: 'foo' },
            { deviceId: 'foo', deviceName: 'foo' }
          )
        ).toBe(true);
      });

      it('returns false when token has different device type', () => {
        expect(
          devices.isSpuriousUpdate(
            { id: 'foo', type: 'foo' },
            { deviceId: 'foo', deviceType: 'bar' }
          )
        ).toBe(false);
      });

      it('returns true when ids and types match', () => {
        expect(
          devices.isSpuriousUpdate(
            { id: 'foo', type: 'foo' },
            { deviceId: 'foo', deviceType: 'foo' }
          )
        ).toBe(true);
      });

      it('returns false when token has different device callback URL', () => {
        expect(
          devices.isSpuriousUpdate(
            { id: 'foo', pushCallback: 'foo' },
            { deviceId: 'foo', deviceCallbackURL: 'bar' }
          )
        ).toBe(false);
      });

      it('returns true when ids and callback URLs match', () => {
        expect(
          devices.isSpuriousUpdate(
            { id: 'foo', pushCallback: 'foo' },
            { deviceId: 'foo', deviceCallbackURL: 'foo' }
          )
        ).toBe(true);
      });

      it('returns false when token has different device callback public key', () => {
        expect(
          devices.isSpuriousUpdate(
            { id: 'foo', pushPublicKey: 'foo' },
            { deviceId: 'foo', deviceCallbackPublicKey: 'bar' }
          )
        ).toBe(false);
      });

      it('returns true when ids and callback public keys match', () => {
        expect(
          devices.isSpuriousUpdate(
            { id: 'foo', pushPublicKey: 'foo' },
            { deviceId: 'foo', deviceCallbackPublicKey: 'foo' }
          )
        ).toBe(true);
      });

      it('returns false when payload has different available commands', () => {
        expect(
          devices.isSpuriousUpdate(
            {
              id: 'foo',
              availableCommands: { foo: 'bar', baz: 'qux' },
            },
            {
              deviceId: 'foo',
              deviceAvailableCommands: { foo: 'bar' },
            }
          )
        ).toBe(false);
      });

      it('returns false when token has different device available commands', () => {
        expect(
          devices.isSpuriousUpdate(
            {
              id: 'foo',
              availableCommands: { foo: 'bar' },
            },
            {
              deviceId: 'foo',
              deviceAvailableCommands: { foo: 'bar', baz: 'qux' },
            }
          )
        ).toBe(false);
      });

      it('returns true when ids and available commands match', () => {
        expect(
          devices.isSpuriousUpdate(
            {
              id: 'foo',
              availableCommands: { foo: 'bar' },
            },
            {
              deviceId: 'foo',
              deviceAvailableCommands: { foo: 'bar' },
            }
          )
        ).toBe(true);
      });

      it('returns true when all properties match', () => {
        expect(
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
          )
        ).toBe(true);
      });
    });

    describe('upsert:', () => {
      let request: ReturnType<typeof mocks.mockRequest>;
      let credentials: { id: string; uid: string; tokenVerified: boolean };

      beforeEach(() => {
        request = mocks.mockRequest({
          log: log,
        });
        credentials = {
          id: crypto.randomBytes(16).toString('hex'),
          uid: uuid.v4({}, Buffer.alloc(16)).toString('hex'),
          tokenVerified: true,
        };
      });

      it('should create', () => {
        return devices.upsert(request, credentials, device).then((result) => {
          expect(result).toEqual({
            id: deviceId,
            name: device.name,
            type: device.type,
            createdAt: deviceCreatedAt,
          });

          expect(db.updateDevice.callCount).toBe(0);

          expect(db.createDevice.callCount).toBe(1);
          let args = db.createDevice.args[0];
          expect(args.length).toBe(2);
          expect(args[0]).toEqual(credentials.uid);
          expect(args[1]).toBe(device);

          expect(log.activityEvent.callCount).toBe(1);
          args = log.activityEvent.args[0];
          expect(args.length).toBe(1);
          expect(args[0]).toEqual({
            country: 'United States',
            event: 'device.created',
            region: 'California',
            service: undefined,
            userAgent: 'test user-agent',
            sigsciRequestId: 'test-sigsci-id',
            clientJa4: 'test-ja4',
            uid: credentials.uid,
            device_id: deviceId,
            is_placeholder: false,
          });

          expect(log.notifyAttachedServices.callCount).toBe(1);
          args = log.notifyAttachedServices.args[0];
          expect(args.length).toBe(3);
          expect(args[0]).toBe('device:create');
          expect(args[1]).toBe(request);
          expect(args[2]).toEqual({
            uid: credentials.uid,
            id: deviceId,
            type: device.type,
            timestamp: deviceCreatedAt,
            isPlaceholder: false,
          });

          expect(push.notifyDeviceConnected.callCount).toBe(1);
          args = push.notifyDeviceConnected.args[0];
          expect(args.length).toBe(3);
          expect(args[0]).toBe(credentials.uid);
          expect(Array.isArray(args[1])).toBeTruthy();
          expect(args[2]).toBe(device.name);
        });
      });

      it('should not call notifyDeviceConnected with unverified token', () => {
        credentials.tokenVerified = false;
        device.name = 'device with an unverified sessionToken';
        return devices.upsert(request, credentials, device).then(() => {
          expect(push.notifyDeviceConnected.callCount).toBe(0);
          credentials.tokenVerified = true;
        });
      });

      it('should create placeholders', () => {
        delete device.name;
        return devices
          .upsert(request, credentials, { uaBrowser: 'Firefox' })
          .then(() => {
            expect(db.updateDevice.callCount).toBe(0);
            expect(db.createDevice.callCount).toBe(1);

            expect(log.activityEvent.callCount).toBe(1);
            expect(log.activityEvent.args[0][0].is_placeholder).toBe(true);

            expect(log.notifyAttachedServices.callCount).toBe(1);
            expect(log.notifyAttachedServices.args[0][2].isPlaceholder).toBe(true);

            expect(push.notifyDeviceConnected.callCount).toBe(1);
            expect(push.notifyDeviceConnected.args[0][0]).toBe(credentials.uid);
            expect(push.notifyDeviceConnected.args[0][2]).toBe('Firefox');
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
            expect(result).toBe(deviceInfo);

            expect(db.createDevice.callCount).toBe(0);

            expect(db.updateDevice.callCount).toBe(1);
            let args = db.updateDevice.args[0];
            expect(args.length).toBe(2);
            expect(args[0]).toEqual(credentials.uid);
            expect(args[1]).toEqual({
              id: deviceId,
              name: device.name,
              type: device.type,
            });

            expect(log.activityEvent.callCount).toBe(1);
            args = log.activityEvent.args[0];
            expect(args.length).toBe(1);
            expect(args[0]).toEqual({
              country: 'United States',
              event: 'device.updated',
              region: 'California',
              service: undefined,
              userAgent: 'test user-agent',
              sigsciRequestId: 'test-sigsci-id',
              clientJa4: 'test-ja4',
              uid: credentials.uid,
              device_id: deviceId,
              is_placeholder: false,
            });

            expect(log.notifyAttachedServices.callCount).toBe(0);
            expect(push.notifyDeviceConnected.callCount).toBe(0);
          });
      });
    });

    describe('upsert with refreshToken:', () => {
      let request: ReturnType<typeof mocks.mockRequest>;
      let credentials: { refreshTokenId: string; uid: string; tokenVerified: boolean };

      beforeEach(() => {
        request = mocks.mockRequest({
          log: log,
        });
        credentials = {
          refreshTokenId: crypto.randomBytes(16).toString('hex'),
          uid: uuid.v4({}, Buffer.alloc(16)).toString('hex'),
          tokenVerified: true,
        };
      });

      it('should create', () => {
        return devices.upsert(request, credentials, device).then((result) => {
          expect(result).toEqual({
            id: deviceId,
            name: device.name,
            type: device.type,
            createdAt: deviceCreatedAt,
          });

          expect(db.updateDevice.callCount).toBe(0);

          expect(db.createDevice.callCount).toBe(1);
          let args = db.createDevice.args[0];
          expect(args.length).toBe(2);
          expect(args[0]).toEqual(credentials.uid);
          expect(args[1]).toBe(device);

          expect(log.activityEvent.callCount).toBe(1);
          args = log.activityEvent.args[0];
          expect(args.length).toBe(1);
          expect(args[0]).toEqual({
            country: 'United States',
            event: 'device.created',
            region: 'California',
            service: undefined,
            userAgent: 'test user-agent',
            sigsciRequestId: 'test-sigsci-id',
            clientJa4: 'test-ja4',
            uid: credentials.uid,
            device_id: deviceId,
            is_placeholder: false,
          });

          expect(log.notifyAttachedServices.callCount).toBe(1);
          args = log.notifyAttachedServices.args[0];
          expect(args.length).toBe(3);
          expect(args[0]).toBe('device:create');
          expect(args[1]).toBe(request);
          expect(args[2]).toEqual({
            uid: credentials.uid,
            id: deviceId,
            type: device.type,
            timestamp: deviceCreatedAt,
            isPlaceholder: false,
          });

          expect(push.notifyDeviceConnected.callCount).toBe(1);
          args = push.notifyDeviceConnected.args[0];
          expect(args.length).toBe(3);
          expect(args[0]).toBe(credentials.uid);
          expect(Array.isArray(args[1])).toBeTruthy();
          expect(args[2]).toBe(device.name);
        });
      });

      it('should create placeholders', () => {
        delete device.name;
        return devices
          .upsert(request, credentials, { uaBrowser: 'Firefox' })
          .then(() => {
            expect(db.updateDevice.callCount).toBe(0);
            expect(db.createDevice.callCount).toBe(1);

            expect(log.activityEvent.callCount).toBe(1);
            expect(log.activityEvent.args[0][0].is_placeholder).toBe(true);

            expect(log.notifyAttachedServices.callCount).toBe(1);
            expect(log.notifyAttachedServices.args[0][2].isPlaceholder).toBe(true);

            expect(push.notifyDeviceConnected.callCount).toBe(1);
            expect(push.notifyDeviceConnected.args[0][0]).toBe(credentials.uid);
            expect(push.notifyDeviceConnected.args[0][2]).toBe('Firefox');
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
            expect(result).toBe(deviceInfo);

            expect(db.createDevice.callCount).toBe(0);

            expect(db.updateDevice.callCount).toBe(1);
            let args = db.updateDevice.args[0];
            expect(args.length).toBe(2);
            expect(args[0]).toEqual(credentials.uid);
            expect(args[1]).toEqual({
              id: deviceId,
              name: device.name,
              type: device.type,
            });

            expect(log.activityEvent.callCount).toBe(1);
            args = log.activityEvent.args[0];
            expect(args.length).toBe(1);
            expect(args[0]).toEqual({
              country: 'United States',
              event: 'device.updated',
              region: 'California',
              service: undefined,
              userAgent: 'test user-agent',
              sigsciRequestId: 'test-sigsci-id',
              clientJa4: 'test-ja4',
              uid: credentials.uid,
              device_id: deviceId,
              is_placeholder: false,
            });

            expect(log.notifyAttachedServices.callCount).toBe(0);
            expect(push.notifyDeviceConnected.callCount).toBe(0);
          });
      });
    });

    describe('destroy:', () => {
      let request: ReturnType<typeof mocks.mockRequest>,
        credentials: { id: string; uid: string; tokenVerified: boolean },
        deviceId2: string,
        sessionTokenId: string,
        refreshTokenId: string;

      beforeEach(() => {
        deviceId2 = crypto.randomBytes(16).toString('hex');
        sessionTokenId = crypto.randomBytes(32).toString('hex');
        refreshTokenId = crypto.randomBytes(32).toString('hex');
        credentials = {
          id: crypto.randomBytes(16).toString('hex'),
          uid: uuid.v4({}, Buffer.alloc(16)).toString('hex'),
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
        expect(result.sessionTokenId).toBe(sessionTokenId);
        expect(result.refreshTokenId).toBeNull();

        expect(db.deleteDevice.callCount).toBe(1);
        expect(
          db.deleteDevice.calledBefore(push.notifyDeviceDisconnected)
        ).toBeTruthy();
        expect(pushbox.deleteDevice.callCount).toBe(1);
        expect(pushbox.deleteDevice.firstCall.args).toEqual([
          request.auth.credentials.uid,
          deviceId,
        ]);
        expect(push.notifyDeviceDisconnected.callCount).toBe(1);
        expect(push.notifyDeviceDisconnected.firstCall.args[0]).toBe(
          request.auth.credentials.uid
        );
        expect(push.notifyDeviceDisconnected.firstCall.args[1]).toEqual([
          deviceId,
          deviceId2,
        ]);
        expect(push.notifyDeviceDisconnected.firstCall.args[2]).toBe(deviceId);

        expect(oauthDB.removeRefreshToken).not.toHaveBeenCalled();

        expect(log.activityEvent.callCount).toBe(1);
        let args = log.activityEvent.args[0];
        expect(args.length).toBe(1);
        expect(args[0]).toEqual({
          country: 'United States',
          event: 'device.deleted',
          region: 'California',
          service: undefined,
          userAgent: 'test user-agent',
          sigsciRequestId: 'test-sigsci-id',
          clientJa4: 'test-ja4',
          uid: request.auth.credentials.uid,
          device_id: deviceId,
        });

        expect(log.notifyAttachedServices.callCount).toBe(1);
        args = log.notifyAttachedServices.args[0];
        expect(args.length).toBe(3);
        expect(args[0]).toBe('device:delete');
        expect(args[1]).toBe(request);
        const details = args[2];
        expect(details.uid).toBe(request.auth.credentials.uid);
        expect(details.id).toBe(deviceId);
        expect(Date.now() - details.timestamp).toBeLessThan(100);
      });

      it('should revoke the refreshToken if present', async () => {
        oauthDB.removeRefreshToken.mockResolvedValue({});
        device.refreshTokenId = refreshTokenId;

        const result = await devices.destroy(request, deviceId);
        expect(result.sessionTokenId).toBeFalsy();
        expect(result.refreshTokenId).toBe(refreshTokenId);

        expect(db.deleteDevice.callCount).toBe(1);
        expect(oauthDB.getRefreshToken).toHaveBeenCalledWith(refreshTokenId);
        expect(log.error.callCount).toBe(0);
        expect(log.notifyAttachedServices.callCount).toBe(1);
      });

      it('should ignore missing tokens when deleting the refreshToken', async () => {
        oauthDB.removeRefreshToken.mockRejectedValue(error.invalidToken());
        device.refreshTokenId = refreshTokenId;

        const result = await devices.destroy(request, deviceId);
        expect(result.sessionTokenId).toBeFalsy();
        expect(result.refreshTokenId).toBe(refreshTokenId);

        expect(db.deleteDevice.callCount).toBe(1);
        expect(oauthDB.getRefreshToken).toHaveBeenCalledWith(refreshTokenId);
        expect(log.error.callCount).toBe(0);
        expect(log.notifyAttachedServices.callCount).toBe(1);
      });

      it('should log other errors when deleting the refreshToken, without failing', async () => {
        oauthDB.removeRefreshToken.mockRejectedValue(error.unexpectedError());
        device.refreshTokenId = refreshTokenId;

        const result = await devices.destroy(request, deviceId);
        expect(result.sessionTokenId).toBeFalsy();
        expect(result.refreshTokenId).toBe(refreshTokenId);

        expect(db.deleteDevice.callCount).toBe(1);
        expect(oauthDB.getRefreshToken).toHaveBeenCalledWith(refreshTokenId);
        expect(log.notifyAttachedServices.callCount).toBe(1);
        expect(
          log.error.calledOnceWith('deviceDestroy.revokeRefreshTokenById.error')
        ).toBe(true);
      });
    });

    it('should synthesizeName', () => {
      expect(
        devices.synthesizeName({
          uaBrowser: 'foo',
          uaBrowserVersion: 'bar.bar',
          uaOS: 'baz',
          uaOSVersion: 'qux',
          uaFormFactor: 'wibble',
        })
      ).toBe('foo bar, wibble');

      expect(
        devices.synthesizeName({
          uaBrowserVersion: 'foo.foo',
          uaOS: 'bar',
          uaOSVersion: 'baz',
          uaFormFactor: 'wibble',
        })
      ).toBe('wibble');

      expect(
        devices.synthesizeName({
          uaBrowser: 'foo',
          uaOS: 'bar',
          uaOSVersion: 'baz',
          uaFormFactor: 'wibble',
        })
      ).toBe('foo, wibble');

      expect(
        devices.synthesizeName({
          uaBrowser: 'foo',
          uaBrowserVersion: 'bar.bar',
          uaOSVersion: 'baz',
          uaFormFactor: 'wibble',
        })
      ).toBe('foo bar, wibble');

      expect(
        devices.synthesizeName({
          uaBrowser: 'foo',
          uaBrowserVersion: 'bar.bar',
          uaOS: 'baz',
          uaFormFactor: 'wibble',
        })
      ).toBe('foo bar, wibble');

      expect(
        devices.synthesizeName({
          uaBrowser: 'foo',
          uaBrowserVersion: 'bar.bar',
          uaOS: 'baz',
          uaOSVersion: 'qux',
        })
      ).toBe('foo bar, baz qux');

      expect(
        devices.synthesizeName({
          uaOS: 'bar',
          uaFormFactor: 'wibble',
        })
      ).toBe('wibble');

      expect(
        devices.synthesizeName({
          uaBrowser: 'wibble',
          uaBrowserVersion: 'blee.blee',
          uaOSVersion: 'qux',
        })
      ).toBe('wibble blee');

      expect(
        devices.synthesizeName({
          uaBrowser: 'foo',
          uaBrowserVersion: 'bar.bar',
          uaOS: 'baz',
        })
      ).toBe('foo bar, baz');

      expect(
        devices.synthesizeName({
          uaOS: 'foo',
        })
      ).toBe('foo');

      expect(
        devices.synthesizeName({
          uaFormFactor: 'bar',
        })
      ).toBe('bar');

      expect(
        devices.synthesizeName({
          uaOS: 'foo',
          uaOSVersion: 'bar',
        })
      ).toBe('foo bar');

      expect(
        devices.synthesizeName({
          uaOSVersion: 'foo',
        })
      ).toBe('');
    });
  });
});
