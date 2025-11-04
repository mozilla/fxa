/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const buf = require('buf').hex;
const ScopeSet = require('fxa-shared').oauth.scopes;

const mockRefreshToken = (overrides) => {
  const now = new Date();
  return {
    clientId: buf('deadbeef'),
    tokenId: buf('abc123'),
    clientName: 'Test Client',
    createdAt: new Date(now.getTime() - 10000),
    lastUsedAt: now,
    scope: ScopeSet.fromArray(['profile:email', 'profile:uid']),
    ...overrides,
  };
};

const mockAccessToken = (overrides) => {
  const now = new Date();
  return {
    clientId: buf('deadbeef'),
    clientName: 'Test Client',
    createdAt: now,
    scope: ScopeSet.fromArray(['profile:email']),
    ...overrides,
  };
};

describe('authorized_clients', () => {
  let mockOauthDB;
  let mockOauthError;
  let authorizedClients;

  beforeEach(() => {
    mockOauthDB = {
      ready: sinon.stub().resolves(),
      getAccessTokensByUid: sinon.stub().resolves([]),
      getRefreshTokensByUid: sinon.stub().resolves([]),
      deleteClientRefreshToken: sinon.stub().resolves(true),
      deleteClientAuthorization: sinon.stub().resolves(),
    };

    mockOauthError = {
      unknownToken: sinon.stub().returns(new Error('Unknown token')),
    };

    authorizedClients = proxyquire('../../lib/oauth/authorized_clients', {
      './db': mockOauthDB,
      './error': mockOauthError,
    });
  });

  describe('listUnique', () => {
    const uid = buf('0123456789abcdef');
    const clientId1 = buf('deadbeef');
    const clientId2 = buf('cafebabe');
    const clientId3 = buf('feedface');

    it('should return an empty array when no tokens exist', async () => {
      mockOauthDB.getAccessTokensByUid.resolves([]);
      mockOauthDB.getRefreshTokensByUid.resolves([]);

      const result = await authorizedClients.listUnique(uid);

      assert.isArray(result);
      assert.lengthOf(result, 0);
      assert.isTrue(mockOauthDB.ready.calledOnce);
      assert.isTrue(mockOauthDB.getAccessTokensByUid.calledOnceWith(uid));
      assert.isTrue(mockOauthDB.getRefreshTokensByUid.calledOnceWith(uid));
    });

    it('should return a single client when only one refresh token exists', async () => {
      mockOauthDB.getRefreshTokensByUid.resolves([
        mockRefreshToken({ clientId: clientId1 }),
      ]);
      mockOauthDB.getAccessTokensByUid.resolves([]);

      const result = await authorizedClients.listUnique(uid);

      assert.lengthOf(result, 1);
      assert.equal(result[0].client_id, 'deadbeef');
      assert.equal(result[0].client_name, 'Test Client');
      assert.equal(result[0].refresh_token_id, 'abc123');
      assert.deepEqual(result[0].scope, ['profile:email', 'profile:uid']);
    });

    it('should return a single client when only one access token exists', async () => {
      mockOauthDB.getAccessTokensByUid.resolves([
        mockAccessToken({ clientId: clientId1 }),
      ]);
      mockOauthDB.getRefreshTokensByUid.resolves([]);

      const result = await authorizedClients.listUnique(uid);

      assert.lengthOf(result, 1);
      assert.equal(result[0].client_id, 'deadbeef');
      assert.equal(result[0].client_name, 'Test Client');
      assert.deepEqual(result[0].scope, ['profile:email']);
    });

    it('should deduplicate when multiple tokens exist for the same client', async () => {
      const now = new Date();
      const olderDate = new Date(now.getTime() - 50000);
      const newerDate = new Date(now.getTime() - 10000);

      mockOauthDB.getRefreshTokensByUid.resolves([
        mockRefreshToken({
          clientId: clientId1,
          createdAt: olderDate,
          lastUsedAt: olderDate,
        }),
        mockRefreshToken({
          clientId: clientId1,
          createdAt: newerDate,
          lastUsedAt: newerDate,
          // This should be the token that is returned
          // since this is the more recent token
          tokenId: buf('def456'),
        }),
      ]);

      const result = await authorizedClients.listUnique(uid);

      assert.lengthOf(result, 1);
      assert.equal(result[0].client_id, 'deadbeef');
      assert.equal(result[0].refresh_token_id, 'def456');
      assert.equal(result[0].last_access_time, newerDate.getTime());
    });

    it('should prioritize most recent token when access and refresh tokens exist for the same client', async () => {
      /**
       * I'm not actually sure about this behavior. From a code perspective, it works
       * but would we ever expect that an OAuth Client could have both a refresh
       * token and an access token?
       *
       * If so, then is there a priority of one over the other; refresh token vs. access token?
       * Currently, the endpoint only reutrns the ID and Last Access Time, so maybe the priority
       * is just "most recently accessed"
       */
      const now = new Date();
      const refreshTokenDate = new Date(now.getTime() - 50000);
      const accessTokenDate = new Date(now.getTime() - 10000);

      mockOauthDB.getRefreshTokensByUid.resolves([
        mockRefreshToken({
          clientId: clientId1,
          createdAt: new Date(now.getTime() - 100000),
          lastUsedAt: refreshTokenDate,
        }),
      ]);

      mockOauthDB.getAccessTokensByUid.resolves([
        mockAccessToken({
          clientId: clientId1,
          createdAt: accessTokenDate,
        }),
      ]);

      const result = await authorizedClients.listUnique(uid);

      assert.lengthOf(result, 1);
      assert.equal(result[0].last_access_time, accessTokenDate.getTime());
      assert.isUndefined(result[0].refresh_token_id);
    });

    it('should return multiple clients when tokens from different clients exist', async () => {
      const now = new Date();

      mockOauthDB.getRefreshTokensByUid.resolves([
        mockRefreshToken({
          clientId: clientId1,
          createdAt: new Date(now.getTime() - 50000),
          lastUsedAt: new Date(now.getTime() - 40000),
        }),
      ]);

      mockOauthDB.getAccessTokensByUid.resolves([
        mockAccessToken({
          clientId: clientId2,
          createdAt: new Date(now.getTime() - 30000),
        }),
        mockAccessToken({
          clientId: clientId3,
          createdAt: new Date(now.getTime() - 20000),
        }),
      ]);

      const result = await authorizedClients.listUnique(uid);

      assert.lengthOf(result, 3);

      const clientIds = result.map((c) => c.client_id);
      assert.includeMembers(clientIds, ['deadbeef', 'cafebabe', 'feedface']);
    });

    it('should handle mixed refresh and access tokens with proper deduplication', async () => {
      const now = new Date();

      // Client 1: has both refresh token (older) and access token (newer)
      // Client 2: has only refresh token
      // Client 3: has only access token
      mockOauthDB.getRefreshTokensByUid.resolves([
        mockRefreshToken({
          clientId: clientId1,
          tokenId: buf('abc123'),
          clientName: 'Client One',
          createdAt: new Date(now.getTime() - 100000),
          lastUsedAt: new Date(now.getTime() - 50000),
          scope: ScopeSet.fromArray(['profile:email']),
        }),
        mockRefreshToken({
          clientId: clientId2,
          tokenId: buf('def456'),
          clientName: 'Client Two',
          createdAt: new Date(now.getTime() - 80000),
          lastUsedAt: new Date(now.getTime() - 30000),
          scope: ScopeSet.fromArray(['profile:uid']),
        }),
      ]);

      mockOauthDB.getAccessTokensByUid.resolves([
        mockAccessToken({
          clientId: clientId1,
          clientName: 'Client One',
          createdAt: new Date(now.getTime() - 10000),
          scope: ScopeSet.fromArray(['profile']),
        }),
        mockAccessToken({
          clientId: clientId3,
          clientName: 'Client Three',
          createdAt: new Date(now.getTime() - 20000),
          scope: ScopeSet.fromArray(['profile:display_name']),
        }),
      ]);

      const result = await authorizedClients.listUnique(uid);

      assert.lengthOf(result, 3);

      const client1 = result.find((c) => c.client_id === 'deadbeef');
      const client2 = result.find((c) => c.client_id === 'cafebabe');
      const client3 = result.find((c) => c.client_id === 'feedface');

      assert.equal(client1.client_name, 'Client One');
      assert.isUndefined(client1.refresh_token_id);
      assert.equal(client1.last_access_time, now.getTime() - 10000);
      assert.deepEqual(client1.scope, ['profile']);

      assert.equal(client2.client_name, 'Client Two');
      assert.equal(client2.refresh_token_id, 'def456');
      assert.equal(client2.last_access_time, now.getTime() - 30000);

      assert.equal(client3.client_name, 'Client Three');
      assert.isUndefined(client3.refresh_token_id);
      assert.equal(client3.last_access_time, now.getTime() - 20000);
    });

    it('should set created_time and last_access_time correctly', async () => {
      const createdAt = new Date('2023-01-01T00:00:00Z');
      const lastUsedAt = new Date('2023-01-15T12:00:00Z');

      mockOauthDB.getRefreshTokensByUid.resolves([
        mockRefreshToken({
          clientId: clientId1,
          createdAt,
          lastUsedAt,
        }),
      ]);
      mockOauthDB.getAccessTokensByUid.resolves([]);

      const result = await authorizedClients.listUnique(uid);

      assert.lengthOf(result, 1);
      assert.equal(result[0].created_time, createdAt.getTime());
      assert.equal(result[0].last_access_time, lastUsedAt.getTime());
    });

    it('should use createdAt as lastUsedAt for access tokens', async () => {
      const createdAt = new Date('2023-01-01T00:00:00Z');

      mockOauthDB.getRefreshTokensByUid.resolves([]);
      mockOauthDB.getAccessTokensByUid.resolves([
        mockAccessToken({
          clientId: clientId1,
          createdAt,
        }),
      ]);

      const result = await authorizedClients.listUnique(uid);

      assert.lengthOf(result, 1);
      assert.equal(result[0].created_time, createdAt.getTime());
      assert.equal(result[0].last_access_time, createdAt.getTime());
    });
  });

  describe('destroy', () => {
    const clientId = 'deadbeef';
    const uid = buf('0123456789abcdef');
    const refreshTokenId = 'token123';

    it('should delete specific refresh token when refreshTokenId is provided', async () => {
      mockOauthDB.deleteClientRefreshToken.resolves(true);

      await authorizedClients.destroy(clientId, uid, refreshTokenId);

      assert.isTrue(mockOauthDB.ready.calledOnce);
      assert.isTrue(
        mockOauthDB.deleteClientRefreshToken.calledOnceWith(
          refreshTokenId,
          clientId,
          uid
        )
      );
      assert.isFalse(mockOauthDB.deleteClientAuthorization.called);
    });

    it('should throw error when refresh token not found', async () => {
      mockOauthDB.deleteClientRefreshToken.resolves(false);

      try {
        await authorizedClients.destroy(clientId, uid, refreshTokenId);
        assert.fail('Should have thrown an error');
      } catch (err) {
        assert.isTrue(mockOauthError.unknownToken.calledOnce);
        assert.equal(err.message, 'Unknown token');
      }
    });

    it('should delete all client authorization when refreshTokenId is not provided', async () => {
      await authorizedClients.destroy(clientId, uid);

      assert.isTrue(mockOauthDB.ready.calledOnce);
      assert.isTrue(
        mockOauthDB.deleteClientAuthorization.calledOnceWith(clientId, uid)
      );
      assert.isFalse(mockOauthDB.deleteClientRefreshToken.called);
    });
  });

  describe('list', () => {
    const uid = buf('0123456789abcdef');
    const clientId1 = buf('deadbeef');
    const clientId2 = buf('cafebabe');

    it('should return an empty array when no tokens exist', async () => {
      mockOauthDB.getAccessTokensByUid.resolves([]);
      mockOauthDB.getRefreshTokensByUid.resolves([]);

      const result = await authorizedClients.list(uid);

      assert.isArray(result);
      assert.lengthOf(result, 0);
    });

    it('should return refresh tokens as separate entries', async () => {
      const now = new Date();
      mockOauthDB.getRefreshTokensByUid.resolves([
        mockRefreshToken({
          clientId: clientId1,
          tokenId: buf('abc123'),
          createdAt: new Date(now.getTime() - 10000),
          lastUsedAt: now,
          scope: ScopeSet.fromArray(['profile:email']),
        }),
        mockRefreshToken({
          clientId: clientId1,
          tokenId: buf('def456'),
          createdAt: new Date(now.getTime() - 5000),
          lastUsedAt: now,
          scope: ScopeSet.fromArray(['profile:uid']),
        }),
      ]);
      mockOauthDB.getAccessTokensByUid.resolves([]);

      const result = await authorizedClients.list(uid);

      assert.lengthOf(result, 2);
      assert.equal(result[0].refresh_token_id, 'abc123');
      assert.equal(result[1].refresh_token_id, 'def456');
    });

    it('should merge access tokens for the same client into one entry', async () => {
      const now = new Date();
      mockOauthDB.getRefreshTokensByUid.resolves([]);
      mockOauthDB.getAccessTokensByUid.resolves([
        mockAccessToken({
          clientId: clientId1,
          createdAt: new Date(now.getTime() - 10000),
          clientCanGrant: false,
          scope: ScopeSet.fromArray(['profile:email']),
        }),
        mockAccessToken({
          clientId: clientId1,
          createdAt: new Date(now.getTime() - 5000),
          clientCanGrant: false,
          scope: ScopeSet.fromArray(['profile:uid']),
        }),
      ]);

      const result = await authorizedClients.list(uid);

      assert.lengthOf(result, 1);
      assert.isUndefined(result[0].refresh_token_id);
      assert.includeMembers(result[0].scope, ['profile:email', 'profile:uid']);
    });

    it('should not show access tokens for clients that already have refresh tokens', async () => {
      const now = new Date();
      mockOauthDB.getRefreshTokensByUid.resolves([
        mockRefreshToken({
          clientId: clientId1,
          tokenId: buf('abc123'),
          createdAt: now,
          lastUsedAt: now,
          scope: ScopeSet.fromArray(['profile:email']),
        }),
      ]);

      mockOauthDB.getAccessTokensByUid.resolves([
        mockAccessToken({
          clientId: clientId1,
          createdAt: now,
          clientCanGrant: false,
          scope: ScopeSet.fromArray(['profile:uid']),
        }),
      ]);

      const result = await authorizedClients.list(uid);

      assert.lengthOf(result, 1);
      assert.equal(result[0].refresh_token_id, 'abc123');
    });

    it('should not show access tokens for canGrant clients', async () => {
      mockOauthDB.getRefreshTokensByUid.resolves([]);
      mockOauthDB.getAccessTokensByUid.resolves([
        mockAccessToken({
          clientId: clientId1,
          clientCanGrant: true,
        }),
      ]);

      const result = await authorizedClients.list(uid);

      assert.lengthOf(result, 0);
    });

    it('should sort results by last_access_time, then client_name, then created_time', async () => {
      const now = new Date();
      mockOauthDB.getRefreshTokensByUid.resolves([
        mockRefreshToken({
          clientId: clientId1,
          tokenId: buf('abc123'),
          clientName: 'B Client',
          createdAt: new Date(now.getTime() - 30000),
          lastUsedAt: new Date(now.getTime() - 20000),
          scope: ScopeSet.fromArray(['profile:email']),
        }),
        mockRefreshToken({
          clientId: clientId2,
          tokenId: buf('def456'),
          clientName: 'A Client',
          createdAt: new Date(now.getTime() - 30000),
          lastUsedAt: new Date(now.getTime() - 10000),
          scope: ScopeSet.fromArray(['profile:uid']),
        }),
      ]);
      mockOauthDB.getAccessTokensByUid.resolves([]);

      const result = await authorizedClients.list(uid);

      assert.lengthOf(result, 2);
      assert.equal(result[0].client_name, 'A Client');
      assert.equal(result[1].client_name, 'B Client');
    });
  });
});
