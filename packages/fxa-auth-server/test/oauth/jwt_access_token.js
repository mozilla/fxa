/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';

import sinon from 'sinon';
import proxyquire from 'proxyquire';
import AppError from '../../lib/oauth/error';
import ScopeSetModule from "fxa-shared";
const ScopeSet = ScopeSetModule.oauth.scopes;
import { OAUTH_SCOPE_OLD_SYNC } from 'fxa-shared/oauth/constants';
import TOKEN_SERVER_URLModule from "../../config";
const TOKEN_SERVER_URL = TOKEN_SERVER_URLModule.default.get('syncTokenserverUrl');

describe('lib/jwt_access_token', () => {
  let JWTAccessToken;

  beforeEach(() => {
    JWTAccessToken = require('../../lib/oauth/jwt_access_token');
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
        clientId: Buffer.from('deadbeef', 'hex'),
        scope,
        userId: Buffer.from('feedcafe', 'hex'),
      };

      mockJWT = {
        sign: sinon.spy(async () => {
          return 'signed jwt access token';
        }),
      };

      JWTAccessToken = proxyquire('../../lib/oauth/jwt_access_token', {
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
      assert.lengthOf(Object.keys(signedClaims), 7);
      assert.strictEqual(signedClaims.aud, 'deadbeef');
      assert.strictEqual(signedClaims.client_id, 'deadbeef');
      assert.isAtLeast(signedClaims.exp, Math.floor(Date.now() / 1000));
      assert.isAtMost(signedClaims.iat, Math.floor(Date.now() / 1000));
      assert.strictEqual(signedClaims.scope, scope.toString());
      assert.strictEqual(signedClaims.sub, 'feedcafe');
    });

    it('should propagate `resource` and `clientId` in the `aud` claim', async () => {
      requestedGrant.resource = 'https://resource.server1.com';
      await JWTAccessToken.create(mockAccessToken, requestedGrant);
      const signedClaims = mockJWT.sign.args[0][0];
      assert.deepEqual(signedClaims.aud, [
        'deadbeef',
        'https://resource.server1.com',
      ]);
    });

    it('should propagate `fxa-subscriptions`', async () => {
      requestedGrant['fxa-subscriptions'] = ['subscription1', 'subscription2'];
      await JWTAccessToken.create(mockAccessToken, requestedGrant);
      const signedClaims = mockJWT.sign.args[0][0];
      assert.lengthOf(Object.keys(signedClaims), 8);

      assert.deepEqual(
        signedClaims['fxa-subscriptions'],
        'subscription1 subscription2'
      );
    });

    it('should propagate `fxa-generation`', async () => {
      requestedGrant.generation = 12345;
      await JWTAccessToken.create(mockAccessToken, requestedGrant);
      const signedClaims = mockJWT.sign.args[0][0];

      assert.equal(signedClaims['fxa-generation'], requestedGrant.generation);
    });

    it('should propagate `fxa-profileChangedAt`', async () => {
      requestedGrant.profileChangedAt = 12345;
      await JWTAccessToken.create(mockAccessToken, requestedGrant);
      const signedClaims = mockJWT.sign.args[0][0];

      assert.equal(
        signedClaims['fxa-profileChangedAt'],
        requestedGrant.profileChangedAt
      );
    });

    it('defaults oldsync scope to tokenserver audience', async () => {
      requestedGrant.scope = ScopeSet.fromString(OAUTH_SCOPE_OLD_SYNC);
      await JWTAccessToken.create(mockAccessToken, requestedGrant);
      const signedClaims = mockJWT.sign.args[0][0];

      assert.equal(signedClaims.aud, TOKEN_SERVER_URL);
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
