/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';
import base64url from 'base64url';
import { createTestServer, TestServerInstance } from '../support/helpers/test-server';

const Client = require('../client')();
const mocks = require('../mocks');

let server: TestServerInstance;

beforeAll(async () => {
  server = await createTestServer();
}, 120000);

afterAll(async () => {
  await server.stop();
});

const testVersions = [
  { version: '', tag: '' },
  { version: 'V2', tag: 'V2' },
];

describe.each(testVersions)(
  '#integration$tag - remote device',
  ({ version, tag }) => {
    const testOptions = { version };

    it('device registration after account creation', async () => {
      const email = server.uniqueEmail();
      const password = 'test password';
      const client = await Client.create(server.publicUrl, email, password, testOptions);

      const deviceInfo = {
        name: 'test device \ud83c\udf53\ud83d\udd25\u5728\ud834\udf06',
        type: 'mobile',
        availableCommands: { foo: 'bar' },
        pushCallback: '',
        pushPublicKey: '',
        pushAuthKey: '',
      };

      let devices = await client.devices();
      expect(devices.length).toBe(0);

      const device = await client.updateDevice(deviceInfo);
      expect(device.id).toBeTruthy();
      expect(device.createdAt).toBeGreaterThan(0);
      expect(device.name).toBe(deviceInfo.name);
      expect(device.type).toBe(deviceInfo.type);
      expect(device.availableCommands).toEqual(deviceInfo.availableCommands);
      expect(device.pushCallback).toBe(deviceInfo.pushCallback);
      expect(device.pushPublicKey).toBe(deviceInfo.pushPublicKey);
      expect(device.pushAuthKey).toBe(deviceInfo.pushAuthKey);
      expect(device.pushEndpointExpired).toBe(false);

      devices = await client.devices();
      expect(devices.length).toBe(1);
      expect(devices[0].name).toBe(deviceInfo.name);
      expect(devices[0].type).toBe(deviceInfo.type);
      expect(devices[0].availableCommands).toEqual(deviceInfo.availableCommands);
      expect(devices[0].pushCallback).toBe('');
      expect(devices[0].pushPublicKey).toBe('');
      expect(devices[0].pushAuthKey).toBe('');
      expect(devices[0].pushEndpointExpired).toBeFalsy();

      await client.destroyDevice(devices[0].id);
    });

    it('device registration without optional parameters', async () => {
      const email = server.uniqueEmail();
      const password = 'test password';
      const client = await Client.create(server.publicUrl, email, password, testOptions);

      const deviceInfo = {
        name: 'test device',
        type: 'mobile',
      };

      let devices = await client.devices();
      expect(devices.length).toBe(0);

      const device = await client.updateDevice(deviceInfo);
      expect(device.id).toBeTruthy();
      expect(device.createdAt).toBeGreaterThan(0);
      expect(device.name).toBe(deviceInfo.name);
      expect(device.type).toBe(deviceInfo.type);
      expect(device.pushCallback == null).toBe(true);
      expect(device.pushPublicKey == null).toBe(true);
      expect(device.pushAuthKey == null).toBe(true);
      expect(device.pushEndpointExpired).toBe(false);

      devices = await client.devices();
      expect(devices.length).toBe(1);
      expect(devices[0].name).toBe(deviceInfo.name);
      expect(devices[0].type).toBe(deviceInfo.type);
      expect(devices[0].pushCallback == null).toBe(true);
      expect(devices[0].pushPublicKey == null).toBe(true);
      expect(devices[0].pushAuthKey == null).toBe(true);
      expect(devices[0].pushEndpointExpired).toBe(false);

      await client.destroyDevice(devices[0].id);
    });

    it('device registration with unicode characters in the name', async () => {
      const email = server.uniqueEmail();
      const password = 'test password';
      const client = await Client.create(server.publicUrl, email, password, testOptions);

      const deviceInfo = {
        name: 'Firefox \u5728 \u03b2 test\ufffd',
        type: 'desktop',
      };

      const device = await client.updateDevice(deviceInfo);
      expect(device.id).toBeTruthy();
      expect(device.createdAt).toBeGreaterThan(0);
      expect(device.name).toBe(deviceInfo.name);

      const devices = await client.devices();
      expect(devices.length).toBe(1);
      expect(devices[0].name).toBe(deviceInfo.name);
    });

    it('device registration without required name parameter', async () => {
      const email = server.uniqueEmail();
      const password = 'test password';
      const client = await Client.create(server.publicUrl, email, password, testOptions);

      const device = await client.updateDevice({ type: 'mobile' });
      expect(device.id).toBeTruthy();
      expect(device.createdAt).toBeGreaterThan(0);
      expect(device.name).toBe('');
      expect(device.type).toBe('mobile');
    });

    it('device registration without required type parameter', async () => {
      const email = server.uniqueEmail();
      const deviceName = 'test device';
      const password = 'test password';
      const client = await Client.create(server.publicUrl, email, password, testOptions);

      const device = await client.updateDevice({ name: 'test device' });
      expect(device.id).toBeTruthy();
      expect(device.createdAt).toBeGreaterThan(0);
      expect(device.name).toBe(deviceName);
    });

    it('update device fails with bad callbackUrl', async () => {
      const badPushCallback =
        'https://updates.push.services.mozilla.com.different-push-server.technology';
      const email = server.uniqueEmail();
      const password = 'test password';
      const deviceInfo = {
        id: crypto.randomBytes(16).toString('hex'),
        name: 'test device',
        type: 'desktop',
        availableCommands: {},
        pushCallback: badPushCallback,
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: base64url(crypto.randomBytes(16)),
      };

      const client = await Client.create(server.publicUrl, email, password, testOptions);
      try {
        await client.updateDevice(deviceInfo);
        throw new Error('request should have failed');
      } catch (err: any) {
        expect(err.code).toBe(400);
        expect(err.errno).toBe(107);
        expect(err.validation.keys[0]).toBe('pushCallback');
      }
    });

    it('update device fails with non-normalized callbackUrl', async () => {
      const badPushCallback =
        'https://updates.push.services.mozilla.com/invalid/\u010D/char';
      const email = server.uniqueEmail();
      const password = 'test password';
      const deviceInfo = {
        id: crypto.randomBytes(16).toString('hex'),
        name: 'test device',
        type: 'desktop',
        availableCommands: {},
        pushCallback: badPushCallback,
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: base64url(crypto.randomBytes(16)),
      };

      const client = await Client.create(server.publicUrl, email, password, testOptions);
      try {
        await client.updateDevice(deviceInfo);
        throw new Error('request should have failed');
      } catch (err: any) {
        expect(err.code).toBe(400);
        expect(err.errno).toBe(107);
        expect(err.validation.keys[0]).toBe('pushCallback');
      }
    });

    it('update device works with stage servers', async () => {
      const goodPushCallback = 'https://updates-autopush.stage.mozaws.net';
      const email = server.uniqueEmail();
      const password = 'test password';
      const client = await Client.create(server.publicUrl, email, password, testOptions);

      const deviceInfo = {
        name: 'test device',
        type: 'mobile',
        availableCommands: {},
        pushCallback: goodPushCallback,
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: base64url(crypto.randomBytes(16)),
      };

      const devices = await client.devices();
      expect(devices.length).toBe(0);

      const device = await client.updateDevice(deviceInfo);
      expect(device.id).toBeTruthy();
      expect(device.pushCallback).toBe(deviceInfo.pushCallback);
    });

    it('update device works with dev servers', async () => {
      const goodPushCallback = 'https://updates-autopush.dev.mozaws.net';
      const email = server.uniqueEmail();
      const password = 'test password';
      const client = await Client.create(server.publicUrl, email, password, testOptions);

      const deviceInfo = {
        name: 'test device',
        type: 'mobile',
        pushCallback: goodPushCallback,
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: base64url(crypto.randomBytes(16)),
      };

      const devices = await client.devices();
      expect(devices.length).toBe(0);

      const device = await client.updateDevice(deviceInfo);
      expect(device.id).toBeTruthy();
      expect(device.pushCallback).toBe(deviceInfo.pushCallback);
    });

    it('update device works with callback urls that :443 as a port', async () => {
      const goodPushCallback =
        'https://updates.push.services.mozilla.com:443/wpush/v1/gAAAAABbkq0Eafe6IANS4OV3pmoQ5Z8AhqFSGKtozz5FIvu0CfrTGmcv07CYziPaysTv_9dgisB0yr3UjEIlGEyoprRFX1WU5VA4nG-9tofPdA3FYREPf6xh3JL1qBhTa9mEFS2dSn--';
      const email = server.uniqueEmail();
      const password = 'test password';
      const client = await Client.create(server.publicUrl, email, password, testOptions);

      const deviceInfo = {
        name: 'test device',
        type: 'mobile',
        pushCallback: goodPushCallback,
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: base64url(crypto.randomBytes(16)),
      };

      const devices = await client.devices();
      expect(devices.length).toBe(0);

      const device = await client.updateDevice(deviceInfo);
      expect(device.id).toBeTruthy();
      expect(device.pushCallback).toBe(deviceInfo.pushCallback);
    });

    it('update device works with callback urls that :4430 as a port', async () => {
      const goodPushCallback = 'https://updates.push.services.mozilla.com:4430';
      const email = server.uniqueEmail();
      const password = 'test password';
      const client = await Client.create(server.publicUrl, email, password, testOptions);

      const deviceInfo = {
        name: 'test device',
        type: 'mobile',
        pushCallback: goodPushCallback,
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: base64url(crypto.randomBytes(16)),
      };

      const devices = await client.devices();
      expect(devices.length).toBe(0);

      const device = await client.updateDevice(deviceInfo);
      expect(device.id).toBeTruthy();
      expect(device.pushCallback).toBe(deviceInfo.pushCallback);
    });

    it('update device works with callback urls that a custom port', async () => {
      const goodPushCallback =
        'https://updates.push.services.mozilla.com:10332';
      const email = server.uniqueEmail();
      const password = 'test password';
      const client = await Client.create(server.publicUrl, email, password, testOptions);

      const deviceInfo = {
        name: 'test device',
        type: 'mobile',
        pushCallback: goodPushCallback,
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: base64url(crypto.randomBytes(16)),
      };

      const devices = await client.devices();
      expect(devices.length).toBe(0);

      const device = await client.updateDevice(deviceInfo);
      expect(device.id).toBeTruthy();
      expect(device.pushCallback).toBe(deviceInfo.pushCallback);
    });

    it('update device fails with bad dev callbackUrl', async () => {
      const badPushCallback = 'https://evil.mozaws.net';
      const email = server.uniqueEmail();
      const password = 'test password';
      const deviceInfo = {
        id: crypto.randomBytes(16).toString('hex'),
        name: 'test device',
        type: 'desktop',
        pushCallback: badPushCallback,
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: base64url(crypto.randomBytes(16)),
      };

      const client = await Client.create(server.publicUrl, email, password, testOptions);
      try {
        await client.updateDevice(deviceInfo);
        throw new Error('request should have failed');
      } catch (err: any) {
        expect(err.code).toBe(400);
        expect(err.errno).toBe(107);
        expect(err.validation.keys[0]).toBe('pushCallback');
      }
    });

    it('device registration ignores deprecated "capabilities" field', async () => {
      const email = server.uniqueEmail();
      const password = 'test password';
      const client = await Client.create(server.publicUrl, email, password, testOptions);

      const deviceInfo = {
        name: 'a very capable device',
        type: 'desktop',
        capabilities: [],
      };

      const device = await client.updateDevice(deviceInfo);
      expect(device.id).toBeTruthy();
      expect(device.createdAt).toBeGreaterThan(0);
      expect(device.name).toBe(deviceInfo.name);
      expect(device.capabilities).toBeFalsy();
    });

    it('device registration from a different session', async () => {
      const email = server.uniqueEmail();
      const password = 'test password';
      const deviceInfo = [
        { name: 'first device', type: 'mobile' },
        { name: 'second device', type: 'desktop' },
      ];

      const client = await Client.createAndVerify(
        server.publicUrl, email, password, server.mailbox, testOptions
      );

      const secondClient = await Client.login(server.publicUrl, email, password, testOptions);
      await secondClient.updateDevice(deviceInfo[0]);

      let devices = await client.devices();
      expect(devices.length).toBe(1);
      expect(devices[0].isCurrentDevice).toBe(false);
      expect(devices[0].name).toBe(deviceInfo[0].name);
      expect(devices[0].type).toBe(deviceInfo[0].type);

      await client.updateDevice(deviceInfo[1]);
      devices = await client.devices();
      expect(devices.length).toBe(2);

      if (devices[0].name === deviceInfo[1].name) {
        const swap: any = {};
        Object.keys(devices[0]).forEach((key: string) => {
          swap[key] = devices[0][key];
          devices[0][key] = devices[1][key];
          devices[1][key] = swap[key];
        });
      }

      expect(devices[0].isCurrentDevice).toBe(false);
      expect(devices[0].name).toBe(deviceInfo[0].name);
      expect(devices[0].type).toBe(deviceInfo[0].type);
      expect(devices[1].isCurrentDevice).toBe(true);
      expect(devices[1].name).toBe(deviceInfo[1].name);
      expect(devices[1].type).toBe(deviceInfo[1].type);

      await Promise.all([
        client.destroyDevice(devices[0].id),
        client.destroyDevice(devices[1].id),
      ]);
    });

    it('ensures all device push fields appear together', async () => {
      const email = server.uniqueEmail();
      const password = 'test password';
      const deviceInfo = {
        name: 'test device',
        type: 'desktop',
        pushCallback: 'https://updates.push.services.mozilla.com/qux',
        pushPublicKey: mocks.MOCK_PUSH_KEY,
        pushAuthKey: base64url(crypto.randomBytes(16)),
      };

      const client = await Client.create(server.publicUrl, email, password, testOptions);
      await client.updateDevice(deviceInfo);

      const devices = await client.devices();
      expect(devices[0].pushCallback).toBe(deviceInfo.pushCallback);
      expect(devices[0].pushPublicKey).toBe(deviceInfo.pushPublicKey);
      expect(devices[0].pushAuthKey).toBe(deviceInfo.pushAuthKey);
      expect(devices[0].pushEndpointExpired).toBe(false);

      try {
        await client.updateDevice({
          id: client.device.id,
          pushCallback: 'https://updates.push.services.mozilla.com/foo',
        });
        throw new Error('request should have failed');
      } catch (err: any) {
        expect(err.errno).toBe(107);
        expect(err.message).toBe('Invalid parameter in request body');
      }
    });

    it('invalid public keys are cleanly rejected', async () => {
      const email = server.uniqueEmail();
      const password = 'test password';
      const invalidPublicKey = Buffer.alloc(65);
      invalidPublicKey.fill('\0');
      const deviceInfo = {
        name: 'test device',
        type: 'desktop',
        pushCallback: 'https://updates.push.services.mozilla.com/qux',
        pushPublicKey: base64url(invalidPublicKey),
        pushAuthKey: base64url(crypto.randomBytes(16)),
      };

      const client = await Client.createAndVerify(
        server.publicUrl, email, password, server.mailbox, testOptions
      );

      try {
        await client.updateDevice(deviceInfo);
        throw new Error('request should have failed');
      } catch (err: any) {
        expect(err.code).toBe(400);
        expect(err.errno).toBe(107);
      }
    });
  }
);
