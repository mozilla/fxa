/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const AppError = require('../lib/error');
const ScopeSet = require('fxa-shared').oauth.scopes;

describe('lib/jwt_access_token', () => {
  let JWTAccessToken;

  beforeEach(() => {
    JWTAccessToken = require('../lib/jwt_access_token');
  });

  describe('create', () => {
    let mockAccessToken;
    let mockJWT;

    let requestedGrant;
    let scope;

    beforeEach(() => {
      scope = ScopeSet.fromArray(['profile:uid', 'profile:email']);

      mockAccessToken = {
        expiresAt: Date.now() + 1000,
        scope,
        token: 'token',
        type: 'access_token',
      };

      requestedGrant = {
        clientId: 'foo',
        scope,
        userId: 'bar',
      };

      mockJWT = {
        sign: sinon.spy(async () => {
          return 'signed jwt access token';
        }),
      };

      JWTAccessToken = proxyquire('../lib/jwt_access_token', {
        './jwt': mockJWT,
      });
    });

    it('should return JWT format access token with the expected fields', async () => {
      const result = await JWTAccessToken.create(
        mockAccessToken,
        requestedGrant
      );

      assert.strictEqual(result.jwt_token, 'signed jwt access token');
      assert.isTrue(mockJWT.sign.calledOnce);

      const signedClaims = mockJWT.sign.args[0][0];
      assert.deepEqual(signedClaims.aud, ['foo']);
      assert.strictEqual(signedClaims.client_id, 'foo');
      assert.isAtLeast(signedClaims.exp, Math.floor(Date.now() / 1000));
      assert.isAtMost(signedClaims.iat, Math.floor(Date.now() / 1000));
      assert.strictEqual(signedClaims.scope, scope.toString());
      assert.strictEqual(signedClaims.sub, 'bar');
    });
  });

  describe('tokenId', () => {
    it('fails if JWT is invalid', async () => {
      try {
        await JWTAccessToken.tokenId('not a jwt');
        assert.fail();
      } catch (err) {
        assert.instanceOf(err, AppError);
        assert.equal(err.errno, 108);
      }
    });

    it('fails if JWT does not contain a jti', async () => {
      const jwt = await JWTAccessToken.sign({
        key: 'foo',
      });

      try {
        await JWTAccessToken.tokenId(jwt);
        assert.fail();
      } catch (err) {
        assert.instanceOf(err, AppError);
        assert.equal(err.errno, 108);
      }
    });

    it('returns jti if JWT is valid', async () => {
      const jwt = await JWTAccessToken.sign({
        jti: 'foo',
      });

      const tokenId = await JWTAccessToken.tokenId(jwt);
      assert.strictEqual(tokenId, 'foo');
    });
  });

  describe('verify', () => {
    it('fails if JWT is invalid', async () => {
      try {
        await JWTAccessToken.verify('invalid token');
        assert.fail();
      } catch (err) {
        assert.instanceOf(err, AppError);
        assert.equal(err.errno, 108);
      }
    });

    it('succeeds if valid', async () => {
      const jwt = await JWTAccessToken.sign({
        foo: 'bar',
      });

      const verifiedPayload = await JWTAccessToken.verify(jwt);
      assert.strictEqual(verifiedPayload.foo, 'bar');
    });
  });
});
