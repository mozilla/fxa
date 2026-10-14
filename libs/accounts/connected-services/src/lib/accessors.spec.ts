/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  ConnectedServicesCache,
  ConnectedServicesDb,
  IAccessTokensCache,
  IConnectedServicesDbStore,
  IRefreshTokensCache,
  ISessionTokensCache,
} from './accessors';

const MOCK_ACCESS_TOKEN = Object.freeze({ tokenId: 'a'.repeat(64) });

describe('connected-services/accessors', () => {
  class TestDbStore implements IConnectedServicesDbStore {
    async getRefreshTokensByUid(uid: string): Promise<any> {
      return [{ tokenId: '1234' }];
    }
    // Deliberately not part of IConnectedServicesDbStore. It exists here only
    // so the cache-only contract for access tokens is pinned by an assertion
    // rather than merely by the interface's shape.
    async getAccessTokensByUid(uid: string): Promise<any> {
      throw new Error('access tokens must not be read from the database');
    }
    async close() {
      return;
    }
  }

  class TestTokenCache
    implements ISessionTokensCache, IAccessTokensCache, IRefreshTokensCache
  {
    async close(): Promise<void> {
      return;
    }
    async getRefreshTokens(uid: string | Buffer): Promise<any> {
      return [{ '1234': { foo: 'bar' } }];
    }
    async pruneRefreshTokens(
      uid: string | Buffer,
      tokenIdsToPrune: string[] | Buffer[]
    ): Promise<any> {
      return [];
    }
    async getSessionTokens(uid: string): Promise<any> {
      return [];
    }
    async getAccessToken(uid: string | Buffer): Promise<any> {
      return {};
    }
    async getAccessTokens(uid: string | Buffer): Promise<any> {
      return [MOCK_ACCESS_TOKEN];
    }
  }

  let db: ConnectedServicesDb;
  let cache: ConnectedServicesCache;

  let testDbStore: TestDbStore;
  let testTokenCache: TestTokenCache;

  const uid = '1234';

  beforeEach(() => {
    testDbStore = new TestDbStore();
    testTokenCache = new TestTokenCache();

    cache = new ConnectedServicesCache(
      testTokenCache,
      testTokenCache,
      testTokenCache
    );

    db = new ConnectedServicesDb(testDbStore, cache);

    jest.spyOn(testDbStore, 'getRefreshTokensByUid');
    jest.spyOn(testDbStore, 'getAccessTokensByUid');
    jest.spyOn(testTokenCache, 'getAccessToken');
    jest.spyOn(testTokenCache, 'getAccessTokens');
    jest.spyOn(testTokenCache, 'getRefreshTokens');
    jest.spyOn(testTokenCache, 'getSessionTokens');
    jest.spyOn(testTokenCache, 'pruneRefreshTokens');
  });

  describe('connected services database', () => {
    it('gets access tokens from the cache only', async () => {
      const result = await db.getAccessTokensByUid(uid);

      expect(result).toEqual([MOCK_ACCESS_TOKEN]);
      expect(testTokenCache.getAccessTokens).toHaveBeenCalledTimes(1);
      expect(testTokenCache.getAccessTokens).toHaveBeenCalledWith(uid);
      expect(testDbStore.getAccessTokensByUid).not.toHaveBeenCalled();
    });

    it('gets access refresh tokens', async () => {
      const result = await db.getRefreshTokensByUid(uid);

      expect(result).toHaveLength(1);
      expect(testTokenCache.getRefreshTokens).toHaveBeenCalledTimes(1);
      expect(testTokenCache.getRefreshTokens).toHaveBeenCalledWith(uid);
      expect(testDbStore.getRefreshTokensByUid).toHaveBeenCalledTimes(1);
      expect(testDbStore.getRefreshTokensByUid).toHaveBeenCalledWith(uid);
      expect(testTokenCache.pruneRefreshTokens).toHaveBeenCalledTimes(1);
    });
  });

  describe('connected services cache', () => {
    it('gets access token', async () => {
      const result = await cache.getAccessToken(uid);

      expect(result).not.toBeInstanceOf(Array);
      expect(testTokenCache.getAccessToken).toHaveBeenCalledTimes(1);
    });

    it('gets access tokens', async () => {
      const result = await cache.getAccessTokens(uid);

      expect(result).toEqual([MOCK_ACCESS_TOKEN]);
      expect(testTokenCache.getAccessTokens).toHaveBeenCalledTimes(1);
    });

    it('gets refresh tokens', async () => {
      const result = await cache.getRefreshTokens(uid);

      expect(result).toHaveLength(1);
      expect(testTokenCache.getRefreshTokens).toHaveBeenCalledTimes(1);
    });

    it('gets session tokens', async () => {
      const result = await cache.getSessionTokens(uid);

      expect(result).toHaveLength(0);
      expect(testTokenCache.getSessionTokens).toHaveBeenCalledTimes(1);
    });

    it('gets refresh token', async () => {
      await cache.pruneRefreshTokens(uid, ['key1']);

      expect(testTokenCache.pruneRefreshTokens).toHaveBeenCalledTimes(1);
    });
  });
});
