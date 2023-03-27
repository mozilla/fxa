/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { assert } from 'chai';
import Sinon, { SinonSpiedInstance } from 'sinon';

import {
  ConnectedServicesCache,
  ConnectedServicesDb,
  IAccessTokensCache,
  IConnectedServicesDbStore,
  IRefreshTokensCache,
  ISessionTokensCache,
} from '../../connected-services';

describe('connected-services/accessors', () => {
  class TestDbStore implements IConnectedServicesDbStore {
    async getRefreshTokensByUid(uid: string): Promise<any> {
      return [{ tokenId: '1234' }];
    }
    async getAccessTokensByUid(uid: string): Promise<any> {
      return [];
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
      return [];
    }
  }

  let db: ConnectedServicesDb;
  let cache: ConnectedServicesCache;

  let testDbStore: TestDbStore;
  let testTokenCache: TestTokenCache;

  let stubDbStore: SinonSpiedInstance<TestDbStore>;
  let stubTokenCache: SinonSpiedInstance<TestTokenCache>;

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

    stubDbStore = Sinon.spy(testDbStore);
    stubTokenCache = Sinon.spy(testTokenCache);
  });

  describe('connected services database', () => {
    it('gets access tokens', async () => {
      const uid = '1234';
      const result = await db.getAccessTokensByUid('1234');

      Sinon.assert.calledOnceWithExactly(stubTokenCache.getAccessTokens, uid);
      Sinon.assert.calledOnceWithExactly(stubDbStore.getAccessTokensByUid, uid);
    });

    it('gets access refresh tokens', async () => {
      const result = await db.getRefreshTokensByUid(uid);

      assert.lengthOf(result, 1);
      Sinon.assert.calledOnceWithExactly(stubTokenCache.getRefreshTokens, uid);
      Sinon.assert.calledOnceWithExactly(
        stubDbStore.getRefreshTokensByUid,
        uid
      );
      Sinon.assert.calledOnce(stubTokenCache.pruneRefreshTokens);
    });
  });

  describe('connected services cache', async () => {
    it('gets accesss token', async () => {
      const result = await cache.getAccessToken(uid);

      assert.notInstanceOf(result, Array);
      Sinon.assert.calledOnce(stubTokenCache.getAccessToken);
    });

    it('gets accesss tokens', async () => {
      const result = await cache.getAccessTokens(uid);

      assert.instanceOf(result, Array);
      assert.lengthOf(result, 0);
      Sinon.assert.calledOnce(stubTokenCache.getAccessTokens);
    });

    it('gets refresh tokens', async () => {
      const result = await cache.getRefreshTokens(uid);

      assert.lengthOf(result, 1);
      Sinon.assert.calledOnce(stubTokenCache.getRefreshTokens);
    });

    it('gets session tokens', async () => {
      const result = await cache.getSessionTokens(uid);

      assert.lengthOf(result, 0);
      Sinon.assert.calledOnce(stubTokenCache.getSessionTokens);
    });

    it('gets refresh token', async () => {
      await cache.pruneRefreshTokens(uid, ['key1']);

      Sinon.assert.calledOnce(stubTokenCache.pruneRefreshTokens);
    });
  });
});
