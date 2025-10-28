/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const sinon = require('sinon');
const AppError = require('../../../../lib/error');
const { strategy } = require('../../../../lib/routes/auth-schemes/mfa');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const authMethods = require('../../../../lib/authMethods');

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
  let sessionToken,
    account,
    config,
    db,
    statsd,
    request,
    h,
    jwt,
    getCredentialsFunc;

  before(() => {
    sinon.stub(authMethods, 'availableAuthenticationMethods');
  });

  beforeEach(() => {
    sinon.reset();

    authMethods.availableAuthenticationMethods = sinon.fake.resolves(
      new Set(['pwd', 'email'])
    );

    sessionToken = {
      uid: 'account-123',
      id: 'session-123',
      authenticatorAssuranceLevel: 2,
      tokenVerified: true,
      get foo() {
        return 'bar';
      },
    };
    account = { uid: 'account-123' };
    config = {
      authStrategies: {
        verifiedSessionToken: {},
      },
      mfa: {
        jwt: {
          expiresInSec: 1,
          audience: 'fxa',
          issuer: 'accounts.firefox.com',
          secretKey: 'foxes'.repeat(13),
        },
      },
    };

    db = {
      account: sinon.fake.resolves({
        uid: 'uid123',
        primaryEmail: { isVerified: true },
      }),
      totpToken: sinon.fake.resolves({ verified: false, enabled: false }),
    };

    statsd = {
      increment: sinon.fake(),
    };

    jwt = makeJwt(account, sessionToken, config);
    request = {
      headers: { authorization: `Bearer ${jwt}` },
      auth: { mode: 'required' },
      route: {
        path: '/foo/{id}',
      },
    };
    h = {
      authenticated: sinon.fake.returns(),
    };

    getCredentialsFunc = sinon.fake.resolves(sessionToken);
  });

  after(() => {
    sinon.restore();
  });

  it('should authenticate with valid jwt token', async () => {
    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();

    await authStrategy.authenticate(request, h);

    // Important! Session token should be returned as credentials,
    // AND object reference should not change!
    assert.isTrue(
      h.authenticated.calledOnceWithExactly({
        credentials: sinon.match.same(sessionToken),
      })
    );

    // Session token should be decorated with a scope.
    assert.equal(sessionToken.scope[0], 'mfa:test');
  });

  it('should throw an error if no authorization header is provided', async () => {
    getCredentialsFunc = sinon.fake.resolves(null);
    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();

    const request = { headers: {}, auth: { mode: 'required' } };

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
    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();

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
    getCredentialsFunc = sinon.fake.resolves({ sub: 'account-234' });

    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();

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

  it('fails when account email is not verified', async () => {
    // Set email in unverified state
    db.account = sinon.fake.resolves({
      uid: 'uid123',
      primaryEmail: { isVerified: false },
    });

    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();

    try {
      await authStrategy.authenticate(request, h);
      assert.fail('Should have thrown');
    } catch (err) {
      const payload = err.output.payload;
      assert.equal(payload.code, 400);
      assert.equal(payload.errno, AppError.ERRNO.ACCOUNT_UNVERIFIED);
      assert.isTrue(
        statsd.increment.calledWithExactly(
          'verified_session_token.primary_email_not_verified.error',
          ['path:/foo/{id}']
        )
      );
    }
  });

  it('skips email verified check when configured', async () => {
    // Set email verified false
    db.account = sinon.fake.resolves({
      uid: 'uid123',
      primaryEmail: { isVerified: false },
    });

    // Configure path to skip email check
    config.authStrategies.verifiedSessionToken.skipEmailVerifiedCheckForRoutes =
      '/foo.*';

    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();
    await authStrategy.authenticate(request, h);

    assert.isTrue(
      statsd.increment.calledOnceWithExactly(
        'verified_session_token.primary_email_not_verified.skipped',
        ['path:/foo/{id}']
      )
    );
  });

  it('fails when session token is unverified', async () => {
    // Set token as unverified.
    sessionToken.tokenVerified = false;
    sessionToken.tokenVerificationId = 'abc';

    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();
    try {
      await authStrategy.authenticate(request, h);
      assert.fail('Should have thrown');
    } catch (err) {
      const payload = err.output.payload;
      assert.equal(payload.code, 400);
      assert.equal(payload.errno, AppError.ERRNO.SESSION_UNVERIFIED);
      assert.isTrue(
        statsd.increment.calledWithExactly(
          'verified_session_token.token_verified.error',
          ['path:/foo/{id}']
        )
      );
    }
  });

  it('skips session token is unverified check when configured', async () => {
    // Set token in unverified state
    sessionToken.tokenVerified = false;
    sessionToken.tokenVerificationId = 'abc';

    // Skip token verification check for path
    config.authStrategies.verifiedSessionToken.skipTokenVerifiedCheckForRoutes =
      '/foo.*';

    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();
    await authStrategy.authenticate(request, h);

    assert.isTrue(
      statsd.increment.calledOnceWithExactly(
        'verified_session_token.token_verified.skipped',
        ['path:/foo/{id}']
      )
    );
  });

  it('fails when AAL mismatch', async () => {
    // Force account AAL=2 by returning otp along with pwd/email
    authMethods.availableAuthenticationMethods = sinon.fake.resolves(
      new Set(['pwd', 'email', 'otp'])
    );
    sessionToken.authenticatorAssuranceLevel = 1;

    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();

    try {
      await authStrategy.authenticate(request, h);
      assert.fail('Should have thrown');
    } catch (err) {
      const payload = err.output.payload;
      assert.equal(payload.code, 401);
      assert.equal(payload.errno, AppError.ERRNO.INVALID_TOKEN);
      assert.isTrue(
        statsd.increment.calledWithExactly('verified_session_token.aal.error', [
          'path:/foo/{id}',
        ])
      );
    }
  });

  it('succeeds when account AAL is lower than session AAL', async () => {
    // Force account AAL=2 by returning otp along with pwd/email
    authMethods.availableAuthenticationMethods = sinon.fake.resolves(
      new Set(['pwd', 'email'])
    );
    sessionToken.authenticatorAssuranceLevel = 2;

    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();
    await authStrategy.authenticate(request, h);

    // Important! Session token should be returned as credentials,
    // AND object reference should not change!
    assert.isTrue(
      h.authenticated.calledOnceWithExactly({
        credentials: sinon.match.same(sessionToken),
      })
    );

    // Session token should be decorated with a scope.
    assert.equal(sessionToken.scope[0], 'mfa:test');
  });

  it('succeeds when account AAL is equal t session AAL', async () => {
    // Force account AAL=2 by returning otp along with pwd/email
    authMethods.availableAuthenticationMethods = sinon.fake.resolves(
      new Set(['pwd', 'email', 'otp'])
    );
    sessionToken.authenticatorAssuranceLevel = 2;

    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();
    await authStrategy.authenticate(request, h);

    // Important! Session token should be returned as credentials,
    // AND object reference should not change!
    assert.isTrue(
      h.authenticated.calledOnceWithExactly({
        credentials: sinon.match.same(sessionToken),
      })
    );

    // Session token should be decorated with a scope.
    assert.equal(sessionToken.scope[0], 'mfa:test');
  });

  it('skips AAL check when configured', async () => {
    // Force account AAL=2 by returning otp along with pwd/email
    authMethods.availableAuthenticationMethods = sinon.fake.resolves(
      new Set(['pwd', 'email', 'otp'])
    );
    sessionToken.authenticatorAssuranceLevel = 1;

    // Skip AAL check for path
    config.authStrategies.verifiedSessionToken.skipAalCheckForRoutes = '/foo.*';

    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();

    await authStrategy.authenticate(request, h);

    assert.isTrue(
      statsd.increment.calledOnceWithExactly(
        'verified_session_token.aal.skipped',
        ['path:/foo/{id}']
      )
    );
  });
});
