/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const sinon = require('sinon');
const { AppError } = require('@fxa/accounts/errors');
const {
  strategy,
} = require('../../../../lib/routes/auth-schemes/verified-session-token');

describe('lib/routes/auth-schemes/verified-session-token', () => {
  let config;
  let db;
  let statsd;
  let h;
  let token;
  let request;
  let getCredentialsFunc;

  beforeEach(() => {
    // Default valid state. This state should pass email verified check, session token verified check,
    // and account assurance level check.
    config = {
      authStrategies: {
        verifiedSessionToken: {},
      },
    };

    db = {
      account: sinon.fake.resolves({
        uid: 'uid123',
        primaryEmail: { isVerified: true },
      }),
      totpToken: sinon.fake.resolves({ verified: false, enabled: false }),
    };

    h = {
      authenticated: sinon.fake.returns(),
    };

    token = {
      id: 't',
      uid: 'uid123',
      tokenVerified: true,
      authenticatorAssuranceLevel: 1,
    };

    request = {
      headers: {
        authorization: 'Hawk id="123", ts="123", nonce="123", mac="123"',
      },
      auth: { mode: 'required' },
      route: { path: '/foo/{id}' },
    };

    statsd = {
      increment: sinon.fake(),
    };

    getCredentialsFunc = sinon.fake.resolves(token);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('authenticates when account email verified, session token verified, and AAL matches', async () => {
    // Happy path, the default mocks should allow call through.

    const authStrategy = strategy(getCredentialsFunc, db, config, statsd)();
    await authStrategy.authenticate(request, h);

    assert.isTrue(
      h.authenticated.calledOnceWithExactly({
        credentials: token,
      })
    );
  });

  it('fails when no authorization header is provided', async () => {
    // Remove auth header
    request = { headers: {}, auth: { mode: 'required' } };

    const authStrategy = strategy(getCredentialsFunc, db, config, statsd)();

    try {
      await authStrategy.authenticate(request, h);
      assert.fail('Should have thrown');
    } catch (err) {
      assert.instanceOf(err, AppError);
      const payload = err.output.payload;
      assert.equal(payload.code, 401);
      assert.equal(payload.errno, AppError.ERRNO.INVALID_TOKEN);
    }
  });

  it('fails when token not found', async () => {
    // Token missing from DB
    getCredentialsFunc = sinon.fake.resolves(null);

    const authStrategy = strategy(getCredentialsFunc, db, config, statsd)();

    try {
      await authStrategy.authenticate(request, h);
      assert.fail('Should have thrown');
    } catch (err) {
      const payload = err.output.payload;
      assert.equal(payload.code, 401);
      assert.equal(payload.errno, AppError.ERRNO.INVALID_TOKEN);
    }
  });

  it('fails when account email is not verified', async () => {
    // Set email in unverified state
    db.account = sinon.fake.resolves({
      uid: 'uid123',
      primaryEmail: { isVerified: false },
    });

    const authStrategy = strategy(getCredentialsFunc, db, config, statsd)();

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

    const authStrategy = strategy(getCredentialsFunc, db, config, statsd)();
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
    token.tokenVerified = false;
    token.tokenVerificationId = 'abc';

    const authStrategy = strategy(getCredentialsFunc, db, config, statsd)();
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
    token.tokenVerified = false;
    token.tokenVerificationId = 'abc';

    // Skip token verification check for path
    config.authStrategies.verifiedSessionToken.skipTokenVerifiedCheckForRoutes =
      '/foo.*';

    const authStrategy = strategy(getCredentialsFunc, db, config, statsd)();
    await authStrategy.authenticate(request, h);

    assert.isTrue(
      statsd.increment.calledOnceWithExactly(
        'verified_session_token.token_verified.skipped',
        ['path:/foo/{id}']
      )
    );
  });

  it('fails when session AAL is less than required AAL', async () => {
    // Force account AAL=2 by returning otp along with pwd/email
    db.totpToken = sinon.fake.resolves({
      verified: true,
      enabled: true,
    });

    token.authenticatorAssuranceLevel = 1;

    const authStrategy = strategy(getCredentialsFunc, db, config, statsd)();
    try {
      await authStrategy.authenticate(request, h);
      assert.fail('Should have thrown');
    } catch (err) {
      const payload = err.output.payload;
      assert.equal(payload.code, 400);
      assert.equal(payload.errno, AppError.ERRNO.INSUFFICIENT_AAL);
      assert.isTrue(
        statsd.increment.calledWithExactly('verified_session_token.aal.error', [
          'path:/foo/{id}',
        ])
      );
    }
  });

  it('passes when session AAL is greater than required AAL', async () => {
    // Force account AAL=1 by returning otp along with pwd/email
    db.totpToken = sinon.fake.resolves({
      verified: false,
      enabled: false,
    });

    // Fabricate higher session token AAL
    token.authenticatorAssuranceLevel = 2;

    const authStrategy = strategy(getCredentialsFunc, db, config, statsd)();
    await authStrategy.authenticate(request, h);
    assert.isTrue(
      h.authenticated.calledOnceWithExactly({
        credentials: token,
      })
    );
  });

  it('skips AAL check when configured', async () => {
    // Force account AAL=2 by returning otp along with pwd/email
    db.totpToken = sinon.fake.resolves({
      enabled: true,
      verified: true,
    });

    // Skip AAL check for path
    config.authStrategies.verifiedSessionToken.skipAalCheckForRoutes = '/foo.*';

    const authStrategy = strategy(getCredentialsFunc, db, config, statsd)();

    await authStrategy.authenticate(request, h);

    assert.isTrue(
      statsd.increment.calledOnceWithExactly(
        'verified_session_token.aal.skipped',
        ['path:/foo/{id}']
      )
    );
  });
});
