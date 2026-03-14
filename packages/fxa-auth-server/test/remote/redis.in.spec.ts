/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

const AccessToken = require('../../lib/oauth/db/accessToken');
const RefreshTokenMetadata = require('../../lib/oauth/db/refreshTokenMetadata');
const config = require('../../config').default.getProperties();
const mocks = require('../mocks');

const recordLimit = 20;
const prefix = 'test:';
const maxttl = 1337;
const redis = require('../../lib/redis')(
  {
    ...config.redis.accessTokens,
    ...config.redis.sessionTokens,
    password: config.redis.password,
    prefix,
    recordLimit,
    maxttl,
  },
  mocks.mockLog()
);

const downRedis = require('../../lib/redis')(
  { enabled: true, port: 1, timeoutMs: 10, lazyConnect: true },
  mocks.mockLog()
);
downRedis.redis.on('error', () => {});

const uid = 'uid1';
const sessionToken = {
  lastAccessTime: 1573067619720,
  location: {
    city: 'a',
    state: 'b',
    stateCode: 'c',
    country: 'd',
    countryCode: 'e',
  },
  uaBrowser: 'Firefox',
  uaBrowserVersion: '70.0',
  uaDeviceType: 'f',
  uaOS: 'Mac OS X',
  uaOSVersion: '10.14',
  id: 'token1',
};

describe('#integration - Redis', () => {
  afterAll(async () => {
    await redis.del(uid);
    await redis.close();
  });

  describe('touchSessionToken', () => {
    beforeEach(async () => {
      await redis.del(uid);
    });

    it('creates an entry for uid when none exists', async () => {
      const x = await redis.get(uid);
      expect(x).toBeNull();
      await redis.touchSessionToken(uid, sessionToken);
      const rawData = await redis.get(uid);
      expect(rawData).toBeTruthy();
    });

    it('appends a new token to an existing uid record', async () => {
      await redis.touchSessionToken(uid, sessionToken);
      await redis.touchSessionToken(uid, { ...sessionToken, id: 'token2' });
      const tokens = await redis.getSessionTokens(uid);
      expect(Object.keys(tokens)).toEqual([sessionToken.id, 'token2']);
    });

    it('updates existing tokens with new data', async () => {
      await redis.touchSessionToken(uid, { ...sessionToken, uaOS: 'Windows' });
      const tokens = await redis.getSessionTokens(uid);
      expect(tokens[sessionToken.id].uaOS).toBe('Windows');
    });

    it('trims trailing null fields from the stored value', async () => {
      await redis.touchSessionToken(uid, {
        id: 'token1',
        lastAccessTime: 1,
        location: null,
        uaBrowser: 'x',
        uaFormFactor: null,
      });
      const rawData = await redis.get(uid);
      expect(rawData).toBe(`{"token1":[1,null,"x"]}`);
    });

    it('only updates changed values', async () => {
      await redis.touchSessionToken(uid, {
        id: 'token1',
        lastAccessTime: 1,
        uaBrowser: 'x',
      });
      let rawData = await redis.get(uid);
      expect(rawData).toBe(`{"token1":[1,null,"x"]}`);

      await redis.touchSessionToken(uid, {
        id: 'token1',
        lastAccessTime: 2,
      });
      rawData = await redis.get(uid);
      expect(rawData).toBe(`{"token1":[2,null,"x"]}`);
    });
  });

  describe('getSessionTokens', () => {
    beforeEach(async () => {
      await redis.del(uid);
      await redis.touchSessionToken(uid, sessionToken);
    });

    it('returns an empty object for unknown uids', async () => {
      const tokens = await redis.getSessionTokens('x');
      expect(Object.keys(tokens)).toHaveLength(0);
    });

    it('returns tokens indexed by id', async () => {
      const tokens = await redis.getSessionTokens(uid);
      expect(Object.keys(tokens)).toEqual([sessionToken.id]);
      // token 'id' not included
      const s = { ...sessionToken } as any;
      delete s.id;
      expect(tokens[sessionToken.id]).toEqual(s);
    });

    it('returns empty for malformed entries', async () => {
      await redis.set(uid, 'YOLO!');
      const tokens = await redis.getSessionTokens(uid);
      expect(Object.keys(tokens)).toHaveLength(0);
    });

    it('deletes malformed entries', async () => {
      await redis.set(uid, 'YOLO!');
      await redis.getSessionTokens(uid);
      const nothing = await redis.get(uid);
      expect(nothing).toBeNull();
    });

    it('handles old (json) format entries', async () => {
      const oldFormat = {
        lastAccessTime: 42,
        uaBrowser: 'Firefox',
        uaBrowserVersion: '59',
        uaOS: 'Mac OS X',
        uaOSVersion: '10.11',
        uaDeviceType: null,
        uaFormFactor: null,
        location: {
          city: 'Bournemouth',
          state: 'England',
          stateCode: 'EN',
          country: 'United Kingdom',
          countryCode: 'GB',
        },
      };
      await redis.set(uid, JSON.stringify({ [uid]: oldFormat }));
      const tokens = await redis.getSessionTokens(uid);
      expect(tokens[uid]).toEqual(oldFormat);
    });
  });

  describe('pruneSessionTokens', () => {
    beforeEach(async () => {
      await redis.del(uid);
      await redis.touchSessionToken(uid, sessionToken);
      await redis.touchSessionToken(uid, { ...sessionToken, id: 'token2' });
    });

    it('does nothing for unknown uids', async () => {
      await redis.pruneSessionTokens('x');
      const tokens = await redis.getSessionTokens('x');
      expect(Object.keys(tokens)).toHaveLength(0);
    });

    it('does nothing for unknown token ids', async () => {
      await redis.pruneSessionTokens(uid, ['x', 'y']);
      const tokens = await redis.getSessionTokens(uid);
      expect(Object.keys(tokens)).toEqual([sessionToken.id, 'token2']);
    });

    it('deletes a given token id', async () => {
      await redis.pruneSessionTokens(uid, ['token2']);
      const tokens = await redis.getSessionTokens(uid);
      expect(Object.keys(tokens)).toEqual([sessionToken.id]);
    });

    it('deleted the uid record when no tokens remain', async () => {
      await redis.pruneSessionTokens(uid, [sessionToken.id, 'token2']);
      const rawData = await redis.get(uid);
      expect(rawData).toBeNull();
    });
  });

  describe('Access Tokens', () => {
    const timestamp = new Date('2020-02-19T22:20:58.271Z').getTime();
    let accessToken1: any;
    let accessToken2: any;

    beforeEach(async () => {
      // Scoped cleanup: only delete keys under our prefix, not the entire keyspace.
      // flushall() would wipe keys from other parallel test workers (e.g., TOTP setup keys).
      // keys('*') returns fully-prefixed keys, so strip the prefix before del() to avoid
      // double-prefixing.
      const keys = await redis.redis.keys('*');
      if (keys.length) {
        await redis.redis.del(...keys.map((k: string) => k.replace(prefix, '')));
      }
      accessToken2 = AccessToken.parse(
        JSON.stringify({
          clientId: '5678',
          name: 'client2',
          canGrant: false,
          publicClient: false,
          userId: '1234',
          email: 'hello@world.local',
          scope: 'profile',
          token: 'eeee',
          createdAt: timestamp - 1000,
          profileChangedAt: timestamp,
          expiresAt: Date.now() + 1000,
        })
      );
      accessToken1 = AccessToken.parse(
        JSON.stringify({
          clientId: 'abcd',
          name: 'client1',
          canGrant: false,
          publicClient: false,
          userId: '1234',
          email: 'hello@world.local',
          scope: 'profile',
          token: 'ffff',
          createdAt: timestamp - 1000,
          profileChangedAt: timestamp,
          expiresAt: Date.now() + 1000,
        })
      );
    });

    describe('setAccessToken', () => {
      it('creates an index set for the user', async () => {
        await redis.setAccessToken(accessToken1);
        const index = await redis.redis.smembers(
          accessToken1.userId.toString('hex')
        );
        expect(index).toEqual([
          prefix + accessToken1.tokenId.toString('hex'),
        ]);
      });

      it('appends to the index', async () => {
        await redis.setAccessToken(accessToken1);
        await redis.setAccessToken(accessToken2);
        const index = await redis.redis.smembers(
          accessToken2.userId.toString('hex')
        );
        expect(index.sort()).toEqual(
          [
            prefix + accessToken1.tokenId.toString('hex'),
            prefix + accessToken2.tokenId.toString('hex'),
          ].sort()
        );
      });

      it('sets the expiry on the token', async () => {
        await redis.setAccessToken(accessToken1);
        const ttl = await redis.redis.pttl(
          accessToken1.tokenId.toString('hex')
        );
        expect(ttl).toBeGreaterThanOrEqual(1);
        expect(ttl).toBeLessThanOrEqual(1000);
      });

      it('prunes the index by half of the limit when over', async () => {
        const tokenIds = new Array(recordLimit + 1)
          .fill(1)
          .map((_: any, i: number) => `token-${i}`);
        await redis.redis.sadd(
          accessToken1.userId.toString('hex'),
          ...tokenIds
        );
        await redis.setAccessToken(accessToken1);
        const count = await redis.redis.scard(
          accessToken1.userId.toString('hex')
        );
        expect(count).toBe(recordLimit / 2 + 2);
        const token = await redis.getAccessToken(accessToken1.tokenId);
        expect(token).toEqual(accessToken1);
      });

      it('prunes expired tokens when count % 5 == 0', async () => {
        // 1 real + 4 "expired"
        await redis.setAccessToken(accessToken1);
        const expiredIds = new Array(4)
          .fill(1)
          .map((_: any, i: number) => `token-${i}`);
        await redis.redis.sadd(
          accessToken1.userId.toString('hex'),
          ...expiredIds
        );
        await redis.setAccessToken(accessToken2);
        const count = await redis.redis.scard(
          accessToken1.userId.toString('hex')
        );
        expect(count).toBe(2);
        const token = await redis.getAccessToken(accessToken1.tokenId);
        expect(token).toEqual(accessToken1);
        const token2 = await redis.getAccessToken(accessToken2.tokenId);
        expect(token2).toEqual(accessToken2);
      });

      it('sets expiry on the index', async () => {
        await redis.setAccessToken(accessToken1);
        const ttl = await redis.redis.pttl(
          accessToken1.userId.toString('hex')
        );
        expect(ttl).toBeLessThanOrEqual(maxttl);
        expect(ttl).toBeGreaterThanOrEqual(maxttl - 10);
      });
    });

    describe('getAccessToken', () => {
      it('returns an AccessToken', async () => {
        await redis.setAccessToken(accessToken1);
        const token = await redis.getAccessToken(accessToken1.tokenId);
        expect(token).toBeInstanceOf(AccessToken);
        expect(token).toEqual(accessToken1);
      });

      it('returns null when not found', async () => {
        const token = await redis.getAccessToken(accessToken1.tokenId);
        expect(token).toBeNull();
      });
    });

    describe('getAccessTokens', () => {
      it('returns an array of AccessTokens', async () => {
        await redis.setAccessToken(accessToken1);
        await redis.setAccessToken(accessToken2);
        const tokens = await redis.getAccessTokens(accessToken2.userId);
        expect(tokens).toHaveLength(2);
        for (const token of tokens) {
          expect(token).toBeInstanceOf(AccessToken);
        }
      });

      it('returns an empty array when not found', async () => {
        const tokens = await redis.getAccessTokens(accessToken1.userId);
        expect(tokens).toHaveLength(0);
      });

      it('prunes missing tokens from the index', async () => {
        await redis.setAccessToken(accessToken1);
        await redis.setAccessToken(accessToken2);
        await redis.redis.del(accessToken1.tokenId.toString('hex'));
        const tokens = await redis.getAccessTokens(accessToken2.userId);
        expect(tokens).toEqual([accessToken2]);
        const index = await redis.redis.smembers(
          accessToken2.userId.toString('hex')
        );
        expect(index).toEqual([
          prefix + accessToken2.tokenId.toString('hex'),
        ]);
      });
    });

    describe('removeAccessToken', () => {
      it('deletes the token', async () => {
        await redis.setAccessToken(accessToken1);
        await redis.removeAccessToken(accessToken1.tokenId);
        const rawValue = await redis.get(accessToken1.tokenId.toString('hex'));
        expect(rawValue).toBeNull();
      });

      it('returns true when the token was deleted', async () => {
        await redis.setAccessToken(accessToken1);
        const done = await redis.removeAccessToken(accessToken1.tokenId);
        expect(done).toBe(true);
      });

      it('returns false for nonexistent tokens', async () => {
        const done = await redis.removeAccessToken(accessToken1.tokenId);
        expect(done).toBe(false);
      });
    });

    describe('removeAccessTokensForPublicClients', () => {
      it('does not remove non-public or non-grant tokens', async () => {
        await redis.setAccessToken(accessToken1);
        await redis.removeAccessTokensForPublicClients(accessToken1.userId);
        const tokens = await redis.getAccessTokens(accessToken1.userId);
        expect(tokens).toEqual([accessToken1]);
      });

      it('removes public tokens', async () => {
        accessToken1.publicClient = true;
        await redis.setAccessToken(accessToken1);
        await redis.setAccessToken(accessToken2);
        await redis.removeAccessTokensForPublicClients(accessToken1.userId);
        const tokens = await redis.getAccessTokens(accessToken1.userId);
        expect(tokens).toEqual([accessToken2]);
      });

      it('removes grant tokens', async () => {
        accessToken1.canGrant = true;
        await redis.setAccessToken(accessToken1);
        await redis.setAccessToken(accessToken2);
        await redis.removeAccessTokensForPublicClients(accessToken1.userId);
        const tokens = await redis.getAccessTokens(accessToken1.userId);
        expect(tokens).toEqual([accessToken2]);
      });

      it('does nothing for nonexistent tokens', async () => {
        await redis.removeAccessTokensForPublicClients(accessToken1.userId);
      });
    });

    describe('removeAccessTokensForUser', () => {
      it('removes all tokens for the user', async () => {
        await redis.setAccessToken(accessToken1);
        await redis.setAccessToken(accessToken2);
        await redis.removeAccessTokensForUser(accessToken1.userId);
        const tokens = await redis.getAccessTokens(accessToken1.userId);
        expect(tokens).toHaveLength(0);
      });

      it('does nothing for nonexistent users', async () => {
        await redis.removeAccessTokensForUser(accessToken1.userId);
      });
    });

    describe('removeAccessTokensForUserAndClient', () => {
      it('removes all tokens for the user', async () => {
        await redis.setAccessToken(accessToken1);
        await redis.setAccessToken(accessToken2);
        await redis.removeAccessTokensForUserAndClient(
          accessToken1.userId,
          accessToken1.clientId
        );
        const tokens = await redis.getAccessTokens(accessToken1.userId);
        expect(tokens).toEqual([accessToken2]);
      });

      it('does nothing for nonexistent users', async () => {
        await redis.removeAccessTokensForUserAndClient(
          accessToken1.userId,
          accessToken1.clientId
        );
      });

      it('does nothing for nonexistent clients', async () => {
        await redis.setAccessToken(accessToken1);
        await redis.removeAccessTokensForUserAndClient(
          accessToken2.userId,
          accessToken2.clientId
        );
        const tokens = await redis.getAccessTokens(accessToken1.userId);
        expect(tokens).toEqual([accessToken1]);
      });
    });
  });

  describe('Refresh Token Metadata', () => {
    const rtUid = '1234';
    const tokenId1 = '1111';
    const tokenId2 = '2222';
    const tokenId3 = '3333';
    let metadata: any;
    let oldMeta: any;

    beforeEach(async () => {
      // Scoped cleanup: only delete keys under our prefix, not the entire keyspace.
      const keys = await redis.redis.keys('*');
      if (keys.length) {
        await redis.redis.del(...keys.map((k: string) => k.replace(prefix, '')));
      }
      oldMeta = new RefreshTokenMetadata(
        new Date(Date.now() - (maxttl + 1000))
      );
      metadata = new RefreshTokenMetadata(new Date());
    });

    describe('setRefreshToken', () => {
      it('sets expiry', async () => {
        await redis.setRefreshToken(rtUid, tokenId1, metadata);
        const ttl = await redis.redis.pttl(rtUid);
        expect(ttl).toBeLessThanOrEqual(maxttl);
        expect(ttl).toBeGreaterThanOrEqual(maxttl - 1000);
      });

      it('prunes old tokens', async () => {
        await redis.setRefreshToken(rtUid, tokenId1, oldMeta);
        await redis.setRefreshToken(rtUid, tokenId2, oldMeta);

        await redis.setRefreshToken(rtUid, tokenId3, metadata);

        const tokens = await redis.getRefreshTokens(rtUid);
        expect(tokens).toEqual({
          [tokenId3]: metadata,
        });
      });

      it(`maxes out at ${recordLimit} recent tokens`, async () => {
        const tokenIds = new Array(recordLimit)
          .fill(1)
          .map((_: any, i: number) => `token-${i}`);
        for (const tokenId of tokenIds) {
          await redis.setRefreshToken(rtUid, tokenId, metadata);
        }
        const len = await redis.redis.hlen(rtUid);
        expect(len).toBe(recordLimit);
        await redis.setRefreshToken(rtUid, tokenId1, metadata);
        const tokens = await redis.getRefreshTokens(rtUid);
        expect(tokens).toEqual({
          [tokenId1]: metadata,
        });
      });
    });
  });
});

describe('Redis down', () => {
  beforeAll(async () => {
    try {
      await downRedis.redis.connect();
    } catch (e) {
      // this is expected
    }
  });

  afterAll(() => {
    downRedis.redis.disconnect();
  });

  describe('touchSessionToken', () => {
    it('returns without error', async () => {
      await expect(
        downRedis.touchSessionToken(uid, {})
      ).resolves.not.toThrow();
    });
  });

  describe('getSessionTokens', () => {
    it('returns an empty object without error', async () => {
      const tokens = await downRedis.getSessionTokens(uid);
      expect(Object.keys(tokens)).toHaveLength(0);
    });
  });

  describe('pruneSessionTokens', () => {
    it('throws a timeout error', async () => {
      try {
        await downRedis.pruneSessionTokens(uid);
      } catch (e: any) {
        expect(typeof e).toBe('object');
        expect(e.message).toBe('redis timeout');
        return;
      }
      throw new Error('should have thrown');
    });
  });
});
