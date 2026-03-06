export {};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const token = require('./token');
const JWTAccessToken = require('./jwt_access_token');
const ScopeSet = require('fxa-shared').oauth.scopes;

describe('token', () => {
  describe('verify', () => {
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
  });
});
