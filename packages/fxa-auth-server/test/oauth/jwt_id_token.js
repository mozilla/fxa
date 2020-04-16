/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const jsonwebtoken = require('jsonwebtoken');

const AppError = require('../../lib/oauth/error');
const config = require('../../config');
const JWTIdToken = require('../../lib/oauth/jwt_id_token');
const {
  SIGNING_PEM,
  SIGNING_KID,
  SIGNING_ALG,
} = require('../../lib/oauth/keys');

const CLIENT_ID = '59cceb6f8c32317c';
const ISSUER = config.get('oauthServer.openid.issuer');
const USER_ID = 'bcbe7c934446fe13aae5be4afed3161d';

describe('lib/jwt_id_token', () => {
  let claims;

  // Note: in order to verify that invalid issuer claims are caught, we need
  // to sign a claim with the wrong issuer. lib/oauth/jwt.js does not allow
  // the issuer to be set, so we need to use jsonwebtoken directly.
  const sign = (claims, algorithm = SIGNING_ALG) => {
    return jsonwebtoken.sign(claims, SIGNING_PEM, {
      algorithm,
      keyid: SIGNING_KID,
    });
  };

  // Helper function that signs a set of invalid claims, calls the verifier,
  // and expects (asserts) that the token verifier will throw an error.
  const signAndAssertInvalid = async (claims, algorithm) => {
    const invalidToken = sign(claims, algorithm);
    try {
      await JWTIdToken.verify(invalidToken, CLIENT_ID);
      assert.fail();
    } catch (err) {
      assert.instanceOf(err, AppError);
    }
  };

  beforeEach(() => {
    const now = Date.now() / 1000;
    claims = {
      iss: ISSUER,
      alg: SIGNING_ALG,
      aud: CLIENT_ID,
      exp: now + 1000,
      sub: USER_ID,
      iat: now,
    };
  });

  describe('verify', () => {
    it('fails if the input is not a JWT', async () => {
      try {
        await JWTIdToken.verify('invalid token', CLIENT_ID);
        assert.fail();
      } catch (err) {
        assert.instanceOf(err, AppError);
      }
    });

    it(`fails if the Issuer Claim doesn't match the expected issuer`, async () => {
      claims.iss = 'http://example.com';
      await signAndAssertInvalid(claims);
    });

    it(`fails if the Audience Claim doesn't match the client ID`, async () => {
      claims.aud = 'bad1bad1bad1bad1';
      await signAndAssertInvalid(claims);
    });

    it(`fails if the Audience Claim is a list that doesn't include the client ID`, async () => {
      claims.aud = ['bad1bad1bad1bad1', 'bad2bad2bad2bad2'];
      await signAndAssertInvalid(claims);
    });

    it(`fails if the Algorithm used isn't the expected default algorithm (RS256)`, async () => {
      const algorithm = 'HS256';
      await signAndAssertInvalid(claims, algorithm);
    });

    it(`fails if the Expiration Time Claim is in the past`, async () => {
      claims.exp = Math.round((Date.now() - 1000) / 1000);
      await signAndAssertInvalid(claims);
    });

    it('succeeds if valid', async () => {
      const validToken = sign(claims);
      const parsedClaims = await JWTIdToken.verify(validToken, CLIENT_ID);
      assert.deepEqual(parsedClaims, claims);
    });
  });
});
