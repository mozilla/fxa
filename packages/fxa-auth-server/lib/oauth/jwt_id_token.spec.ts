/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const jsonwebtoken = require('jsonwebtoken');

const { OauthError: AppError } = require('@fxa/accounts/errors');
const { config } = require('../../config');
const JWTIdToken = require('./jwt_id_token');
const { SIGNING_PEM, SIGNING_KID, SIGNING_ALG } = require('./keys');

const CLIENT_ID = '59cceb6f8c32317c';
const ISSUER = config.get('oauthServer.openid.issuer');
const USER_ID = 'bcbe7c934446fe13aae5be4afed3161d';

const NOW_IN_SECONDS = Math.round(Date.now() / 1000);
const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
const TEN_MINUTES_IN_SECONDS = 60 * 10;

describe('lib/jwt_id_token', () => {
  let claims: Record<string, any>;

  const sign = (claims: Record<string, any>, algorithm = SIGNING_ALG) => {
    const secret = algorithm === 'HS256' ? `${Date.now()}` : SIGNING_PEM;
    return jsonwebtoken.sign(claims, secret, { algorithm, keyid: SIGNING_KID });
  };

  const signAndAssertInvalid = async (
    claims: Record<string, any>,
    algorithm?: string
  ) => {
    const invalidToken = sign(claims, algorithm);
    await expect(
      JWTIdToken.verify(invalidToken, CLIENT_ID)
    ).rejects.toBeInstanceOf(AppError);
  };

  beforeEach(() => {
    const now = Math.round(Date.now() / 1000);
    claims = {
      iss: ISSUER,
      alg: SIGNING_ALG,
      aud: CLIENT_ID,
      exp: now + 100,
      sub: USER_ID,
      iat: now,
    };
  });

  describe('_isValidExp', () => {
    const invalidExpCases: [string, any][] = [
      ['NaN', NaN],
      ['undefined', undefined],
      ['a string', 'current time'],
    ];
    invalidExpCases.forEach(([label, value]) => {
      it(`fails if 'exp' is ${label}`, () => {
        expect(JWTIdToken._isValidExp(value)).toBe(false);
      });
    });
  });

  describe('verify', () => {
    it('fails if the input is not a JWT', async () => {
      await expect(
        JWTIdToken.verify('invalid token', CLIENT_ID)
      ).rejects.toBeInstanceOf(AppError);
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

    it(`fails if the Expiration Time Claim is missing`, async () => {
      delete claims.exp;
      await signAndAssertInvalid(claims);
    });

    it(`fails if the Expiration Time Claim is in the past`, async () => {
      claims.exp = NOW_IN_SECONDS - TEN_MINUTES_IN_SECONDS;
      await signAndAssertInvalid(claims);
    });

    it(`fails if the Expiration Time Claim is too far (more than five minutes) in the future`, async () => {
      claims.exp = NOW_IN_SECONDS + TEN_MINUTES_IN_SECONDS;
      await signAndAssertInvalid(claims);
    });

    it('succeeds if the token is expired but within the grace period', async () => {
      claims.exp = NOW_IN_SECONDS - TEN_MINUTES_IN_SECONDS;

      const recentlyExpiredToken = sign(claims);
      const result = await JWTIdToken.verify(
        recentlyExpiredToken,
        CLIENT_ID,
        ONE_DAY_IN_SECONDS
      );
      expect(result).toBeTruthy();
    });

    it('succeeds if valid', async () => {
      const validToken = sign(claims);
      const parsedClaims = await JWTIdToken.verify(validToken, CLIENT_ID);
      expect(parsedClaims).toEqual(claims);
    });
  });
});
