/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';
import { createTestServer, TestServerInstance } from '../support/helpers/test-server';

const Client = require('../client')();
const encrypt = require('fxa-shared/auth/encrypt');

const buf = (v: any) => (Buffer.isBuffer(v) ? v : Buffer.from(v, 'hex'));

const PUBLIC_CLIENT_ID = '3c49430b43dfba77';
const NON_PUBLIC_CLIENT_ID = 'dcdb5ae7add825d2';
const OAUTH_CLIENT_NAME = 'Android Components Reference Browser';
const UNKNOWN_REFRESH_TOKEN =
  'B53DF2CE2BDB91820CB0A5D68201EF87D8D8A0DFC11829FB074B6426F537EE78';

let server: TestServerInstance;
let oauthServerDb: any;
let db: any;

beforeAll(async () => {
  server = await createTestServer();

  const log = { trace() {}, info() {}, error() {}, debug() {}, warn() {} };
  const config = require('../../config').default.getProperties();
  const lastAccessTimeUpdates = {
    enabled: true,
    sampleRate: 1,
    earliestSaneTimestamp: config.lastAccessTimeUpdates.earliestSaneTimestamp,
  };
  const Token = require('../../lib/tokens')(log, {
    lastAccessTimeUpdates,
    tokenLifetimes: { sessionTokenWithoutDevice: 2419200000 },
  });
  const { createDB } = require('../../lib/db');
  const DB = createDB(config, log, Token);
  db = await DB.connect(config);
  oauthServerDb = require('../../lib/oauth/db');
}, 120000);

afterAll(async () => {
  await db.close();
  await server.stop();
});

const testVersions = [
  { version: '', tag: '' },
  { version: 'V2', tag: 'V2' },
];

describe.each(testVersions)(
  '#integration$tag - remote device with refresh tokens',
  ({ version, tag }) => {
    const testOptions = { version };
    let client: any;
    let email: string;
    let password: string;
    let refreshToken: string;

    beforeEach(async () => {
      email = server.uniqueEmail();
      password = 'test password';
      client = await Client.create(server.publicUrl, email, password, testOptions);
    });

    it('device registration with unknown refresh token', async () => {
      const deviceInfo = {
        name: 'test device \ud83c\udf53\ud83d\udd25\u5728\ud834\udf06',
        type: 'mobile',
        availableCommands: { foo: 'bar' },
        pushCallback: '',
        pushPublicKey: '',
        pushAuthKey: '',
      };

      try {
        await client.updateDeviceWithRefreshToken(UNKNOWN_REFRESH_TOKEN, deviceInfo);
        throw new Error('should have failed');
      } catch (err: any) {
        expect(err.code).toBe(401);
        expect(err.errno).toBe(110);
      }
    });

    it('devicesWithRefreshToken fails with unknown refresh token', async () => {
      try {
        await client.devicesWithRefreshToken(UNKNOWN_REFRESH_TOKEN);
        throw new Error('should have failed');
      } catch (err: any) {
        expect(err.code).toBe(401);
        expect(err.errno).toBe(110);
      }
    });

    it('destroyDeviceWithRefreshToken fails with unknown refresh token', async () => {
      try {
        await client.destroyDeviceWithRefreshToken(UNKNOWN_REFRESH_TOKEN, '1');
        throw new Error('should have failed');
      } catch (err: any) {
        expect(err.code).toBe(401);
        expect(err.errno).toBe(110);
      }
    });

    it('deviceCommandsWithRefreshToken fails with unknown refresh token', async () => {
      try {
        await client.deviceCommandsWithRefreshToken(UNKNOWN_REFRESH_TOKEN, 0, 50);
        throw new Error('should have failed');
      } catch (err: any) {
        expect(err.code).toBe(401);
        expect(err.errno).toBe(110);
      }
    });

    it('devicesInvokeCommandWithRefreshToken fails with unknown refresh token', async () => {
      try {
        await client.devicesInvokeCommandWithRefreshToken(
          UNKNOWN_REFRESH_TOKEN, 'target', 'command', {}, 5
        );
        throw new Error('should have failed');
      } catch (err: any) {
        expect(err.code).toBe(401);
        expect(err.errno).toBe(110);
      }
    });

    it('devicesNotifyWithRefreshToken fails with unknown refresh token', async () => {
      try {
        await client.devicesNotifyWithRefreshToken(UNKNOWN_REFRESH_TOKEN, '123');
        throw new Error('should have failed');
      } catch (err: any) {
        expect(err.code).toBe(401);
        expect(err.errno).toBe(110);
      }
    });

    it('device registration after account creation', async () => {
      const refresh = await oauthServerDb.generateRefreshToken({
        clientId: buf(PUBLIC_CLIENT_ID),
        userId: buf(client.uid),
        email: client.email,
        scope: 'profile https://identity.mozilla.com/apps/oldsync',
      });
      refreshToken = refresh.token.toString('hex');

      const deviceInfo = {
        name: 'test device \ud83c\udf53\ud83d\udd25\u5728\ud834\udf06',
        type: 'mobile',
        availableCommands: { foo: 'bar' },
        pushCallback: '',
        pushPublicKey: '',
        pushAuthKey: '',
      };

      let devices = await client.devicesWithRefreshToken(refreshToken);
      expect(devices.length).toBe(0);

      const device = await client.updateDeviceWithRefreshToken(refreshToken, deviceInfo);
      expect(device.id).toBeTruthy();
      expect(device.createdAt).toBeGreaterThan(0);
      expect(device.name).toBe(deviceInfo.name);
      expect(device.type).toBe(deviceInfo.type);
      expect(device.availableCommands).toEqual(deviceInfo.availableCommands);
      expect(device.pushCallback).toBe(deviceInfo.pushCallback);
      expect(device.pushPublicKey).toBe(deviceInfo.pushPublicKey);
      expect(device.pushAuthKey).toBe(deviceInfo.pushAuthKey);
      expect(device.pushEndpointExpired).toBe(false);

      devices = await client.devicesWithRefreshToken(refreshToken);
      expect(devices.length).toBe(1);
      expect(devices[0].name).toBe(deviceInfo.name);
      expect(devices[0].type).toBe(deviceInfo.type);
      expect(devices[0].availableCommands).toEqual(deviceInfo.availableCommands);
      expect(devices[0].pushCallback).toBe(deviceInfo.pushCallback);
      expect(devices[0].pushPublicKey).toBe(deviceInfo.pushPublicKey);
      expect(devices[0].pushAuthKey).toBe(deviceInfo.pushAuthKey);
      expect(devices[0].pushEndpointExpired).toBeFalsy();

      await client.destroyDeviceWithRefreshToken(refreshToken, devices[0].id);
    });

    it('device registration without optional parameters', async () => {
      const refresh = await oauthServerDb.generateRefreshToken({
        clientId: buf(PUBLIC_CLIENT_ID),
        userId: buf(client.uid),
        email: client.email,
        scope: 'profile https://identity.mozilla.com/apps/oldsync',
      });
      refreshToken = refresh.token.toString('hex');

      const deviceInfo = {
        name: 'test device',
        type: 'mobile',
      };

      let devices = await client.devicesWithRefreshToken(refreshToken);
      expect(devices.length).toBe(0);

      const device = await client.updateDeviceWithRefreshToken(refreshToken, deviceInfo);
      expect(device.id).toBeTruthy();
      expect(device.createdAt).toBeGreaterThan(0);
      expect(device.name).toBe(deviceInfo.name);
      expect(device.type).toBe(deviceInfo.type);
      expect(device.pushCallback == null).toBe(true);
      expect(device.pushPublicKey == null).toBe(true);
      expect(device.pushAuthKey == null).toBe(true);
      expect(device.pushEndpointExpired).toBe(false);

      devices = await client.devicesWithRefreshToken(refreshToken);
      const deviceId = devices[0].id;
      expect(devices.length).toBe(1);
      expect(devices[0].name).toBe(deviceInfo.name);
      expect(devices[0].type).toBe(deviceInfo.type);
      expect(devices[0].pushCallback == null).toBe(true);
      expect(devices[0].pushPublicKey == null).toBe(true);
      expect(devices[0].pushAuthKey == null).toBe(true);
      expect(devices[0].pushEndpointExpired).toBe(false);

      const tokenObj = await oauthServerDb.getRefreshToken(encrypt.hash(refreshToken));
      expect(tokenObj).toBeTruthy();

      await client.destroyDeviceWithRefreshToken(refreshToken, deviceId);

      const tokenObjAfter = await oauthServerDb.getRefreshToken(encrypt.hash(refreshToken));
      expect(tokenObjAfter).toBeFalsy();
    });

    it('device registration using oauth client name', async () => {
      const refresh = await oauthServerDb.generateRefreshToken({
        clientId: buf(PUBLIC_CLIENT_ID),
        userId: buf(client.uid),
        email: client.email,
        scope: 'profile https://identity.mozilla.com/apps/oldsync',
      });
      refreshToken = refresh.token.toString('hex');

      const refresh2 = await oauthServerDb.generateRefreshToken({
        clientId: buf(PUBLIC_CLIENT_ID),
        userId: buf(client.uid),
        email: client.email,
        scope: 'profile https://identity.mozilla.com/apps/oldsync',
      });
      const refreshToken2 = refresh2.token.toString('hex');

      let devices = await client.devicesWithRefreshToken(refreshToken);
      expect(devices.length).toBe(0);

      const device = await client.updateDeviceWithRefreshToken(refreshToken, {});
      expect(device.id).toBeTruthy();
      expect(device.createdAt).toBeGreaterThan(0);
      expect(device.name).toBe(OAUTH_CLIENT_NAME);
      expect(device.type).toBe('mobile');
      expect(device.pushCallback).toBeUndefined();
      expect(device.pushPublicKey).toBeUndefined();
      expect(device.pushAuthKey).toBeUndefined();
      expect(device.pushEndpointExpired).toBe(false);

      devices = await client.devicesWithRefreshToken(refreshToken2);
      expect(devices.length).toBe(1);
      expect(devices[0].name).toBe(OAUTH_CLIENT_NAME);
      expect(devices[0].type).toBe('mobile');
    });

    it('device registration without required name parameter', async () => {
      const refresh = await oauthServerDb.generateRefreshToken({
        clientId: buf(PUBLIC_CLIENT_ID),
        userId: buf(client.uid),
        email: client.email,
        scope: 'profile https://identity.mozilla.com/apps/oldsync',
      });
      refreshToken = refresh.token.toString('hex');

      const device = await client.updateDeviceWithRefreshToken(refreshToken, {
        type: 'mobile',
      });
      expect(device.id).toBeTruthy();
      expect(device.createdAt).toBeGreaterThan(0);
      expect(device.name).toBe(OAUTH_CLIENT_NAME);
      expect(device.type).toBe('mobile');
    });

    it('sets isCurrentDevice correctly', async () => {
      const generateTokenInfo = {
        clientId: buf(PUBLIC_CLIENT_ID),
        userId: buf(client.uid),
        email: client.email,
        scope: 'profile https://identity.mozilla.com/apps/oldsync',
      };

      const rt1 = await oauthServerDb.generateRefreshToken(generateTokenInfo);
      const rt2 = await oauthServerDb.generateRefreshToken(generateTokenInfo);

      await client.updateDeviceWithRefreshToken(rt1.token.toString('hex'), {
        name: 'first device',
      });
      await client.updateDeviceWithRefreshToken(rt2.token.toString('hex'), {
        name: 'second device',
      });

      const devices = await client.devicesWithRefreshToken(rt1.token.toString('hex'));
      expect(devices.length).toBe(2);

      if (devices[0].name === 'first device') {
        const swap: any = {};
        Object.keys(devices[0]).forEach((key: string) => {
          swap[key] = devices[0][key];
          devices[0][key] = devices[1][key];
          devices[1][key] = swap[key];
        });
      }

      expect(devices[0].isCurrentDevice).toBe(false);
      expect(devices[0].name).toBe('second device');
      expect(devices[1].isCurrentDevice).toBe(true);
      expect(devices[1].name).toBe('first device');
    });

    it('does not allow non-public clients', async () => {
      const refresh = await oauthServerDb.generateRefreshToken({
        clientId: buf(NON_PUBLIC_CLIENT_ID),
        userId: buf(client.uid),
        email: client.email,
        scope: 'profile https://identity.mozilla.com/apps/oldsync',
      });
      refreshToken = refresh.token.toString('hex');

      try {
        await client.updateDeviceWithRefreshToken(refreshToken, { type: 'mobile' });
        throw new Error('must fail');
      } catch (err: any) {
        expect(err.message).toBe('Not a public client');
        expect(err.errno).toBe(166);
      }
    });

    it('throws conflicting device errors', async () => {
      const conflictingDeviceInfo: any = {
        id: crypto.randomBytes(16).toString('hex'),
        name: 'Device',
      };

      const refresh = await oauthServerDb.generateRefreshToken({
        clientId: buf(PUBLIC_CLIENT_ID),
        userId: buf(client.uid),
        email: client.email,
        scope: 'profile https://identity.mozilla.com/apps/oldsync',
      });
      refreshToken = refresh.token.toString('hex');
      conflictingDeviceInfo.refreshTokenId = refreshToken;

      await db.createDevice(client.uid, conflictingDeviceInfo);

      conflictingDeviceInfo.id = crypto.randomBytes(16).toString('hex');
      try {
        await db.createDevice(client.uid, conflictingDeviceInfo);
        throw new Error('must fail');
      } catch (err: any) {
        expect(err.message).toBe('Session already registered by another device');
      }
    });
  }
);
