/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const sinon = require('sinon');
const AppError = require('../../../../lib/error');
const { strategy } = require('../../../../lib/routes/auth-schemes/mfa');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');

function makeJwt(account, sessionToken, config) {
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    sub: account.uid,
    scope: [`mfa:test`],
    iat: now,
    jti: uuid.v4(),
    stid: sessionToken.id,
  };
  const opts = {
    algorithm: 'HS256',
    expiresIn: config.mfa.jwt.expiresInSec,
    audience: config.mfa.jwt.audience,
    issuer: config.mfa.jwt.issuer,
  };
  const key = config.mfa.jwt.secretKey;
  return jwt.sign(claims, key, opts);
}

describe('lib/routes/auth-schemes/mfa', () => {
  const mockSessionToken = {
    uid: 'account-123',
    id: 'session-123',
    get foo() {
      return 'bar';
    },
  };
  const mockAccount = { uid: 'account-123' };
  const mockConfig = {
    mfa: {
      jwt: {
        expiresInSec: 1,
        audience: 'fxa',
        issuer: 'accounts.firefox.com',
        secretKey: 'foxes'.repeat(13),
      },
    },
  };

  it('should authenticate with valid jwt token', async () => {
    const jwt = makeJwt(mockAccount, mockSessionToken, mockConfig);
    const request = {
      headers: { authorization: `Bearer ${jwt}` },
      auth: { mode: 'required' },
    };
    const h = { authenticated: sinon.fake() };
    const getCredentialsFunc = sinon.fake.resolves(mockSessionToken);
    const authStrategy = strategy(mockConfig, getCredentialsFunc)();

    await authStrategy.authenticate(request, h);

    // Important! Session token should be returned as credentials,
    // AND object reference should not change!
    assert.isTrue(
      h.authenticated.calledOnceWithExactly({
        credentials: sinon.match.same(mockSessionToken),
      })
    );

    // Session token should be decorated with a scope.
    assert.equal(mockSessionToken.scope[0], 'mfa:test');
  });

  it('should throw an error if no authorization header is provided', async () => {
    const getCredentialsFunc = sinon.fake.resolves(null);
    const authStrategy = strategy(mockConfig, getCredentialsFunc)();

    const request = { headers: {}, auth: { mode: 'required' } };
    const h = { continue: Symbol('continue') };

    try {
      await authStrategy.authenticate(request, h);
      assert.fail('Should have thrown an error');
    } catch (err) {
      assert.instanceOf(err, AppError);
      const errorResponse = err.output.payload;
      assert.equal(errorResponse.code, 401);
      assert.equal(errorResponse.errno, 110);
      assert.equal(errorResponse.message, 'Unauthorized for route');
      assert.equal(errorResponse.detail, 'Token not found');
    }
  });

  it('should not authenticate if the parent session cannot be found', async () => {
    const getCredentialsFunc = sinon.fake.resolves(null);
    const authStrategy = strategy(mockConfig, getCredentialsFunc)();
    const jwt = makeJwt(mockAccount, mockSessionToken, mockConfig);

    const request = {
      headers: { authorization: `Bearer ${jwt}` },
      auth: { mode: 'required' },
    };
    const h = { continue: Symbol('continue') };

    try {
      await authStrategy.authenticate(request, h);
      assert.fail('Should have thrown an error');
    } catch (err) {
      assert.instanceOf(err, AppError);
      const errorResponse = err.output.payload;
      assert.equal(errorResponse.code, 401);
      assert.equal(errorResponse.errno, 110);
      assert.equal(errorResponse.message, 'Unauthorized for route');
      assert.equal(errorResponse.detail, 'Token not found');
    }
  });

  it('should not authenticate with invalid jwt token due to sub mismatch', async () => {
    const getCredentialsFunc = sinon.fake.resolves({ sub: 'account-234' });
    const authStrategy = strategy(mockConfig, getCredentialsFunc)();
    const jwt = makeJwt(mockAccount, mockSessionToken, mockConfig);

    const request = {
      headers: { authorization: `Bearer ${jwt}` },
      auth: { mode: 'required' },
    };
    const h = { continue: Symbol('continue') };

    try {
      await authStrategy.authenticate(request, h);
      assert.fail('Should have thrown an error');
    } catch (err) {
      assert.instanceOf(err, AppError);
      const errorResponse = err.output.payload;
      assert.equal(errorResponse.code, 401);
      assert.equal(errorResponse.errno, 110);
      assert.equal(errorResponse.message, 'Unauthorized for route');
      assert.equal(errorResponse.detail, 'Token invalid');
    }
  });
});
