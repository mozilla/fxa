/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getSharedTestServer, TestServerInstance } from '../support/helpers/test-server';

const Client = require('../client')();
const ScopeSet = require('fxa-shared').oauth.scopes;
const hashRefreshToken = require('fxa-shared/auth/encrypt').hash;
const unique = require('../../lib/oauth/unique');

const buf = (v: any) => (Buffer.isBuffer(v) ? v : Buffer.from(v, 'hex'));
const PUBLIC_CLIENT_ID = '3c49430b43dfba77';

let server: TestServerInstance;
let oauthServerDb: any;
let tokens: any;

beforeAll(async () => {
  server = await getSharedTestServer();

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

describe.each(testVersions)(
  '#integration$tag - attached OAuth clients',
  ({ version }) => {
    const testOptions = { version };
    let user1: any, user2: any, client1: any, client2: any;

    async function makeAccessToken(client: any, user: any, scope: string[]) {
      await oauthServerDb.generateAccessToken({
        clientId: buf(client.id),
        name: client.name,
        canGrant: client.canGrant,
        userId: buf(user.uid),
        email: user.email,
        scope: ScopeSet.fromArray(scope),
      });
    }

    async function makeRefreshToken(client: any, user: any, scope: string[]) {
      const token = await oauthServerDb.generateRefreshToken({
        clientId: buf(client.id),
        userId: buf(user.uid),
        email: user.email,
        scope: ScopeSet.fromArray(scope),
      });
      return token.tokenId.toString('hex');
    }

    // Session records have a null clientId; keep only the OAuth ones.
    async function oauthClients(user: any) {
      const allClients = await user.attachedClients();
      return allClients.filter((c: any) => c.clientId !== null);
    }

    async function clientIds(user: any) {
      return (await oauthClients(user)).map((c: any) => c.clientId);
    }

    async function registerClient(name: string) {
      const client = {
        name,
        id: unique.id().toString('hex'),
        hashedSecret: hashRefreshToken(unique.secret()),
        redirectUri: 'https://example.domain',
        imageUri: 'https://example.com/logo.png',
        trusted: true,
        canGrant: false,
      };
      // Copy, because registerClient overwrites `id` with a Buffer.
      await oauthServerDb.registerClient({ ...client });
      return client;
    }

    beforeEach(async () => {
      [user1, user2] = await Promise.all(
        [1, 2].map(() =>
          Client.createAndVerify(
            server.publicUrl,
            server.uniqueEmail(),
            'test password',
            server.mailbox,
            testOptions
          )
        )
      );
      client1 = await registerClient('test/attached-clients/bbb-one');
      client2 = await registerClient('test/attached-clients/aaa-two');
    });

    describe('GET /account/attached_clients', () => {
      it('lists OAuth clients in a specific order', async () => {
        await makeAccessToken(client1, user1, ['profile']);
        await makeAccessToken(client2, user1, ['bb_scope', 'aa_scope']);

        // Sorted by last access time, then name, so client2 comes first.
        expect(await oauthClients(user1)).toMatchObject([
          {
            clientId: client2.id,
            createdTime: expect.any(Number),
            lastAccessTime: expect.any(Number),
            name: 'test/attached-clients/aaa-two',
            scope: ['aa_scope', 'bb_scope'],
          },
          {
            clientId: client1.id,
            createdTime: expect.any(Number),
            lastAccessTime: expect.any(Number),
            name: 'test/attached-clients/bbb-one',
            scope: ['profile'],
          },
        ]);
      });

      it('does not list tokens of different users', async () => {
        await makeAccessToken(client1, user1, ['profile']);
        await makeAccessToken(client2, user2, ['bb_scope', 'aa_scope']);

        expect(await clientIds(user1)).toEqual([client1.id]);
        expect(await clientIds(user2)).toEqual([client2.id]);
      });

      it('lists separate refresh tokens from the same client separately', async () => {
        await makeAccessToken(client1, user1, ['profile']);
        await makeAccessToken(client1, user1, ['other', 'scope']);
        await makeRefreshToken(client2, user1, ['profile']);
        await makeRefreshToken(client2, user1, [
          'aaaSortMeFirst',
          'other',
          'scope',
        ]);
        await makeAccessToken(client2, user1, ['profile']);

        const clients = await oauthClients(user1);
        expect(clients.length).toBe(3);
        expect(clients[0].clientId).toBe(client2.id);
        expect(clients[0].scope).toEqual(['aaaSortMeFirst', 'other', 'scope']);
        expect(clients[0].refreshTokenId).toBeTruthy();
        expect(clients[1].clientId).toBe(client2.id);
        expect(clients[1].scope).toEqual(['profile']);
        expect(clients[1].refreshTokenId).toBeTruthy();
        expect(clients[2].clientId).toBe(client1.id);
        expect(clients[2].scope).toEqual(['other', 'profile', 'scope']);
        expect(clients[2].refreshTokenId).toBeNull();
      });

      it('does not list canGrant=1 clients that only have access tokens', async () => {
        client2.canGrant = true;
        await oauthServerDb.updateClient(client2);
        await makeAccessToken(client1, user1, ['profile']);
        await makeAccessToken(client2, user1, ['profile']);

        expect(await clientIds(user1)).toEqual([client1.id]);
      });

      it('lists canGrant=1 clients that have refresh tokens', async () => {
        client2.canGrant = true;
        await oauthServerDb.updateClient(client2);
        await makeAccessToken(client1, user1, ['profile']);
        await makeRefreshToken(client2, user1, ['profile']);

        expect(await clientIds(user1)).toEqual([client2.id, client1.id]);
      });

      it('requires a valid session token', async () => {
        await expect(
          user1.api.attachedClients(unique(32).toString('hex'))
        ).rejects.toMatchObject({ code: 401, errno: 110 });
      });
    });

    describe('POST /account/attached_client/destroy', () => {
      it('deletes all tokens of a target client id', async () => {
        await makeAccessToken(client1, user1, ['profile']);
        await makeRefreshToken(client2, user1, ['profile']);
        await makeRefreshToken(client2, user1, ['profile']);

        await user1.destroyAttachedClient({ clientId: client1.id });
        let clients = await oauthClients(user1);
        expect(clients.length).toBe(2);
        expect(clients[0].clientId).toBe(client2.id);

        await user1.destroyAttachedClient({ clientId: client2.id });
        clients = await oauthClients(user1);
        expect(clients.length).toBe(0);
      });

      it('deletes outstanding authorization codes for the client', async () => {
        const code = await oauthServerDb.generateCode({
          clientId: buf(client1.id),
          userId: buf(user1.uid),
          email: user1.email,
          scope: ScopeSet.fromArray(['profile']),
          authAt: 0,
        });
        expect(await oauthServerDb.getCode(code)).toBeTruthy();

        await user1.destroyAttachedClient({ clientId: client1.id });
        expect(await oauthServerDb.getCode(code)).toBeFalsy();
      });

      it('deletes a specific token of a target client id', async () => {
        await makeAccessToken(client1, user1, ['profile']);
        await makeRefreshToken(client2, user1, ['profile']);
        const tokenId = await makeRefreshToken(client2, user1, [
          'other',
          'scope',
        ]);

        await user1.destroyAttachedClient({
          clientId: client2.id,
          refreshTokenId: tokenId,
        });

        const clients = await oauthClients(user1);
        expect(clients.length).toBe(2);
        expect(clients[0].clientId).toBe(client2.id);
        expect(clients[0].scope).toEqual(['profile']);
        expect(clients[0].refreshTokenId).not.toBe(tokenId);
        expect(clients[1].clientId).toBe(client1.id);
        expect(clients[1].scope).toEqual(['profile']);
      });

      it('refuses to delete a token for the wrong client id', async () => {
        const tokenId = await makeRefreshToken(client2, user1, ['profile']);

        await expect(
          user1.destroyAttachedClient({
            clientId: client1.id,
            refreshTokenId: tokenId,
          })
        ).rejects.toMatchObject({ code: 400, errno: 182 });

        const clients = await oauthClients(user1);
        expect(clients.map((c: any) => c.refreshTokenId)).toEqual([tokenId]);
      });

      it('refuses to delete a token for the wrong user', async () => {
        const tokenId = await makeRefreshToken(client2, user1, ['profile']);

        await expect(
          user2.destroyAttachedClient({
            clientId: client2.id,
            refreshTokenId: tokenId,
          })
        ).rejects.toMatchObject({ code: 400, errno: 182 });

        const clients = await oauthClients(user1);
        expect(clients.map((c: any) => c.refreshTokenId)).toEqual([tokenId]);
      });
    });
  }
);
