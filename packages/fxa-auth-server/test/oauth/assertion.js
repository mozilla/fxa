/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const cloneDeep = require('lodash/cloneDeep');
const util = require('util');

const jwt = require('jsonwebtoken');
const jwtSign = util.promisify(jwt.sign);

const { config } = require('../../config');
const unique = require('../../lib/oauth/unique');

const verifyAssertion = require('../../lib/oauth/assertion');

const ISSUER = config.get('oauthServer.browserid.issuer');
const AUDIENCE = config.get('publicUrl');
const USERID = unique(16).toString('hex');
const GENERATION = 12345;
const VERIFIED_EMAIL = 'test@exmample.com';
const LAST_AUTH_AT = Date.now();
const AMR = ['pwd', 'otp'];
const AAL = 2;
const PROFILE_CHANGED_AT = Date.now();
const JWT_IAT = Date.now();

const ERRNO_INVALID_ASSERTION = 104;

const GOOD_CLAIMS = {
  'fxa-generation': GENERATION,
  'fxa-verifiedEmail': VERIFIED_EMAIL,
  'fxa-lastAuthAt': LAST_AUTH_AT,
  'fxa-tokenVerified': true,
  'fxa-amr': AMR,
  'fxa-aal': AAL,
  'fxa-profileChangedAt': PROFILE_CHANGED_AT,
};

const AUTH_SERVER_SECRETS = config.get('oauthServer.authServerSecrets');

async function makeJWT(claims, key, options = {}) {
  claims = Object.assign(
    {
      iat: JWT_IAT,
      exp: JWT_IAT + 60,
      sub: USERID,
      aud: AUDIENCE,
      iss: ISSUER,
    },
    claims
  );
  if (!key) {
    key = AUTH_SERVER_SECRETS[0];
  }
  options = Object.assign(
    {
      algorithm: 'HS256',
    },
    options
  );
  return await jwtSign(claims, key, options);
}

describe('JWT verifyAssertion', function () {
  it('should accept well-formed JWT assertions', async () => {
    assert.ok(
      AUTH_SERVER_SECRETS.length >= 1,
      'authServerSecrets config has been set'
    );

    const assertion = await makeJWT(GOOD_CLAIMS);
    const claims = await verifyAssertion(assertion);
    assert.deepEqual(claims, {
      iat: JWT_IAT,
      uid: USERID,
      'fxa-generation': GENERATION,
      'fxa-verifiedEmail': VERIFIED_EMAIL,
      'fxa-lastAuthAt': LAST_AUTH_AT,
      'fxa-tokenVerified': true,
      'fxa-amr': AMR,
      'fxa-aal': AAL,
      'fxa-profileChangedAt': PROFILE_CHANGED_AT,
    });
  });

  it('should accept JWTs signed with an alternate key', async () => {
    assert.ok(
      AUTH_SERVER_SECRETS.length >= 2,
      'authServerSecrets config has multiple values'
    );
    const assertion = await makeJWT(GOOD_CLAIMS, AUTH_SERVER_SECRETS[1]);
    const claims = await verifyAssertion(assertion);
    assert.deepEqual(claims, {
      iat: JWT_IAT,
      uid: USERID,
      'fxa-generation': GENERATION,
      'fxa-verifiedEmail': VERIFIED_EMAIL,
      'fxa-lastAuthAt': LAST_AUTH_AT,
      'fxa-tokenVerified': true,
      'fxa-amr': AMR,
      'fxa-aal': AAL,
      'fxa-profileChangedAt': PROFILE_CHANGED_AT,
    });
  });

  it('should reject JWTs signed with an unknown key', async () => {
    const assertion = await makeJWT(GOOD_CLAIMS, 'whereDidThisComeFrom?');
    try {
      await verifyAssertion(assertion);
      assert.fail('should have failed');
    } catch (err) {
      assert.equal(err.errno, ERRNO_INVALID_ASSERTION);
    }
  });

  it('should reject expired JWTs', async () => {
    const assertion = await makeJWT(
      Object.assign({}, GOOD_CLAIMS, {
        exp: Math.floor(Date.now() / 1000) - 60,
      })
    );
    try {
      await verifyAssertion(assertion);
      assert.fail('should have failed');
    } catch (err) {
      assert.equal(err.errno, ERRNO_INVALID_ASSERTION);
    }
  });

  it('should reject JWTs with incorrect audience', async () => {
    const assertion = await makeJWT(
      Object.assign({}, GOOD_CLAIMS, {
        aud: 'https://example.com',
      })
    );
    try {
      await verifyAssertion(assertion);
      assert.fail('should have failed');
    } catch (err) {
      assert.equal(err.errno, ERRNO_INVALID_ASSERTION);
    }
  });

  it('should reject JWTs with unexpected algorithms', async () => {
    const assertion = await makeJWT(GOOD_CLAIMS, AUTH_SERVER_SECRETS[0], {
      algorithm: 'HS384',
    });
    try {
      await verifyAssertion(assertion);
      assert.fail('should have failed');
    } catch (err) {
      assert.equal(err.errno, ERRNO_INVALID_ASSERTION);
    }
  });

  it('should reject JWTs from non-allowed issuers', async () => {
    const assertion = await makeJWT(
      Object.assign({}, GOOD_CLAIMS, {
        iss: 'evil.com',
      })
    );
    try {
      await verifyAssertion(assertion);
      assert.fail('should have failed');
    } catch (err) {
      assert.equal(err.errno, ERRNO_INVALID_ASSERTION);
    }
  });

  it('should reject JWTs with malformed user id', async () => {
    const assertion = await makeJWT(
      Object.assign({}, GOOD_CLAIMS, {
        sub: 'non-hex-string',
      })
    );
    try {
      await verifyAssertion(assertion);
      assert.fail('should have failed');
    } catch (err) {
      assert.equal(err.errno, ERRNO_INVALID_ASSERTION);
    }
  });

  it('should reject JWTs with missing `lastAuthAt` claim', async () => {
    const claims = Object.assign({}, GOOD_CLAIMS);
    delete claims['fxa-lastAuthAt'];
    const assertion = await makeJWT(claims);
    try {
      await verifyAssertion(assertion);
      assert.fail('should have failed');
    } catch (err) {
      assert.equal(err.errno, ERRNO_INVALID_ASSERTION);
    }
  });

  it('should accept JWTs with missing `amr` claim', async () => {
    let claims = cloneDeep(GOOD_CLAIMS);
    delete claims['fxa-amr'];
    const assertion = await makeJWT(claims);
    claims = await verifyAssertion(assertion);
    assert.deepEqual(Object.keys(claims).sort(), [
      'fxa-aal',
      'fxa-generation',
      'fxa-lastAuthAt',
      'fxa-profileChangedAt',
      'fxa-tokenVerified',
      'fxa-verifiedEmail',
      'iat',
      'uid',
    ]);
  });

  it('should accept assertions with missing `aal` claim', async () => {
    let claims = cloneDeep(GOOD_CLAIMS);
    delete claims['fxa-aal'];
    const assertion = await makeJWT(claims);
    claims = await verifyAssertion(assertion);
    assert.deepEqual(Object.keys(claims).sort(), [
      'fxa-amr',
      'fxa-generation',
      'fxa-lastAuthAt',
      'fxa-profileChangedAt',
      'fxa-tokenVerified',
      'fxa-verifiedEmail',
      'iat',
      'uid',
    ]);
  });
});
