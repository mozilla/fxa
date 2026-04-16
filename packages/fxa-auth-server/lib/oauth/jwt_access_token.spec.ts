/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const ScopeSet = require('fxa-shared').oauth.scopes;
const { OAUTH_SCOPE_OLD_SYNC } = require('fxa-shared/oauth/constants');
const TOKEN_SERVER_URL =
  require('../../config').default.get('syncTokenserverUrl');

describe('lib/jwt_access_token', () => {
  let JWTAccessToken: any;

  beforeEach(() => {
    jest.resetModules();
    JWTAccessToken = require('./jwt_access_token');
  });

  describe('create', () => {
    let mockAccessToken: any;
    let mockJWT: any;
    let requestedGrant: any;
    let scope: any;

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
        sign: jest.fn(async () => {
          return 'signed jwt access token';
        }),
      };

      jest.resetModules();
      jest.doMock('./jwt', () => mockJWT);
      JWTAccessToken = require('./jwt_access_token');
    });

    it('should return JWT format access token with the expected fields', async () => {
      // Set expiresAt right before calling create() to avoid clock drift
      // between beforeEach and the test body under slow CI runners.
      mockAccessToken.expiresAt = Date.now() + 1000;
      const beforeSec = Math.floor(Date.now() / 1000);
      const result = await JWTAccessToken.create(
        mockAccessToken,
        requestedGrant
      );
      const afterSec = Math.floor(Date.now() / 1000);

      expect(result.jwt_token).toBe('signed jwt access token');
      expect(mockJWT.sign).toHaveBeenCalledTimes(1);

      const signedClaims = mockJWT.sign.mock.calls[0][0];
      expect(Object.keys(signedClaims)).toHaveLength(7);
      expect(signedClaims.aud).toBe('deadbeef');
      expect(signedClaims.client_id).toBe('deadbeef');
      expect(signedClaims.iat).toBeGreaterThanOrEqual(beforeSec);
      expect(signedClaims.iat).toBeLessThanOrEqual(afterSec);
      expect(signedClaims.exp).toBeGreaterThanOrEqual(beforeSec + 1);
      expect(signedClaims.exp).toBeLessThanOrEqual(afterSec + 1);
      expect(signedClaims.scope).toBe(scope.toString());
      expect(signedClaims.sub).toBe('feedcafe');
    });

    it('should propagate `resource` and `clientId` in the `aud` claim', async () => {
      requestedGrant.resource = 'https://resource.server1.com';
      await JWTAccessToken.create(mockAccessToken, requestedGrant);
      const signedClaims = mockJWT.sign.mock.calls[0][0];
      expect(signedClaims.aud).toEqual([
        'deadbeef',
        'https://resource.server1.com',
      ]);
    });

    it('should propagate `fxa-subscriptions`', async () => {
      requestedGrant['fxa-subscriptions'] = ['subscription1', 'subscription2'];
      await JWTAccessToken.create(mockAccessToken, requestedGrant);
      const signedClaims = mockJWT.sign.mock.calls[0][0];
      expect(Object.keys(signedClaims)).toHaveLength(8);

      expect(signedClaims['fxa-subscriptions']).toBe(
        'subscription1 subscription2'
      );
    });

    it('should propagate `fxa-generation`', async () => {
      requestedGrant.generation = 12345;
      await JWTAccessToken.create(mockAccessToken, requestedGrant);
      const signedClaims = mockJWT.sign.mock.calls[0][0];

      expect(signedClaims['fxa-generation']).toBe(requestedGrant.generation);
    });

    it('should propagate `fxa-profileChangedAt`', async () => {
      requestedGrant.profileChangedAt = 12345;
      await JWTAccessToken.create(mockAccessToken, requestedGrant);
      const signedClaims = mockJWT.sign.mock.calls[0][0];

      expect(signedClaims['fxa-profileChangedAt']).toBe(
        requestedGrant.profileChangedAt
      );
    });

    it('defaults oldsync scope to tokenserver audience', async () => {
      requestedGrant.scope = ScopeSet.fromString(OAUTH_SCOPE_OLD_SYNC);
      await JWTAccessToken.create(mockAccessToken, requestedGrant);
      const signedClaims = mockJWT.sign.mock.calls[0][0];

      expect(signedClaims.aud).toBe(TOKEN_SERVER_URL);
    });
  });

  // Shared mock setup for tokenId and verify tests since the test
  // environment has no signing keys configured.
  function setupMockJWT() {
    const TOKEN_PREFIX = 'mock-jwt:';

    jest.resetModules();
    jest.doMock('./jwt', () => ({
      sign(claims: any) {
        return TOKEN_PREFIX + JSON.stringify(claims);
      },
      async verify(token: string) {
        if (!token.startsWith(TOKEN_PREFIX)) {
          throw new Error('Invalid token');
        }
        return JSON.parse(token.slice(TOKEN_PREFIX.length));
      },
    }));
    JWTAccessToken = require('./jwt_access_token');
  }

  describe('tokenId', () => {
    beforeEach(setupMockJWT);

    it('fails if JWT is invalid', async () => {
      await expect(JWTAccessToken.tokenId('not a jwt')).rejects.toHaveProperty(
        'errno',
        108
      );
    });

    it('fails if JWT does not contain a jti', async () => {
      const jwt = await JWTAccessToken.sign({ key: 'foo' });
      await expect(JWTAccessToken.tokenId(jwt)).rejects.toHaveProperty(
        'errno',
        108
      );
    });

    it('returns jti if JWT is valid', async () => {
      const jwt = await JWTAccessToken.sign({ jti: 'foo' });
      const tokenId = await JWTAccessToken.tokenId(jwt);
      expect(tokenId).toBe('foo');
    });
  });

  describe('verify', () => {
    beforeEach(setupMockJWT);

    it('fails if JWT is invalid', async () => {
      await expect(
        JWTAccessToken.verify('invalid token')
      ).rejects.toHaveProperty('errno', 108);
    });

    it('succeeds if valid', async () => {
      const jwt = await JWTAccessToken.sign({ foo: 'bar' });
      const verifiedPayload = await JWTAccessToken.verify(jwt);
      expect(verifiedPayload.foo).toBe('bar');
    });
  });
});
