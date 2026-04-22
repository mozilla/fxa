/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppError } from '@fxa/accounts/errors';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { strategy } from './mfa';

function makeJwt(account: any, sessionToken: any, config: any) {
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    sub: account.uid,
    scope: [`mfa:test`],
    iat: now,
    jti: uuidv4(),
    stid: sessionToken.id,
  };
  const opts: jwt.SignOptions = {
    algorithm: 'HS256',
    expiresIn: config.mfa.jwt.expiresInSec,
    audience: config.mfa.jwt.audience,
    issuer: config.mfa.jwt.issuer,
  };
  const key = config.mfa.jwt.secretKey;
  return jwt.sign(claims, key, opts);
}

describe('lib/routes/auth-schemes/mfa', () => {
  let sessionToken: any,
    account: any,
    config: any,
    db: any,
    statsd: any,
    request: any,
    h: any,
    jwtToken: string,
    getCredentialsFunc: any;

  beforeEach(() => {
    jest.clearAllMocks();

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
      account: jest.fn().mockResolvedValue({
        uid: 'uid123',
        primaryEmail: { isVerified: true },
      }),
      totpToken: jest
        .fn()
        .mockResolvedValue({ verified: false, enabled: false }),
    };

    statsd = {
      increment: jest.fn(),
    };

    jwtToken = makeJwt(account, sessionToken, config);
    request = {
      headers: { authorization: `Bearer ${jwtToken}` },
      auth: { mode: 'required' },
      route: {
        path: '/foo/{id}',
      },
    };
    h = {
      authenticated: jest.fn().mockReturnValue(undefined),
    };

    getCredentialsFunc = jest.fn().mockResolvedValue(sessionToken);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should authenticate with valid jwt token', async () => {
    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();

    await authStrategy.authenticate(request, h);

    // Important! Session token should be returned as credentials,
    // AND object reference should not change!
    expect(h.authenticated).toHaveBeenCalledTimes(1);
    expect(h.authenticated).toHaveBeenCalledWith({
      credentials: sessionToken,
    });

    // Session token should be decorated with a scope.
    expect(sessionToken.scope[0]).toBe('mfa:test');
  });

  it('should throw an error if no authorization header is provided', async () => {
    getCredentialsFunc = jest.fn().mockResolvedValue(null);
    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();

    const request: any = { headers: {}, auth: { mode: 'required' } };

    try {
      await authStrategy.authenticate(request, h);
      throw new Error('Should have thrown an error');
    } catch (err: any) {
      expect(err).toBeInstanceOf(AppError);
      const errorResponse = err.output.payload;
      expect(errorResponse.code).toBe(401);
      expect(errorResponse.errno).toBe(AppError.ERRNO.INVALID_MFA_TOKEN);
      expect(errorResponse.message).toBe('Invalid or expired MFA token');
    }
  });

  it('should not authenticate if the parent session cannot be found', async () => {
    const getCredentialsFunc = jest.fn().mockResolvedValue(null);
    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();

    try {
      await authStrategy.authenticate(request, h);
      throw new Error('Should have thrown an error');
    } catch (err: any) {
      expect(err).toBeInstanceOf(AppError);
      const errorResponse = err.output.payload;
      expect(errorResponse.code).toBe(401);
      expect(errorResponse.errno).toBe(AppError.ERRNO.INVALID_MFA_TOKEN);
      expect(errorResponse.message).toBe('Invalid or expired MFA token');
    }
  });

  it('should not authenticate with invalid jwt token due to sub mismatch', async () => {
    getCredentialsFunc = jest.fn().mockResolvedValue({ sub: 'account-234' });

    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();

    try {
      await authStrategy.authenticate(request, h);
      throw new Error('Should have thrown an error');
    } catch (err: any) {
      expect(err).toBeInstanceOf(AppError);
      const errorResponse = err.output.payload;
      expect(errorResponse.code).toBe(401);
      expect(errorResponse.errno).toBe(AppError.ERRNO.INVALID_MFA_TOKEN);
      expect(errorResponse.message).toBe('Invalid or expired MFA token');
    }
  });

  it('fails when account email is not verified', async () => {
    db.account = jest.fn().mockResolvedValue({
      uid: 'uid123',
      primaryEmail: { isVerified: false },
    });

    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();

    try {
      await authStrategy.authenticate(request, h);
      throw new Error('Should have thrown');
    } catch (err: any) {
      const payload = err.output.payload;
      expect(payload.code).toBe(400);
      expect(payload.errno).toBe(AppError.ERRNO.ACCOUNT_UNVERIFIED);
      expect(statsd.increment).toHaveBeenCalledWith(
        'verified_session_token.primary_email_not_verified.error',
        ['path:/foo/{id}']
      );
    }
  });

  it('skips email verified check when configured', async () => {
    db.account = jest.fn().mockResolvedValue({
      uid: 'uid123',
      primaryEmail: { isVerified: false },
    });

    config.authStrategies.verifiedSessionToken.skipEmailVerifiedCheckForRoutes =
      '/foo.*';

    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();
    await authStrategy.authenticate(request, h);

    expect(statsd.increment).toHaveBeenCalledTimes(1);
    expect(statsd.increment).toHaveBeenCalledWith(
      'verified_session_token.primary_email_not_verified.skipped',
      ['path:/foo/{id}']
    );
  });

  it('fails when session token is unverified', async () => {
    sessionToken.tokenVerified = false;
    sessionToken.tokenVerificationId = 'abc';

    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();
    try {
      await authStrategy.authenticate(request, h);
      throw new Error('Should have thrown');
    } catch (err: any) {
      const payload = err.output.payload;
      expect(payload.code).toBe(400);
      expect(payload.errno).toBe(AppError.ERRNO.SESSION_UNVERIFIED);
      expect(statsd.increment).toHaveBeenCalledWith(
        'verified_session_token.token_verified.error',
        ['path:/foo/{id}']
      );
    }
  });

  it('skips session token is unverified check when configured', async () => {
    sessionToken.tokenVerified = false;
    sessionToken.tokenVerificationId = 'abc';

    config.authStrategies.verifiedSessionToken.skipTokenVerifiedCheckForRoutes =
      '/foo.*';

    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();
    await authStrategy.authenticate(request, h);

    expect(statsd.increment).toHaveBeenCalledTimes(1);
    expect(statsd.increment).toHaveBeenCalledWith(
      'verified_session_token.token_verified.skipped',
      ['path:/foo/{id}']
    );
  });

  it('fails when AAL mismatch', async () => {
    db.totpToken = jest
      .fn()
      .mockResolvedValue({ verified: true, enabled: true });
    sessionToken.authenticatorAssuranceLevel = 1;

    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();

    try {
      await authStrategy.authenticate(request, h);
      throw new Error('Should have thrown');
    } catch (err: any) {
      const payload = err.output.payload;
      expect(payload.code).toBe(400);
      expect(payload.errno).toBe(AppError.ERRNO.INSUFFICIENT_AAL);
      expect(statsd.increment).toHaveBeenCalledWith(
        'verified_session_token.aal.error',
        ['path:/foo/{id}']
      );
    }
  });

  it('succeeds when account does not require AAL2 (no TOTP) and session is AAL1', async () => {
    db.totpToken = jest
      .fn()
      .mockResolvedValue({ verified: false, enabled: false });
    sessionToken.authenticatorAssuranceLevel = 1;

    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();
    await authStrategy.authenticate(request, h);

    expect(h.authenticated).toHaveBeenCalledTimes(1);
    expect(h.authenticated).toHaveBeenCalledWith({
      credentials: sessionToken,
    });

    expect(sessionToken.scope[0]).toBe('mfa:test');
  });

  it('succeeds when account requires AAL2 (TOTP enabled) and session is AAL2', async () => {
    db.totpToken = jest
      .fn()
      .mockResolvedValue({ verified: true, enabled: true });
    sessionToken.authenticatorAssuranceLevel = 2;

    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();
    await authStrategy.authenticate(request, h);

    expect(h.authenticated).toHaveBeenCalledTimes(1);
    expect(h.authenticated).toHaveBeenCalledWith({
      credentials: sessionToken,
    });

    expect(sessionToken.scope[0]).toBe('mfa:test');
  });

  it('succeeds when session is AAL2 via passkey and account has no TOTP', async () => {
    db.totpToken = jest.fn().mockRejectedValue(AppError.totpTokenNotFound());
    sessionToken.authenticatorAssuranceLevel = 2;

    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();
    await authStrategy.authenticate(request, h);

    expect(h.authenticated).toHaveBeenCalledTimes(1);
    expect(h.authenticated).toHaveBeenCalledWith({
      credentials: sessionToken,
    });

    expect(sessionToken.scope[0]).toBe('mfa:test');
  });

  it('skips AAL check when configured', async () => {
    db.totpToken = jest
      .fn()
      .mockResolvedValue({ verified: true, enabled: true });
    sessionToken.authenticatorAssuranceLevel = 1;

    config.authStrategies.verifiedSessionToken.skipAalCheckForRoutes = '/foo.*';

    const authStrategy = strategy(config, getCredentialsFunc, db, statsd)();

    await authStrategy.authenticate(request, h);

    expect(statsd.increment).toHaveBeenCalledTimes(1);
    expect(statsd.increment).toHaveBeenCalledWith(
      'verified_session_token.aal.skipped',
      ['path:/foo/{id}']
    );
  });
});
