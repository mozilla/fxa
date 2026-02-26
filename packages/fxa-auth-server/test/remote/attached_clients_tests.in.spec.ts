/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';

const Client = require('../client')();
const ScopeSet = require('fxa-shared').oauth.scopes;
const hashRefreshToken = require('fxa-shared/auth/encrypt').hash;

const buf = (v: any) => (Buffer.isBuffer(v) ? v : Buffer.from(v, 'hex'));
const PUBLIC_CLIENT_ID = '3c49430b43dfba77';

let server: TestServerInstance;
let oauthServerDb: any;
let tokens: any;

beforeAll(async () => {
  server = await createTestServer();

  const config = require('../../config').default.getProperties();
  tokens = require('../../lib/tokens')({ trace: () => {} }, config);
  oauthServerDb = require('../../lib/oauth/db');
}, 120000);

afterAll(async () => {
  await server.stop();
});

const testVersions = [
  { version: '', tag: '' },
  { version: 'V2', tag: 'V2' },
];

describe.each(testVersions)(
  '#integration$tag - attached clients listing',
  ({ version, tag }) => {
    const testOptions = { version };

    it('correctly lists a variety of attached clients', async () => {
      const email = server.uniqueEmail();
      const password = 'test password';
      const client = await Client.createAndVerify(
        server.publicUrl, email, password, server.mailbox, testOptions
      );
      const mySessionTokenId = (
        await tokens.SessionToken.fromHex(client.sessionToken)
      ).id;
      const deviceInfo = {
        name: 'test device \ud83c\udf53\ud83d\udd25\u5728\ud834\udf06',
        type: 'mobile',
        availableCommands: { foo: 'bar' },
        pushCallback: '',
        pushPublicKey: '',
        pushAuthKey: '',
      };

      let allClients = await client.attachedClients();
      expect(allClients.length).toBe(1);
      expect(allClients[0].sessionTokenId).toBe(mySessionTokenId);
      expect(allClients[0].deviceId).toBeNull();
      expect(allClients[0].lastAccessTimeFormatted).toBe('a few seconds ago');

      const device = await client.updateDevice(deviceInfo);

      allClients = await client.attachedClients();
      expect(allClients.length).toBe(1);
      expect(allClients[0].sessionTokenId).toBe(mySessionTokenId);
      expect(allClients[0].deviceId).toBe(device.id);
      expect(allClients[0].name).toBe(deviceInfo.name);

      const refreshToken = await oauthServerDb.generateRefreshToken({
        clientId: buf(PUBLIC_CLIENT_ID),
        userId: buf(client.uid),
        email: client.email,
        scope: ScopeSet.fromArray([
          'profile',
          'https://identity.mozilla.com/apps/oldsync',
        ]),
      });
      const refreshTokenId = hashRefreshToken(refreshToken.token).toString('hex');

      allClients = await client.attachedClients();
      expect(allClients.length).toBe(2);
      expect(allClients[0].sessionTokenId).toBe(mySessionTokenId);
      expect(allClients[1].sessionTokenId).toBeNull();
      expect(allClients[1].refreshTokenId).toBe(refreshTokenId);
      expect(allClients[1].lastAccessTimeFormatted).toBe('a few seconds ago');
      expect(allClients[1].name).toBe('Android Components Reference Browser');

      const device2 = await client.updateDeviceWithRefreshToken(
        refreshToken.token.toString('hex'),
        { name: 'test device', type: 'mobile' }
      );

      allClients = await client.attachedClients();
      expect(allClients.length).toBe(2);
      const one = allClients.findIndex((c: any) => c.name === 'test device');
      const zero = (one + 1) % allClients.length;
      expect(allClients[zero].sessionTokenId).toBe(mySessionTokenId);
      expect(allClients[zero].deviceId).toBe(device.id);
      expect(allClients[one].refreshTokenId).toBe(refreshTokenId);
      expect(allClients[one].deviceId).toBe(device2.id);
      expect(allClients[one].name).toBe('test device');
    });

    it('correctly deletes by device id', async () => {
      const email = server.uniqueEmail();
      const password = 'test password';
      const client = await Client.createAndVerify(
        server.publicUrl, email, password, server.mailbox, testOptions
      );
      const mySessionTokenId = (
        await tokens.SessionToken.fromHex(client.sessionToken)
      ).id;

      const client2 = await Client.login(server.publicUrl, email, password, testOptions);
      const device = await client2.updateDevice({ name: 'test', type: 'desktop' });

      let allClients = await client.attachedClients();
      expect(allClients.length).toBe(2);

      await client.destroyAttachedClient({ deviceId: device.id });

      allClients = await client.attachedClients();
      expect(allClients.length).toBe(1);
      expect(allClients[0].sessionTokenId).toBe(mySessionTokenId);
    });

    it('correctly deletes by sessionTokenId', async () => {
      const email = server.uniqueEmail();
      const password = 'test password';
      const client = await Client.createAndVerify(
        server.publicUrl, email, password, server.mailbox, testOptions
      );
      const mySessionTokenId = (
        await tokens.SessionToken.fromHex(client.sessionToken)
      ).id;

      const client2 = await Client.login(server.publicUrl, email, password, testOptions);
      const otherSessionTokenId = (
        await tokens.SessionToken.fromHex(client2.sessionToken)
      ).id;

      let allClients = await client.attachedClients();
      expect(allClients.length).toBe(2);

      await client.destroyAttachedClient({ sessionTokenId: otherSessionTokenId });

      allClients = await client.attachedClients();
      expect(allClients.length).toBe(1);
      expect(allClients[0].sessionTokenId).toBe(mySessionTokenId);
    });

    it('correctly deletes by refreshTokenId', async () => {
      const email = server.uniqueEmail();
      const password = 'test password';
      const client = await Client.createAndVerify(
        server.publicUrl, email, password, server.mailbox, testOptions
      );
      const mySessionTokenId = (
        await tokens.SessionToken.fromHex(client.sessionToken)
      ).id;

      const refreshToken = await oauthServerDb.generateRefreshToken({
        clientId: buf(PUBLIC_CLIENT_ID),
        userId: buf(client.uid),
        email: client.email,
        scope: ScopeSet.fromArray([
          'profile',
          'https://identity.mozilla.com/apps/oldsync',
        ]),
      });
      const refreshTokenId = hashRefreshToken(refreshToken.token).toString('hex');

      let allClients = await client.attachedClients();
      expect(allClients.length).toBe(2);

      await client.destroyAttachedClient({
        refreshTokenId,
        clientId: PUBLIC_CLIENT_ID,
      });

      allClients = await client.attachedClients();
      expect(allClients.length).toBe(1);
      expect(allClients[0].sessionTokenId).toBe(mySessionTokenId);
      expect(allClients[0].refreshTokenId).toBeNull();
    });

    it('correctly lists a unique list of clientIds for refresh tokens', async () => {
      const email = server.uniqueEmail();
      const password = 'test password';
      const client = await Client.createAndVerify(
        server.publicUrl, email, password, server.mailbox, testOptions
      );

      let oauthClients = await client.attachedOAuthClients();
      expect(oauthClients.length).toBe(0);

      const clientId = buf(PUBLIC_CLIENT_ID);
      const userId = buf(client.uid);
      const scope = ScopeSet.fromArray([
        'profile',
        'https://identity.mozilla.com/apps/oldsync',
      ]);

      await oauthServerDb.generateRefreshToken({
        clientId, userId, email: client.email, scope,
      });

      const refreshToken2 = await oauthServerDb.generateRefreshToken({
        clientId, userId, email: client.email, scope,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const newerTimestamp = new Date(Date.now() + 5000);
      await oauthServerDb.mysql._touchRefreshToken(
        refreshToken2.tokenId,
        newerTimestamp
      );

      oauthClients = await client.attachedOAuthClients();
      expect(oauthClients.length).toBe(1);
      expect(oauthClients[0].clientId).toBe(PUBLIC_CLIENT_ID);
      const timeDiff = Math.abs(
        oauthClients[0].lastAccessTime - newerTimestamp.getTime()
      );
      expect(timeDiff).toBeLessThan(1000);
    });
  }
);
