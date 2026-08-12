/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mockDb = { getAccessToken: jest.fn() };
jest.mock('./db', () => mockDb);

const token = require('./token');
const JWTAccessToken = require('./jwt_access_token');
const ScopeSet = require('fxa-shared').oauth.scopes;
const { config } = require('../../config');

const OAUTH_ERRNO_INVALID_TOKEN = 108;
const OAUTH_ERRNO_EXPIRED_TOKEN = 115;
const EPOCH_CONFIG_KEY = 'oauthServer.expiration.accessTokenExpiryEpoch';

// An opaque (non-JWT) access token is looked up in the database.
const DB_BACKED_TOKEN = 'deadbeef';

function dbTokenExpiringAt(expiresAt: number) {
  return {
    expiresAt,
    userId: Buffer.from('00110011', 'hex'),
    clientId: Buffer.from('5882386c6d801776', 'hex'),
    scope: ScopeSet.fromString('https://identity.mozilla.com/apps/oldsync'),
    profileChangedAt: 8,
  };
}

describe('token', () => {
  describe('verify', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('verifies short lifespan JWT tokens without the db', async () => {
      const accessToken = await JWTAccessToken.create(
        {
          expiresAt: Date.now() + 10000,
          token: '01020304',
        },
        {
          clientId: Buffer.from('5882386c6d801776', 'hex'),
          scope: ScopeSet.fromString(
            'https://identity.mozilla.com/apps/oldsync'
          ),
          userId: Buffer.from('00110011', 'hex'),
          generation: 9,
          profileChangedAt: 8,
        }
      );
      const t = await token.verify(accessToken.jwt_token);
      expect(t.user).toBe('00110011');
      expect(t.client_id).toBe('5882386c6d801776');
      expect(t.scope.toString()).toBe(
        'https://identity.mozilla.com/apps/oldsync'
      );
      expect(t.generation).toBe(9);
      expect(t.profile_changed_at).toBe(8);
    });

    it('resolves a db-backed token that has not expired', async () => {
      mockDb.getAccessToken.mockResolvedValue(
        dbTokenExpiringAt(Date.now() + 10000)
      );
      const t = await token.verify(DB_BACKED_TOKEN);
      expect(t).toEqual({
        user: '00110011',
        client_id: '5882386c6d801776',
        scope: ScopeSet.fromString('https://identity.mozilla.com/apps/oldsync'),
        profile_changed_at: 8,
      });
    });

    it('rejects an expired db-backed token as expiredToken', async () => {
      mockDb.getAccessToken.mockResolvedValue(
        dbTokenExpiringAt(Date.now() - 1000)
      );
      await expect(token.verify(DB_BACKED_TOKEN)).rejects.toMatchObject({
        errno: OAUTH_ERRNO_EXPIRED_TOKEN,
      });
    });

    it('still rejects an expired db-backed token when the epoch is misconfigured to the future', async () => {
      mockDb.getAccessToken.mockResolvedValue(
        dbTokenExpiringAt(Date.now() - 1)
      );
      const actualGet = config.get.bind(config);
      jest.spyOn(config, 'get').mockImplementation((key: string) => {
        if (key === EPOCH_CONFIG_KEY) {
          return Date.now() + 100000;
        }
        return actualGet(key);
      });
      await expect(token.verify(DB_BACKED_TOKEN)).rejects.toMatchObject({
        errno: OAUTH_ERRNO_EXPIRED_TOKEN,
      });
    });

    it('rejects an expired short lifespan JWT token as invalidToken', async () => {
      const accessToken = await JWTAccessToken.create(
        {
          expiresAt: Date.now() - 100000,
          token: '01020304',
        },
        {
          clientId: Buffer.from('5882386c6d801776', 'hex'),
          scope: ScopeSet.fromString(
            'https://identity.mozilla.com/apps/oldsync'
          ),
          userId: Buffer.from('00110011', 'hex'),
        }
      );
      await expect(token.verify(accessToken.jwt_token)).rejects.toMatchObject({
        errno: OAUTH_ERRNO_INVALID_TOKEN,
      });
    });
  });
});
