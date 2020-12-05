/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const jsonwebtoken = require('jsonwebtoken');
const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };

const AppError = require('../../lib/oauth/error');
const config = require('../../config');
const JWTIdToken = require('../../lib/oauth/jwt_id_token');
const P = require('../../lib/promise');
const mocks = require('../mocks');
let hasTotp = true;
const mockOtp = {
  hasTotpToken: () => P.resolve(hasTotp),
};
const {
  SIGNING_PEM,
  SIGNING_KID,
  SIGNING_ALG,
} = require('../../lib/oauth/keys');

const CLIENT_ID = '59cceb6f8c32317c';
const ISSUER = config.get('oauthServer.openid.issuer');
const USER_ID = 'bcbe7c934446fe13aae5be4afed3161d';

const NOW_IN_SECONDS = Math.round(Date.now() / 1000);
const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
const TEN_MINUTES_IN_SECONDS = 60 * 10;

describe('lib/jwt_id_token', () => {
  let claims, mockLog;

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
  // The `loggedError` is specific to each validation error, and tells us
  // that the token failed validation for the expected reason.
  const signAndAssertInvalid = async (claims, loggedError, algorithm) => {
    const invalidToken = sign(claims, algorithm);
    try {
      await JWTIdToken.verify(
        invalidToken,
        CLIENT_ID,
        mocks.mockDB(),
        mockOtp,
        mockLog
      );
      assert.fail();
    } catch (err) {
      assert.instanceOf(err, AppError);
      assert.calledWithMatch(mockLog.debug, loggedError);
    }
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
    mockLog = mocks.mockLog();
  });

  describe('_isValidExp', () => {
    it(`fails if 'exp' is NaN`, () => {
      const result = JWTIdToken._isValidExp(NaN);
      assert.equal(false, result);
    });

    it(`fails if 'exp' is undefined`, () => {
      const result = JWTIdToken._isValidExp(undefined);
      assert.equal(false, result);
    });

    it(`fails if 'exp' is a string`, () => {
      const result = JWTIdToken._isValidExp('current time');
      assert.equal(false, result);
    });
  });

  describe('verify', () => {
    it('fails if the input is not a JWT', async () => {
      try {
        await JWTIdToken.verify(
          'invalid token',
          CLIENT_ID,
          mocks.mockDB(),
          mockOtp,
          mockLog
        );
        assert.fail();
      } catch (err) {
        assert.instanceOf(err, AppError);
        assert.calledWithMatch(mockLog.debug, 'verify.error.jwtverify');
      }
    });

    it(`fails if the Issuer Claim doesn't match the expected issuer`, async () => {
      claims.iss = 'http://example.com';
      await signAndAssertInvalid(claims, 'verify.error.jwtverify');
    });

    it(`fails if the Audience Claim doesn't match the client ID`, async () => {
      claims.aud = 'bad1bad1bad1bad1';
      await signAndAssertInvalid(claims, 'verify.error.aud');
    });

    it(`fails if the Audience Claim is a list that doesn't include the client ID`, async () => {
      claims.aud = ['bad1bad1bad1bad1', 'bad2bad2bad2bad2'];
      await signAndAssertInvalid(claims, 'verify.error.aud');
    });

    it(`fails if the Algorithm used isn't the expected default algorithm (RS256)`, async () => {
      const algorithm = 'HS256';
      await signAndAssertInvalid(claims, 'verify.error.jwtverify', algorithm);
    });

    it(`fails if the Expiration Time Claim is missing`, async () => {
      delete claims.exp;
      await signAndAssertInvalid(claims, 'verify.error.exp');
    });

    it(`fails if the Expiration Time Claim is in the past`, async () => {
      claims.exp = NOW_IN_SECONDS - TEN_MINUTES_IN_SECONDS;
      await signAndAssertInvalid(claims, 'verify.error.exp');
    });

    it(`fails if the Expiration Time Claim is too far (more than five minutes) in the future`, async () => {
      claims.exp = NOW_IN_SECONDS + TEN_MINUTES_IN_SECONDS;
      await signAndAssertInvalid(claims, 'verify.error.exp');
    });

    it('succeeds if the token is expired but within the grace period', async () => {
      claims.exp = NOW_IN_SECONDS - TEN_MINUTES_IN_SECONDS;

      const recentlyExpiredToken = sign(claims);
      try {
        await JWTIdToken.verify(
          recentlyExpiredToken,
          CLIENT_ID,
          mocks.mockDB(),
          mockOtp,
          mockLog,
          ONE_DAY_IN_SECONDS
        );
        assert.ok(true);
      } catch (ex) {
        assert.fail();
      }
    });

    describe('ACR claim tests', () => {
      let mockDB;
      beforeEach(() => {
        claims.acr = 'AAL2';
        hasTotp = true;
        mockDB = mocks.mockDB({
          uid: USER_ID,
          email: 'email@user.com',
        });
      });

      it(`fails if the token ACR value is greater than the ACR value on the account`, async () => {
        hasTotp = false;
        const signed = sign(claims);
        try {
          await JWTIdToken.verify(signed, CLIENT_ID, mockDB, mockOtp, mockLog);
        } catch (err) {
          assert.instanceOf(err, AppError);
          assert.equal(err.message, 'Invalid token');
          assert.calledWithMatch(mockLog.debug, 'verify.error.acr');
        }
      });

      it(`fails if the ACR claim is present but the account isn't found`, async () => {
        mockDB.account = sinon.spy(() => P.reject(AppError.unknownAccount()));
        const signed = sign(claims);
        try {
          await JWTIdToken.verify(signed, CLIENT_ID, mockDB, mockOtp, mockLog);
        } catch (err) {
          assert.calledOnce(mockDB.account);
          assert.instanceOf(err, AppError);
          assert.equal(err.message, 'Invalid token');
          assert.calledWithMatch(mockLog.debug, 'verify.error.acr.account');
        }
      });

      it(`succeeds if the token ACR value matches the ACR value on the account`, async () => {
        const signed = sign(claims);
        let verified;
        try {
          verified = await JWTIdToken.verify(
            signed,
            CLIENT_ID,
            mockDB,
            mockOtp,
            mockLog
          );
        } catch (err) {
          assert.calledWithMatch(mockLog.debug, 'bsdjlfverify.');
          assert.fail(err);
        }
        assert.deepEqual(verified, claims);
      });
    });

    it('succeeds if valid', async () => {
      const validToken = sign(claims);
      const parsedClaims = await JWTIdToken.verify(
        validToken,
        CLIENT_ID,
        mocks.mockDB(),
        mockOtp,
        mockLog
      );
      assert.deepEqual(parsedClaims, claims);
    });
  });
});
