/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const token = require('../../lib/oauth/token');
const JWTAccessToken = require('../../lib/oauth/jwt_access_token');
const ScopeSet = require('../../../fxa-shared/oauth/scopes');

describe('token', function () {
  describe('verify', function () {
    it('verifies short lifespan JWT tokens without the db', async function () {
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
      assert.equal(t.user, '00110011');
      assert.equal(t.client_id, '5882386c6d801776');
      assert.equal(
        t.scope.toString(),
        'https://identity.mozilla.com/apps/oldsync'
      );
      assert.equal(t.generation, 9);
      assert.equal(t.profile_changed_at, 8);
    });
  });
});
