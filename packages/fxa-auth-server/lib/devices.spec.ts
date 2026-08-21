/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createMock } from '@golevelup/ts-jest';
import { AuthLogger } from './types';

const crypto = require('crypto');
const mocks = require('../test/mocks');
const { AppError: error } = require('@fxa/accounts/errors');
const ScopeSet = require('fxa-shared/oauth/scopes').default;
const { OAuthNativeClients } = require('@fxa/accounts/oauth');

const FENIX = OAuthNativeClients.Fenix;

jest.mock('./oauth/db', () => ({
  getRefreshToken: jest.fn(),
  removeRefreshToken: jest.fn(),
  listAccountConsentsByUid: jest.fn(),
  getRefreshTokenScopesByUid: jest.fn(),
  getPeerClientsForService: jest.fn(),
  deleteAccountConsentRows: jest.fn(),
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
    let log: AuthLogger,
      deviceCreatedAt: number,
      deviceId: string,
      device: Record<string, unknown>,
      db: ReturnType<typeof mocks.mockDB>,
      push: ReturnType<typeof mocks.mockPush>,
      devices: DevicesModule,
      glean: ReturnType<typeof mocks.mockGlean>,
      statsd: { increment: jest.Mock },
      pushbox: ReturnType<typeof mocks.mockPushbox>;

    beforeEach(() => {
      log = createMock<AuthLogger>();
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
      glean = mocks.mockGlean();
      oauthDB.getRefreshToken.mockReset();
      oauthDB.removeRefreshToken.mockReset();
      oauthDB.listAccountConsentsByUid.mockReset();
      oauthDB.listAccountConsentsByUid.mockResolvedValue([]);
      oauthDB.getRefreshTokenScopesByUid.mockReset();
      oauthDB.getRefreshTokenScopesByUid.mockResolvedValue([]);
      oauthDB.getPeerClientsForService.mockReset();
      oauthDB.getPeerClientsForService.mockReturnValue(undefined);
      oauthDB.deleteAccountConsentRows.mockReset();
      oauthDB.deleteAccountConsentRows.mockResolvedValue(0);
      statsd = { increment: jest.fn() };
      devices = devicesModule(log, db, push, pushbox, glean, statsd);
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
          devices.isSpuriousUpdate({ id: 'foo' }, { deviceId: 'bar' })
        ).toBe(false);
      });

      it('returns true when ids match', () => {
        expect(
          devices.isSpuriousUpdate({ id: 'foo' }, { deviceId: 'foo' })
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
          uid: crypto.randomBytes(16).toString('hex'),
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

          expect(db.updateDevice).toHaveBeenCalledTimes(0);

          expect(db.createDevice).toHaveBeenCalledTimes(1);
          expect(db.createDevice).toHaveBeenCalledWith(credentials.uid, device);

          expect(log.activityEvent).toHaveBeenCalledTimes(1);
          expect(log.activityEvent).toHaveBeenCalledWith({
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

          expect(log.notifyAttachedServices).toHaveBeenCalledTimes(1);
          expect(log.notifyAttachedServices).toHaveBeenCalledWith(
            'device:create',
            request,
            {
              uid: credentials.uid,
              id: deviceId,
              type: device.type,
              timestamp: deviceCreatedAt,
              isPlaceholder: false,
            }
          );

          expect(push.notifyDeviceConnected).toHaveBeenCalledTimes(1);
          expect(push.notifyDeviceConnected).toHaveBeenCalledWith(
            credentials.uid,
            expect.any(Array),
            device.name
          );
        });
      });

      it('should not call notifyDeviceConnected with unverified token', () => {
        credentials.tokenVerified = false;
        device.name = 'device with an unverified sessionToken';
        return devices.upsert(request, credentials, device).then(() => {
          expect(push.notifyDeviceConnected).toHaveBeenCalledTimes(0);
          credentials.tokenVerified = true;
        });
      });

      it('should create placeholders', () => {
        delete device.name;
        return devices
          .upsert(request, credentials, { uaBrowser: 'Firefox' })
          .then(() => {
            expect(db.updateDevice).toHaveBeenCalledTimes(0);
            expect(db.createDevice).toHaveBeenCalledTimes(1);

            expect(log.activityEvent).toHaveBeenCalledTimes(1);
            expect(log.activityEvent).toHaveBeenCalledWith(
              expect.objectContaining({ is_placeholder: true })
            );

            expect(log.notifyAttachedServices).toHaveBeenCalledTimes(1);
            expect(log.notifyAttachedServices).toHaveBeenCalledWith(
              expect.anything(),
              expect.anything(),
              expect.objectContaining({ isPlaceholder: true })
            );

            expect(push.notifyDeviceConnected).toHaveBeenCalledTimes(1);
            expect(push.notifyDeviceConnected).toHaveBeenCalledWith(
              credentials.uid,
              expect.anything(),
              'Firefox'
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
            expect(result).toBe(deviceInfo);

            expect(db.createDevice).toHaveBeenCalledTimes(0);

            expect(db.updateDevice).toHaveBeenCalledTimes(1);
            expect(db.updateDevice).toHaveBeenCalledWith(credentials.uid, {
              id: deviceId,
              name: device.name,
              type: device.type,
            });

            expect(log.activityEvent).toHaveBeenCalledTimes(1);
            expect(log.activityEvent).toHaveBeenCalledWith({
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

            expect(log.notifyAttachedServices).toHaveBeenCalledTimes(0);
            expect(push.notifyDeviceConnected).toHaveBeenCalledTimes(0);
          });
      });
    });

    describe('upsert with refreshToken:', () => {
      let request: ReturnType<typeof mocks.mockRequest>;
      let credentials: {
        refreshTokenId: string;
        uid: string;
        tokenVerified: boolean;
      };

      beforeEach(() => {
        request = mocks.mockRequest({
          log: log,
        });
        credentials = {
          refreshTokenId: crypto.randomBytes(16).toString('hex'),
          uid: crypto.randomBytes(16).toString('hex'),
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

          expect(db.updateDevice).toHaveBeenCalledTimes(0);

          expect(db.createDevice).toHaveBeenCalledTimes(1);
          expect(db.createDevice).toHaveBeenCalledWith(credentials.uid, device);

          expect(log.activityEvent).toHaveBeenCalledTimes(1);
          expect(log.activityEvent).toHaveBeenCalledWith({
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

          expect(log.notifyAttachedServices).toHaveBeenCalledTimes(1);
          expect(log.notifyAttachedServices).toHaveBeenCalledWith(
            'device:create',
            request,
            {
              uid: credentials.uid,
              id: deviceId,
              type: device.type,
              timestamp: deviceCreatedAt,
              isPlaceholder: false,
            }
          );

          expect(push.notifyDeviceConnected).toHaveBeenCalledTimes(1);
          expect(push.notifyDeviceConnected).toHaveBeenCalledWith(
            credentials.uid,
            expect.any(Array),
            device.name
          );
        });
      });

      it('should create placeholders', () => {
        delete device.name;
        return devices
          .upsert(request, credentials, { uaBrowser: 'Firefox' })
          .then(() => {
            expect(db.updateDevice).toHaveBeenCalledTimes(0);
            expect(db.createDevice).toHaveBeenCalledTimes(1);

            expect(log.activityEvent).toHaveBeenCalledTimes(1);
            expect(log.activityEvent).toHaveBeenCalledWith(
              expect.objectContaining({ is_placeholder: true })
            );

            expect(log.notifyAttachedServices).toHaveBeenCalledTimes(1);
            expect(log.notifyAttachedServices).toHaveBeenCalledWith(
              expect.anything(),
              expect.anything(),
              expect.objectContaining({ isPlaceholder: true })
            );

            expect(push.notifyDeviceConnected).toHaveBeenCalledTimes(1);
            expect(push.notifyDeviceConnected).toHaveBeenCalledWith(
              credentials.uid,
              expect.anything(),
              'Firefox'
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
            expect(result).toBe(deviceInfo);

            expect(db.createDevice).toHaveBeenCalledTimes(0);

            expect(db.updateDevice).toHaveBeenCalledTimes(1);
            expect(db.updateDevice).toHaveBeenCalledWith(credentials.uid, {
              id: deviceId,
              name: device.name,
              type: device.type,
            });

            expect(log.activityEvent).toHaveBeenCalledTimes(1);
            expect(log.activityEvent).toHaveBeenCalledWith({
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

            expect(log.notifyAttachedServices).toHaveBeenCalledTimes(0);
            expect(push.notifyDeviceConnected).toHaveBeenCalledTimes(0);
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
          uid: crypto.randomBytes(16).toString('hex'),
          tokenVerified: true,
        };
        request = mocks.mockRequest({
          log: log,
          devices: [deviceId, deviceId2],
          credentials,
        });
        db.deleteDevice = jest.fn(async () => {
          return device;
        });
      });

      it('should destroy the device record', async () => {
        db.deleteDevice = jest.fn(async () => {
          return { sessionTokenId, refreshTokenId: null };
        });
        device.sessionTokenId = sessionTokenId;

        const result = await devices.destroy(request, deviceId);
        expect(result.sessionTokenId).toBe(sessionTokenId);
        expect(result.refreshTokenId).toBeNull();

        expect(db.deleteDevice).toHaveBeenCalledTimes(1);
        expect(pushbox.deleteDevice).toHaveBeenCalledTimes(1);
        expect(pushbox.deleteDevice).toHaveBeenCalledWith(
          request.auth.credentials.uid,
          deviceId
        );
        expect(push.notifyDeviceDisconnected).toHaveBeenCalledTimes(1);
        expect(push.notifyDeviceDisconnected).toHaveBeenCalledWith(
          request.auth.credentials.uid,
          [deviceId, deviceId2],
          deviceId
        );

        expect(oauthDB.removeRefreshToken).not.toHaveBeenCalled();

        expect(log.activityEvent).toHaveBeenCalledTimes(1);
        expect(log.activityEvent).toHaveBeenCalledWith({
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

        expect(log.notifyAttachedServices).toHaveBeenCalledTimes(1);
        const args = jest.mocked(log.notifyAttachedServices).mock.calls[0];
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

        expect(db.deleteDevice).toHaveBeenCalledTimes(1);
        expect(oauthDB.getRefreshToken).toHaveBeenCalledWith(refreshTokenId);
        expect(log.error).toHaveBeenCalledTimes(0);
        expect(log.notifyAttachedServices).toHaveBeenCalledTimes(1);
      });

      it('should ignore missing tokens when deleting the refreshToken', async () => {
        oauthDB.getRefreshToken.mockResolvedValue({ tokenId: refreshTokenId });
        oauthDB.removeRefreshToken.mockRejectedValue(error.invalidToken());
        device.refreshTokenId = refreshTokenId;

        const result = await devices.destroy(request, deviceId);
        expect(result.sessionTokenId).toBeFalsy();
        expect(result.refreshTokenId).toBe(refreshTokenId);

        expect(db.deleteDevice).toHaveBeenCalledTimes(1);
        expect(oauthDB.getRefreshToken).toHaveBeenCalledWith(refreshTokenId);
        expect(log.error).toHaveBeenCalledTimes(0);
        expect(log.notifyAttachedServices).toHaveBeenCalledTimes(1);
      });

      it('should log other errors when deleting the refreshToken, without failing', async () => {
        oauthDB.getRefreshToken.mockResolvedValue({ tokenId: refreshTokenId });
        oauthDB.removeRefreshToken.mockRejectedValue(error.unexpectedError());
        device.refreshTokenId = refreshTokenId;

        const result = await devices.destroy(request, deviceId);
        expect(result.sessionTokenId).toBeFalsy();
        expect(result.refreshTokenId).toBe(refreshTokenId);

        expect(db.deleteDevice).toHaveBeenCalledTimes(1);
        expect(oauthDB.getRefreshToken).toHaveBeenCalledWith(refreshTokenId);
        expect(log.notifyAttachedServices).toHaveBeenCalledTimes(1);
        expect(log.error).toHaveBeenCalledTimes(1);
        expect(log.error).toHaveBeenCalledWith(
          'deviceDestroy.revokeRefreshTokenById.error',
          expect.anything()
        );
      });

      describe('account authorization revocation:', () => {
        const clientId = '5882386c6d801776';

        beforeEach(() => {
          device.refreshTokenId = refreshTokenId;
          oauthDB.getRefreshToken.mockResolvedValue({
            tokenId: refreshTokenId,
            clientId: Buffer.from(clientId, 'hex'),
          });
          // The driver reports how many rows the delete touched, which is the
          // evidence revocation gates on.
          oauthDB.removeRefreshToken.mockResolvedValue({ affectedRows: 1 });
        });

        it("evaluates the destroyed token's client for revocation", async () => {
          // The row is this client's and nothing remains to sustain it, so it
          // is handed to the delete.
          oauthDB.listAccountConsentsByUid.mockResolvedValue([
            {
              scope: 'https://identity.mozilla.com/apps/vpn',
              service: 'vpn',
              clientId: Buffer.from(clientId, 'hex'),
              lastAuthorizedTosAt: 1,
            },
          ]);

          await devices.destroy(request, deviceId);

          expect(oauthDB.deleteAccountConsentRows).toHaveBeenCalledWith(
            request.auth.credentials.uid,
            [
              {
                scope: 'https://identity.mozilla.com/apps/vpn',
                service: 'vpn',
                clientId,
                lastAuthorizedTosAt: 1,
              },
            ]
          );
        });

        it('evaluates only after the refresh token has been removed', async () => {
          const calls: string[] = [];
          oauthDB.removeRefreshToken.mockImplementation(async () => {
            calls.push('removeRefreshToken');
            return { affectedRows: 1 };
          });
          oauthDB.getRefreshTokenScopesByUid.mockImplementation(async () => {
            calls.push('readRemainingTokens');
            return [];
          });

          await devices.destroy(request, deviceId);

          expect(calls).toEqual(['removeRefreshToken', 'readRemainingTokens']);
        });

        it('does not consult the token path when the device has no refresh token', async () => {
          device.refreshTokenId = null;

          await devices.destroy(request, deviceId);

          expect(oauthDB.getRefreshToken).not.toHaveBeenCalled();
        });

        it('does not revoke when removing the refresh token failed', async () => {
          oauthDB.removeRefreshToken.mockRejectedValue(error.unexpectedError());

          await devices.destroy(request, deviceId);

          expect(oauthDB.listAccountConsentsByUid).not.toHaveBeenCalled();
        });

        it('still disconnects the device when the revocation fails', async () => {
          oauthDB.listAccountConsentsByUid.mockRejectedValue(
            new Error('ECONNREFUSED')
          );

          const result = await devices.destroy(request, deviceId);

          expect(result.refreshTokenId).toBe(refreshTokenId);
          expect(log.notifyAttachedServices).toHaveBeenCalledTimes(1);
          expect(statsd.increment).toHaveBeenCalledWith(
            'accountAuthorization.revoke_failed',
            { client_type: 'native' }
          );
        });

        describe('for a session backed device:', () => {
          // Firefox Desktop's case: it registers its device over the session
          // token and keeps no refresh token, so the device record is the only
          // thing holding its consent up.
          const consentRow = {
            scope: 'https://identity.mozilla.com/apps/vpn',
            service: 'vpn',
            clientId: Buffer.from(clientId, 'hex'),
            lastAuthorizedTosAt: 1,
          };

          beforeEach(() => {
            device.refreshTokenId = null;
            oauthDB.listAccountConsentsByUid.mockResolvedValue([consentRow]);
            // deleteDevice cascades to the device's own session token, so this
            // is what is genuinely left after the disconnect.
            db.sessions = jest.fn(async () => []);
          });

          it('revokes when no session is left', async () => {
            await devices.destroy(request, deviceId);

            expect(oauthDB.deleteAccountConsentRows).toHaveBeenCalledWith(
              credentials.uid,
              [
                {
                  scope: consentRow.scope,
                  service: 'vpn',
                  clientId,
                  lastAuthorizedTosAt: 1,
                },
              ]
            );
          });

          it('keeps the rows while another session remains', async () => {
            db.sessions = jest.fn(async () => [{ id: sessionTokenId }]);

            await devices.destroy(request, deviceId);

            expect(oauthDB.deleteAccountConsentRows).not.toHaveBeenCalled();
            expect(statsd.increment).toHaveBeenCalledWith(
              'accountAuthorization.revoke_noop',
              { client_type: 'session' }
            );
          });

          it('keeps a row whose client still holds a refresh token', async () => {
            // Signing out Desktop says nothing about a connected Fenix.
            oauthDB.listAccountConsentsByUid.mockResolvedValue([
              { ...consentRow, clientId: Buffer.from(FENIX, 'hex') },
            ]);
            oauthDB.getRefreshTokenScopesByUid.mockResolvedValue([
              {
                clientId: Buffer.from(FENIX, 'hex'),
                scope: ScopeSet.fromArray([consentRow.scope]),
              },
            ]);

            await devices.destroy(request, deviceId);

            expect(oauthDB.deleteAccountConsentRows).not.toHaveBeenCalled();
          });

          it('revokes when the device refresh token is a dangling pointer', async () => {
            // Desktop registers with the token it just got, then destroys it. The
            // column stays set, so this must not be read as token backed.
            device.refreshTokenId = refreshTokenId;
            oauthDB.getRefreshToken.mockResolvedValue(undefined);

            await devices.destroy(request, deviceId);

            expect(oauthDB.removeRefreshToken).not.toHaveBeenCalled();
            expect(oauthDB.deleteAccountConsentRows).toHaveBeenCalledTimes(1);
          });
        });
      });

      it('emits the account.deviceDisconnected glean event with the platform from the disconnected device uaOS', async () => {
        db.deleteDevice = jest.fn(async () => {
          return { sessionTokenId, refreshTokenId: null };
        });
        const disconnectRequest = mocks.mockRequest({
          log,
          devices: [{ id: deviceId, uaOS: 'iOS' }, { id: deviceId2 }],
          credentials,
        });

        await devices.destroy(disconnectRequest, deviceId);

        expect(glean.account.deviceDisconnected).toHaveBeenCalledTimes(1);
        expect(glean.account.deviceDisconnected).toHaveBeenCalledWith(
          disconnectRequest,
          {
            uid: credentials.uid,
            platform: 'ios',
          }
        );
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
