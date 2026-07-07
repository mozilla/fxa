/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  ExecutionContext,
  type LoggerService,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { StatsD } from 'hot-shots';
import { FxaOAuthAuthGuard } from './fxa-oauth-auth.guard';
import {
  JwtInsufficientScopeError,
  NoBearerTokenError,
  OAuthTokenRejectedError,
  OAuthVerifyServerError,
} from './fxa-oauth.error';

const BILLING_PATH = '/v1/billing-and-subscriptions';
const NORMALIZED_PATH = 'v1/billing-and-subscriptions';

function makeContext(
  req: any = { method: 'GET', route: { path: BILLING_PATH } }
): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => req }),
  } as unknown as ExecutionContext;
}

describe('FxaOAuthAuthGuard', () => {
  let guard: FxaOAuthAuthGuard;
  let statsd: jest.Mocked<Pick<StatsD, 'increment' | 'timing'>>;
  let logger: jest.Mocked<Pick<LoggerService, 'warn' | 'error' | 'log'>>;

  beforeEach(() => {
    statsd = { increment: jest.fn(), timing: jest.fn() };
    logger = { warn: jest.fn(), error: jest.fn(), log: jest.fn() };
    guard = new FxaOAuthAuthGuard(
      logger as unknown as LoggerService,
      statsd as unknown as StatsD
    );
  });

  it('can be instantiated', () => {
    expect(guard).toBeDefined();
  });

  it('returns the authenticated user unchanged', () => {
    const user = { sub: 'uid', client_id: 'client', scope: ['scope'] };
    const result = guard.handleRequest(null, user, undefined, makeContext());
    expect(result).toBe(user);
  });

  it('does not emit metrics or logs on success', () => {
    const user = { sub: 'uid', client_id: 'client', scope: ['scope'] };
    guard.handleRequest(null, user, undefined, makeContext());
    expect(statsd.increment).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('rejects with 401 when authentication fails', () => {
    expect(() =>
      guard.handleRequest(
        null,
        null,
        new OAuthTokenRejectedError(401),
        makeContext()
      )
    ).toThrow(UnauthorizedException);
  });

  it('emits an auth.fail counter tagged with the error name and path', () => {
    try {
      guard.handleRequest(
        null,
        null,
        new OAuthTokenRejectedError(401),
        makeContext()
      );
    } catch {
      // rejection is asserted separately
    }
    expect(statsd.increment).toHaveBeenCalledWith('auth.fail', {
      reason: 'OAuthTokenRejectedError',
      path: NORMALIZED_PATH,
    });
  });

  it('warns with a single line carrying the reason and message', () => {
    try {
      guard.handleRequest(
        null,
        null,
        new OAuthTokenRejectedError(401),
        makeContext()
      );
    } catch {
      // rejection is asserted separately
    }
    expect(logger.warn).toHaveBeenCalledTimes(1);
    const [line] = logger.warn.mock.calls[0];
    expect(line).toContain('reason=OAuthTokenRejectedError');
    expect(line).toContain('method=GET');
    expect(line).toContain(`path=${NORMALIZED_PATH}`);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('rejects with 503 on an auth-server upstream error', () => {
    expect(() =>
      guard.handleRequest(
        null,
        null,
        new OAuthVerifyServerError(503),
        makeContext()
      )
    ).toThrow(ServiceUnavailableException);
  });

  it('logs upstream verify errors at error level', () => {
    try {
      guard.handleRequest(
        null,
        null,
        new OAuthVerifyServerError(503),
        makeContext()
      );
    } catch {
      // rejection is asserted separately
    }
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.warn).not.toHaveBeenCalled();
    expect(statsd.increment).toHaveBeenCalledWith('auth.fail', {
      reason: 'OAuthVerifyServerError',
      path: NORMALIZED_PATH,
    });
  });

  it('prefers the FxaOAuthError over passport-jwt noise in a multi-strategy array', () => {
    // Passport hands a two-strategy guard an array of failures; the JWT strategy
    // failing to parse an opaque token must not mask the verify verdict.
    const jwtError = Object.assign(new Error('jwt malformed'), {
      name: 'JsonWebTokenError',
    });
    expect(() =>
      guard.handleRequest(
        null,
        null,
        [jwtError, new OAuthVerifyServerError(503)],
        makeContext()
      )
    ).toThrow(ServiceUnavailableException);
    expect(statsd.increment).toHaveBeenCalledWith('auth.fail', {
      reason: 'OAuthVerifyServerError',
      path: NORMALIZED_PATH,
    });
  });

  it('prefers a later upstream error over a preceding FxaOAuthError (503 not 401)', () => {
    // A JWT-scope failure (401-class) can precede a verify upstream fault
    // (503-class) in the strategy-ordered array; the outage must still win.
    expect(() =>
      guard.handleRequest(
        null,
        null,
        [new JwtInsufficientScopeError(), new OAuthVerifyServerError(503)],
        makeContext()
      )
    ).toThrow(ServiceUnavailableException);
    expect(statsd.increment).toHaveBeenCalledWith('auth.fail', {
      reason: 'OAuthVerifyServerError',
      path: NORMALIZED_PATH,
    });
  });

  it('falls back to a passport-jwt error name when no FxaOAuthError is present', () => {
    const jwtError = Object.assign(new Error('jwt expired'), {
      name: 'TokenExpiredError',
    });
    try {
      guard.handleRequest(null, null, jwtError, makeContext());
    } catch {
      // rejection is asserted separately
    }
    expect(statsd.increment).toHaveBeenCalledWith('auth.fail', {
      reason: 'TokenExpiredError',
      path: NORMALIZED_PATH,
    });
  });

  it('uses reason=unknown and path=unmatched when nothing is known', () => {
    try {
      guard.handleRequest(null, null, undefined, makeContext({ method: 'GET' }));
    } catch {
      // rejection is asserted separately
    }
    expect(statsd.increment).toHaveBeenCalledWith('auth.fail', {
      reason: 'unknown',
      path: 'unmatched',
    });
  });

  it('never includes the bearer token in the logged line', () => {
    try {
      guard.handleRequest(
        null,
        null,
        new NoBearerTokenError(),
        makeContext({
          method: 'GET',
          route: { path: BILLING_PATH },
          headers: { authorization: 'Bearer super-secret-token' },
        })
      );
    } catch {
      // rejection is asserted separately
    }
    const [line] = logger.warn.mock.calls[0];
    expect(line).not.toContain('super-secret-token');
    expect(line).not.toContain('Bearer super-secret-token');
  });
});
