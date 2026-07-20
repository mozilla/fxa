/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppError } from '@fxa/accounts/errors';
import { strategy } from './verified-session-token';

describe('lib/routes/auth-schemes/verified-session-token', () => {
  let config: any;
  let db: any;
  let statsd: any;
  let h: any;
  let token: any;
  let request: any;
  let getCredentialsFunc: any;

  beforeEach(() => {
    config = {
      authStrategies: {
        verifiedSessionToken: {},
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

    h = {
      authenticated: jest.fn().mockReturnValue(undefined),
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
      increment: jest.fn(),
    };

    getCredentialsFunc = jest.fn().mockResolvedValue(token);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('authenticates when account email verified, session token verified, and AAL matches', async () => {
    const authStrategy = strategy(getCredentialsFunc, db, config, statsd)();
    await authStrategy.authenticate(request, h);

    expect(h.authenticated).toHaveBeenCalledTimes(1);
    expect(h.authenticated).toHaveBeenCalledWith({
      credentials: token,
    });
  });

  it('fails when no authorization header is provided', async () => {
    request = { headers: {}, auth: { mode: 'required' } };

    const authStrategy = strategy(getCredentialsFunc, db, config, statsd)();

    try {
      await authStrategy.authenticate(request, h);
      throw new Error('Should have thrown');
    } catch (err: any) {
      expect(err).toBeInstanceOf(AppError);
      const payload = err.output.payload;
      expect(payload.code).toBe(401);
      expect(payload.errno).toBe(AppError.ERRNO.INVALID_TOKEN);
    }
  });

  it('fails when token not found', async () => {
    getCredentialsFunc = jest.fn().mockResolvedValue(null);

    const authStrategy = strategy(getCredentialsFunc, db, config, statsd)();

    try {
      await authStrategy.authenticate(request, h);
      throw new Error('Should have thrown');
    } catch (err: any) {
      const payload = err.output.payload;
      expect(payload.code).toBe(401);
      expect(payload.errno).toBe(AppError.ERRNO.INVALID_TOKEN);
    }
  });

  it('fails when account email is not verified', async () => {
    db.account = jest.fn().mockResolvedValue({
      uid: 'uid123',
      primaryEmail: { isVerified: false },
    });

    const authStrategy = strategy(getCredentialsFunc, db, config, statsd)();

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

    const authStrategy = strategy(getCredentialsFunc, db, config, statsd)();
    await authStrategy.authenticate(request, h);

    expect(statsd.increment).toHaveBeenCalledTimes(1);
    expect(statsd.increment).toHaveBeenCalledWith(
      'verified_session_token.primary_email_not_verified.skipped',
      ['path:/foo/{id}']
    );
  });

  it('fails when session token is unverified', async () => {
    token.tokenVerified = false;
    token.tokenVerificationId = 'abc';

    const authStrategy = strategy(getCredentialsFunc, db, config, statsd)();
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
    token.tokenVerified = false;
    token.tokenVerificationId = 'abc';

    config.authStrategies.verifiedSessionToken.skipTokenVerifiedCheckForRoutes =
      '/foo.*';

    const authStrategy = strategy(getCredentialsFunc, db, config, statsd)();
    await authStrategy.authenticate(request, h);

    expect(statsd.increment).toHaveBeenCalledTimes(1);
    expect(statsd.increment).toHaveBeenCalledWith(
      'verified_session_token.token_verified.skipped',
      ['path:/foo/{id}']
    );
  });

  it('fails when session AAL is less than required AAL', async () => {
    db.totpToken = jest.fn().mockResolvedValue({
      verified: true,
      enabled: true,
    });

    token.authenticatorAssuranceLevel = 1;

    const authStrategy = strategy(getCredentialsFunc, db, config, statsd)();
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

  it('passes when account does not require AAL2 (no TOTP) and session is AAL1', async () => {
    db.totpToken = jest.fn().mockResolvedValue({
      verified: false,
      enabled: false,
    });

    const authStrategy = strategy(getCredentialsFunc, db, config, statsd)();
    await authStrategy.authenticate(request, h);
    expect(h.authenticated).toHaveBeenCalledTimes(1);
    expect(h.authenticated).toHaveBeenCalledWith({
      credentials: token,
    });
  });

  it('passes when account requires AAL2 (TOTP enabled) and session is AAL2', async () => {
    db.totpToken = jest.fn().mockResolvedValue({
      verified: true,
      enabled: true,
    });

    token.authenticatorAssuranceLevel = 2;

    const authStrategy = strategy(getCredentialsFunc, db, config, statsd)();
    await authStrategy.authenticate(request, h);
    expect(h.authenticated).toHaveBeenCalledTimes(1);
    expect(h.authenticated).toHaveBeenCalledWith({
      credentials: token,
    });
  });

  it('skips AAL check when configured', async () => {
    db.totpToken = jest.fn().mockResolvedValue({
      enabled: true,
      verified: true,
    });

    config.authStrategies.verifiedSessionToken.skipAalCheckForRoutes = '/foo.*';

    const authStrategy = strategy(getCredentialsFunc, db, config, statsd)();

    await authStrategy.authenticate(request, h);

    expect(statsd.increment).toHaveBeenCalledTimes(1);
    expect(statsd.increment).toHaveBeenCalledWith(
      'verified_session_token.aal.skipped',
      ['path:/foo/{id}']
    );
  });
});
