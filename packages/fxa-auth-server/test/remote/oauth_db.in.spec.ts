/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const crypto = require('crypto');

const buf = (v: any) => (Buffer.isBuffer(v) ? v : Buffer.from(v, 'hex'));
const hex = (v: any) => (Buffer.isBuffer(v) ? v.toString('hex') : v);
const ScopeSet = require('fxa-shared').oauth.scopes;

const encrypt = require('fxa-shared/auth/encrypt');
const db = require('../../lib/oauth/db');

const { config } = require('../../config');

function randomString(len: number) {
  return crypto.randomBytes(Math.ceil(len)).toString('hex');
}

describe('db', () => {
  beforeAll(async () => {
    // some other tests are not cleaning up their authorization codes
    await db.pruneAuthorizationCodes(1);
  });

  describe('utf-8', () => {
    function makeTest(clientId: string, clientName: string) {
      return async function () {
        const data = {
          id: clientId,
          name: clientName,
          hashedSecret: randomString(32),
          imageUri: 'https://example.domain/logo',
          redirectUri: 'https://example.domain/return?foo=bar',
          trusted: true,
        };

        const c = await db.registerClient(data);
        expect(c.id.toString('hex')).toBe(clientId);
        expect(c.name).toBe(clientName);
        const cli = await db.getClient(c.id);
        expect(cli.id.toString('hex')).toBe(clientId);
        expect(cli.name).toBe(clientName);
        await db.removeClient(clientId);
        const removed = await db.getClient(clientId);
        expect(removed).toBeUndefined();
      };
    }

    it('2-byte encoding preserved', makeTest(randomString(8), 'Düsseldorf'));
    it('3-byte encoding preserved', makeTest(randomString(8), '北京'));
    it('4-byte encoding throws with mysql', async () => {
      const data = {
        id: randomString(8),
        name: '𝄢',
        hashedSecret: randomString(32),
        imageUri: 'https://example.domain/logo',
        redirectUri: 'https://example.domain/return?foo=bar',
        trusted: true,
      };

      await expect(db.registerClient(data)).rejects.toMatchObject({
        code: 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD',
        errno: 1366,
      });
    });
  });

  describe('getEncodingInfo', () => {
    it('should use utf8', async () => {
      const info = await db.getEncodingInfo();
      expect(info['character_set_connection']).toBe('utf8mb4');
      expect(info['character_set_database']).toBe('utf8mb3');
      expect(info['collation_connection']).toBe('utf8mb4_unicode_ci');
      expect(info['collation_database']).toBe('utf8mb3_unicode_ci');
    });
  });

  describe('removeTokensAndCodes', () => {
    const clientId = buf(randomString(8));
    const userId = buf(randomString(16));
    const email = 'a@b.c';
    const scope = ScopeSet.fromArray(['no_scope']);
    let code: any = null;
    let token: any = null;
    let refreshToken: any = null;

    beforeAll(async () => {
      await db.registerClient({
        id: clientId,
        name: 'removeTokensAndCodesTest',
        hashedSecret: randomString(32),
        imageUri: 'https://example.domain/logo',
        redirectUri: 'https://example.domain/return?foo=bar',
        trusted: true,
      });
      code = await db.generateCode({
        clientId,
        userId,
        email,
        scope,
        authAt: 0,
      });
      const codeResult = await db.getCode(code);
      expect(hex(codeResult.userId)).toBe(hex(userId));
      const t = await db.generateAccessToken({
        clientId,
        userId,
        email,
        scope,
      });
      token = t.token;
      expect(hex(t.userId)).toBe(hex(userId));
      const rt = await db.generateRefreshToken({
        clientId,
        userId,
        email,
        scope,
      });
      refreshToken = rt.token;
      expect(hex(rt.userId)).toBe(hex(userId));
    });

    it('should get the right refreshToken', async () => {
      const hash = encrypt.hash(refreshToken);
      const t = await db.getRefreshToken(hash);
      expect(hex(t.tokenId)).toBe(hex(hash));
    });

    it('should delete tokens and codes for the given userId', async () => {
      await db.removeTokensAndCodes(userId);
      const c = await db.getCode(code);
      expect(c).toBeUndefined();
      const t = await db.getAccessToken(token);
      expect(t).toBeUndefined();
      const rt = await db.getRefreshToken(encrypt.hash(refreshToken));
      expect(rt).toBeUndefined();
    });
  });

  describe('removePublicAndCanGrantTokens', () => {
    async function testRemovalWithClient(clientOptions: any = {}) {
      const clientId = buf(randomString(8));
      const userId = buf(randomString(16));
      const email = 'a@b' + randomString(16) + ' + .c';
      const scope = ['no_scope'];

      await db.registerClient({
        id: clientId,
        name: 'removePublicAndCanGrantTokensTest',
        hashedSecret: randomString(32),
        imageUri: 'https://example.domain/logo',
        redirectUri: 'https://example.domain/return?foo=bar',
        trusted: true,
        canGrant: clientOptions.canGrant || false,
        publicClient: clientOptions.publicClient || false,
      });
      const t = await db.generateAccessToken({
        clientId,
        canGrant: clientOptions.canGrant,
        publicClient: clientOptions.publicClient,
        userId,
        email,
        scope,
      });
      const accessTokenId = encrypt.hash(t.token.toString('hex'));
      const rt = await db.generateRefreshToken({
        clientId,
        userId,
        email,
        scope,
      });
      const refreshTokenId = encrypt.hash(rt.token.toString('hex'));

      const tokens = await Promise.all([
        db.getRefreshToken(refreshTokenId),
        db.getAccessToken(accessTokenId),
      ]);
      expect(tokens[0].tokenId).toBeTruthy();
      expect(tokens[1].tokenId).toBeTruthy();
      await db.removePublicAndCanGrantTokens(hex(userId));
      return Promise.all([
        db.getRefreshToken(refreshTokenId),
        db.getAccessToken(accessTokenId),
      ]);
    }

    it.each([
      { canGrant: true, publicClient: false },
      { canGrant: false, publicClient: true },
      { canGrant: true, publicClient: true },
    ])(
      'revokes tokens when canGrant=$canGrant, publicClient=$publicClient',
      async (clientOptions) => {
        const tokens = await testRemovalWithClient(clientOptions);
        expect(tokens[0]).toBeUndefined();
        expect(tokens[1]).toBeUndefined();
      }
    );

    it('does not revoke tokens for not canGrant or not publicClient', async () => {
      const tokens = await testRemovalWithClient({
        canGrant: false,
        publicClient: false,
      });
      expect(tokens[0].tokenId).toBeTruthy();
      expect(tokens[1].tokenId).toBeTruthy();
    });
  });

  describe('refresh token lastUsedAt', () => {
    const clientId = buf(randomString(8));
    const userId = buf(randomString(16));
    const email = 'a@b.c';
    const scope = ['no_scope'];
    let refreshToken: any = null;
    let tokenId: any;

    beforeEach(async () => {
      await db.registerClient({
        id: clientId,
        name: 'lastUsedAtTest',
        hashedSecret: randomString(32),
        imageUri: 'https://example.domain/logo',
        redirectUri: 'https://example.domain/return?foo=bar',
        trusted: true,
      });
      refreshToken = await db.generateRefreshToken({
        clientId,
        userId,
        email,
        scope,
      });
      tokenId = refreshToken.tokenId;
    });

    afterEach(async () => {
      await db.removeClient(clientId);
    });

    describe('after touching a refresh token', () => {
      let tokenFirstUsage: any;

      beforeEach(async () => {
        tokenFirstUsage = {};
        const t = await db.getRefreshToken(tokenId);
        expect(hex(t.tokenId)).toBe(hex(tokenId));
        tokenFirstUsage.createdAt = new Date(t.createdAt);
        tokenFirstUsage.lastUsedAt = t.lastUsedAt;

        // ensures that creation and subsequent usage are at least 1s apart
        await new Promise((ok) => setTimeout(ok, 1000));

        await db.getRefreshToken(tokenId);
      });

      it('should report updated lastUsedAt when getting the token', async () => {
        const t = await db.getRefreshToken(tokenId);
        expect(hex(t.tokenId)).toBe(hex(tokenId));

        const updatedLastUsedAt = new Date(t.lastUsedAt);
        expect(updatedLastUsedAt > tokenFirstUsage.lastUsedAt).toBe(true);
        expect(t.createdAt.toString()).toBe(
          tokenFirstUsage.createdAt.toString()
        );
      });

      it('should report updated lastUsedAt when listing all tokens for a user', async () => {
        const ts = await db.getRefreshTokensByUid(userId);
        expect(ts.length).toBe(1);
        const t = ts[0];
        expect(hex(t.tokenId)).toBe(hex(tokenId));

        const updatedLastUsedAt = new Date(t.lastUsedAt);
        expect(updatedLastUsedAt > tokenFirstUsage.lastUsedAt).toBe(true);
        expect(t.createdAt.toString()).toBe(
          tokenFirstUsage.createdAt.toString()
        );
      });

      it('should not record updated lastUsedAt in mysql', async () => {
        const mysql = await db.mysql;
        const t = await mysql._getRefreshToken(tokenId);
        expect(hex(t.tokenId)).toBe(hex(tokenId));
        expect(
          Math.abs(
            t.lastUsedAt.getTime() - tokenFirstUsage.lastUsedAt.getTime()
          )
        ).toBeLessThanOrEqual(2000);
      });

      describe('after removing the refresh token', () => {
        beforeEach(async () => {
          await db.removeRefreshToken(refreshToken);
        });

        it('should not report that the token still exists', async () => {
          const t = await db.getRefreshToken(tokenId);
          expect(t).toBeFalsy();
        });

        it('should not include the token when listing tokens for a user', async () => {
          const ts = await db.getRefreshTokensByUid(userId);
          expect(ts.length).toBe(0);
        });
      });
    });
  });

  describe('scopes', () => {
    it('can register and fetch scopes', async () => {
      const scopeName = 'https://some-scope.mozilla.org/apps/' + Math.random();
      const notFoundScope = 'https://some-scope-404.mozilla.org';
      const newScope = {
        scope: scopeName,
        hasScopedKeys: true,
      };
      await db.registerScope(newScope);
      const notFound = await db.getScope(notFoundScope);
      expect(notFound).toBeFalsy();
      const result = await db.getScope(scopeName);
      expect(result).toEqual(newScope);
    });
  });

  describe('client-tokens', () => {
    describe('deleteClientAuthorization', () => {
      const clientId = buf(randomString(8));
      const userId = buf(randomString(16));

      it('should delete client tokens', async () => {
        const result = await db.deleteClientAuthorization(clientId, userId);
        expect(result).toBeTruthy();
      });
    });
  });

  describe('developers', () => {
    describe('removeDeveloper', () => {
      it('should not fail on non-existent developers', async () => {
        await db.removeDeveloper('unknown@developer.com');
      });

      it('should delete developers', async () => {
        const email = 'email' + randomString(10) + '@mozilla.com';
        const developer = await db.activateDeveloper(email);
        expect(developer.email).toBe(email);
        await db.removeDeveloper(email);
        const removed = await db.getDeveloper(email);
        expect(removed).toBeFalsy();
      });
    });

    describe('getDeveloper', () => {
      it('should return null if developer does not exit', async () => {
        const developer = await db.getDeveloper('unknown@developer.com');
        expect(developer).toBeFalsy();
      });

      it('should throw on empty email', async () => {
        await expect(db.getDeveloper()).rejects.toThrow('Email is required');
      });
    });

    describe('activateDeveloper and getDeveloper', () => {
      it('should create developers', async () => {
        const email = 'email' + randomString(10) + '@mozilla.com';
        const developer = await db.activateDeveloper(email);
        expect(developer.email).toBe(email);
      });

      it('should not allow duplicates', async () => {
        const email = 'email' + randomString(10) + '@mozilla.com';
        await db.activateDeveloper(email);
        await expect(db.activateDeveloper(email)).rejects.toThrow(
          expect.objectContaining({
            message: expect.stringContaining('ER_DUP_ENTRY'),
          })
        );
      });

      it('should throw on empty email', async () => {
        await expect(db.activateDeveloper()).rejects.toThrow(
          'Email is required'
        );
      });
    });

    describe('registerClientDeveloper and developerOwnsClient', () => {
      const clientId = buf(randomString(8));
      const userId = buf(randomString(16));
      const email = 'a@b.c';
      const scope = ['no_scope'];

      beforeAll(async () => {
        await db.registerClient({
          id: clientId,
          name: 'registerClientDeveloper',
          hashedSecret: randomString(32),
          imageUri: 'https://example.domain/logo',
          redirectUri: 'https://example.domain/return?foo=bar',
          trusted: true,
        });
        const code = await db.generateCode({
          clientId,
          userId,
          email,
          scope,
          authAt: 0,
        });
        const codeResult = await db.getCode(code);
        expect(hex(codeResult.userId)).toBe(hex(userId));
        const t = await db.generateAccessToken({
          clientId,
          userId,
          email,
          scope,
        });
        expect(hex(t.userId)).toBe(hex(userId));
      });

      it('should attach a developer to a client', async () => {
        const email = 'email' + randomString(10) + '@mozilla.com';
        const developer = await db.activateDeveloper(email);
        await db.registerClientDeveloper(
          hex(developer.developerId),
          hex(clientId)
        );
        const developers = await db.getClientDevelopers(hex(clientId));
        expect(developers).toBeTruthy();
        expect(developers.some((dev: any) => dev.email === email)).toBe(true);
      });
    });
  });

  describe('pruneAuthorizationCodes', () => {
    const clientId = buf(randomString(8));
    const userId = buf(randomString(16));
    const scope = ScopeSet.fromArray(['no_scope']).toString();
    const QUERY_CODE_INSERT =
      'INSERT INTO codes (code, clientId, userId, scope, createdAt) VALUES (?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? SECOND ))';

    const insertAuthzCode = async (ageInMs: number) => {
      await db.mysql._query(QUERY_CODE_INSERT, [
        randomString(16),
        clientId,
        userId,
        scope,
        ageInMs / 1000,
      ]);
    };

    it('prunes codes older than the given ttl', async () => {
      const ttl = 598989;
      const pruneCodesCount = 3;
      for (let i = 0; i < pruneCodesCount; i++) {
        await insertAuthzCode(ttl + 1000);
      }
      const validCodesCount = 2;
      for (let i = 0; i < validCodesCount; i++) {
        await insertAuthzCode(1);
      }
      const res = await db.pruneAuthorizationCodes(ttl);
      expect(res.pruned).toBe(pruneCodesCount);
    });

    it('prunes codes older than the default ttl', async () => {
      const ttl = config.get('oauthServer.expiration.code');
      const codesCount = 7;
      for (let i = 0; i < codesCount; i++) {
        await insertAuthzCode(ttl + 1000);
      }
      const res = await db.pruneAuthorizationCodes();
      expect(res.pruned).toBe(codesCount);
    });
  });

  describe('deleteClientRefreshToken', () => {
    it('revokes the refresh token and any access tokens for the client_id, uid pair', async () => {
      const clientId = randomString(8);
      const userId = randomString(16);
      const email = 'a@b' + randomString(16) + ' + .c';
      const scope = ['no_scope'];

      await db.registerClient({
        id: clientId,
        name: 'deleteClientRefreshTokenTest',
        hashedSecret: randomString(32),
        imageUri: 'https://example.domain/logo',
        redirectUri: 'https://example.domain/return?foo=bar',
        trusted: true,
        canGrant: false,
        publicClient: false,
      });
      const accessToken = await db.generateAccessToken({
        clientId: buf(clientId),
        userId: buf(userId),
        email,
        scope,
      });
      const refreshToken = await db.generateRefreshToken({
        clientId: buf(clientId),
        userId: buf(userId),
        email,
        scope,
      });
      const refreshTokenIdHash = encrypt.hash(
        refreshToken.token.toString('hex')
      );

      const wasRevoked = await db.deleteClientRefreshToken(
        hex(refreshTokenIdHash),
        clientId,
        userId
      );
      expect(wasRevoked).toBe(true);

      expect(await db.getRefreshToken(refreshTokenIdHash)).toBeFalsy();

      const tokenIdHash = hex(encrypt.hash(accessToken.token.toString('hex')));
      expect(await db.getAccessToken(tokenIdHash)).toBeFalsy();
    });
  });

  describe('uniqueRefreshTokens', () => {
    const clientId = buf(randomString(8));
    const userId = buf(randomString(16));
    const email = 'a@b.c';
    const scope = ['no_scope'];
    let tokens: any[] = [];

    beforeEach(async () => {
      tokens = [];
      for (let i = 0; i < 3; i++) {
        const refreshToken = await db.generateRefreshToken({
          clientId,
          userId,
          email,
          scope,
        });
        tokens.push(refreshToken);
      }
    });

    afterEach(async () => {
      for (const token of tokens) {
        await db.removeRefreshToken(token);
      }
      tokens = [];
    });

    it('can fetch unique refresh tokens for a user with the latest lastUsedAt', async () => {
      const now = new Date('2020-01-20T12:00:00Z');
      const lastUsedAtValues = [
        new Date(now.getTime() - 30000),
        new Date(now.getTime() - 20000),
        new Date(now.getTime() - 10000),
      ];
      for (let i = 0; i < tokens.length; i++) {
        const lastUsedAt = lastUsedAtValues[i];
        const rows = await db.mysql._touchRefreshToken(
          tokens[i].tokenId,
          lastUsedAt
        );
        expect(rows.affectedRows).toBe(1);
      }
      const token = await db.getUniqueRefreshTokensByUid(hex(userId));
      expect(token.length).toBe(1);
      expect(token[0].lastUsedAt.getTime()).toBe(lastUsedAtValues[2].getTime());
    });
  });
});
