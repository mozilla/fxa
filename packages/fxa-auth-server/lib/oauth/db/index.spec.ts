/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Covers how the OAuth DB reads and revokes access tokens. This is thin
 * orchestration over two injected clients, so it is worth covering here rather
 * than only in the infra-backed `test/remote/oauth_db.in.spec.ts` suite.
 */
const oauthDb = require('./index');

const MOCK_UID = 'f9416ce3703e4916a4cd6b1e665a3f1a';
const MOCK_TOKEN_ID = Buffer.from('a'.repeat(64), 'hex');
const MOCK_ACCESS_TOKEN = { tokenId: MOCK_TOKEN_ID, userId: MOCK_UID };
const REDIS_DOWN = new Error('ECONNREFUSED');

type RedisMock = {
  getAccessToken: jest.Mock;
  removeAccessToken: jest.Mock;
  getAccessTokens: jest.Mock;
  removeAccessTokensForUser: jest.Mock;
  removeRefreshTokensForUser: jest.Mock;
};

function buildRedisMock(): RedisMock {
  return {
    getAccessToken: jest.fn().mockResolvedValue(MOCK_ACCESS_TOKEN),
    removeAccessToken: jest.fn().mockResolvedValue(true),
    getAccessTokens: jest.fn().mockResolvedValue([MOCK_ACCESS_TOKEN]),
    removeAccessTokensForUser: jest.fn().mockResolvedValue(undefined),
    removeRefreshTokensForUser: jest.fn().mockResolvedValue(undefined),
  };
}

describe('lib/oauth/db - access tokens', () => {
  let redis: RedisMock;

  beforeEach(() => {
    redis = buildRedisMock();
    // Assign through `cache`/`db`, not `redis`/`mysql` — the latter are getters
    // over the former and have no setters.
    oauthDb.cache = redis;
    // `ready()` only seeds config-declared clients and scopes into MySQL.
    oauthDb.ready = jest.fn().mockResolvedValue(undefined);
  });

  describe('getAccessToken', () => {
    it('resolves the token held in redis', async () => {
      const result = await oauthDb.getAccessToken(MOCK_TOKEN_ID);

      expect(result).toEqual(MOCK_ACCESS_TOKEN);
      expect(redis.getAccessToken).toHaveBeenCalledWith(MOCK_TOKEN_ID);
    });

    // Redis reports a miss as `null`, but the removed MySQL fallback resolved
    // `undefined` (from `rows[0]`), and callers/tests depend on that. Without
    // this normalization the sentinel silently changes.
    //
    // This covers read *failures* too: RedisShared.getAccessToken catches its
    // own errors and returns null, so a failed read looks identical to a miss.
    // That errs the safe way — an unreadable token is rejected, never accepted.
    it('resolves undefined, not null, when redis reports a miss', async () => {
      redis.getAccessToken.mockResolvedValue(null);

      const result = await oauthDb.getAccessToken(MOCK_TOKEN_ID);

      expect(result).toBeUndefined();
      expect(result).not.toBeNull();
    });
  });

  describe('removeAccessToken', () => {
    it('revokes the token in redis by its tokenId', async () => {
      await oauthDb.removeAccessToken(MOCK_ACCESS_TOKEN);

      expect(redis.removeAccessToken).toHaveBeenCalledWith(MOCK_TOKEN_ID);
    });

    it.each([true, false])(
      'resolves redis’ "was it there" signal (%s)',
      async (wasPresent) => {
        redis.removeAccessToken.mockResolvedValue(wasPresent);

        await expect(
          oauthDb.removeAccessToken(MOCK_ACCESS_TOKEN)
        ).resolves.toBe(wasPresent);
      }
    );

    it('propagates a redis failure rather than reporting success', async () => {
      redis.removeAccessToken.mockRejectedValue(REDIS_DOWN);

      await expect(
        oauthDb.removeAccessToken(MOCK_ACCESS_TOKEN)
      ).rejects.toThrow(REDIS_DOWN);
    });
  });

  // Inherited from ConnectedServicesDb rather than overridden here, so these
  // also pin that the inherited implementation reads the same redis cache.
  describe('getAccessTokensByUid', () => {
    it('resolves exactly the tokens redis holds, with nothing merged in', async () => {
      const result = await oauthDb.getAccessTokensByUid(MOCK_UID);

      expect(result).toEqual([MOCK_ACCESS_TOKEN]);
      expect(redis.getAccessTokens).toHaveBeenCalledWith(MOCK_UID);
    });

    it('resolves an empty list when redis holds no tokens', async () => {
      redis.getAccessTokens.mockResolvedValue([]);

      await expect(oauthDb.getAccessTokensByUid(MOCK_UID)).resolves.toEqual([]);
    });
  });

  // `_removeTokensAndCodes` no longer deletes access tokens in MySQL, so this
  // redis revocation is the only thing standing between account deletion /
  // password reset and a live access token.
  describe('removeTokensAndCodes', () => {
    let mysql: { _removeTokensAndCodes: jest.Mock };

    beforeEach(() => {
      mysql = { _removeTokensAndCodes: jest.fn().mockResolvedValue(undefined) };
      oauthDb.db = mysql;
    });

    it('revokes the user’s access tokens in redis', async () => {
      await oauthDb.removeTokensAndCodes(MOCK_UID);

      expect(redis.removeAccessTokensForUser).toHaveBeenCalledWith(MOCK_UID);
    });

    it('also revokes refresh tokens and clears the MySQL rows', async () => {
      await oauthDb.removeTokensAndCodes(MOCK_UID);

      expect(redis.removeRefreshTokensForUser).toHaveBeenCalledWith(MOCK_UID);
      expect(mysql._removeTokensAndCodes).toHaveBeenCalledWith(MOCK_UID);
    });

    it('does not clear the MySQL rows if the redis revocation fails', async () => {
      redis.removeAccessTokensForUser.mockRejectedValue(REDIS_DOWN);

      await expect(oauthDb.removeTokensAndCodes(MOCK_UID)).rejects.toThrow(
        REDIS_DOWN
      );
      expect(mysql._removeTokensAndCodes).not.toHaveBeenCalled();
    });
  });
});
