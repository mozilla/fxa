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

import passport from 'passport';

import { FxaOAuthAuthGuard } from './fxa-oauth-auth.guard';
import { FxaOAuthJwtStrategy } from './fxa-oauth-jwt.strategy';
import { FxaOAuthVerifyStrategy } from './fxa-oauth-verify.strategy';
import { MockFxaOAuthConfig } from './fxa-oauth.config';

// Avoid a real JWKS fetch when the JWT strategy is constructed.
jest.mock('jwks-rsa', () => ({
  passportJwtSecret: jest.fn(
    () => (_req: unknown, _raw: unknown, done: (e: unknown, k: string) => void) =>
      done(null, 'mock-secret')
  ),
}));

const NORMALIZED_PATH = 'v1/billing-and-subscriptions';
const config = {
  ...MockFxaOAuthConfig,
  fxaOAuthServerUrl: 'http://localhost:9000',
};

/**
 * Runs as a normal unit test — no server, DB, or ports; jwks-rsa and fetch are
 * mocked. "Real passport chain" here means it wires the actual @nestjs/passport
 * + passport multi-strategy machinery (not handleRequest in isolation), because
 * the guard's 401-vs-503 verdict and auth.fail reason tag depend on an
 * in-process wiring assumption: that when an opaque (non-JWT) token makes the
 * JWT strategy fail and the verify strategy then also fails, passport delivers
 * BOTH failures to handleRequest as an `info` array. A passport upgrade that
 * changed that shape would regress the verdict — this test would catch it.
 */
describe('FxaOAuthAuthGuard (real passport chain)', () => {
  let guard: FxaOAuthAuthGuard;
  let statsd: jest.Mocked<Pick<StatsD, 'increment' | 'timing'>>;
  let logger: jest.Mocked<Pick<LoggerService, 'warn' | 'error' | 'log'>>;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    // Constructing the strategies registers them with passport under their
    // names ('fxa-oauth-jwt', 'fxa-oauth-verify'), which the guard resolves.
    new FxaOAuthJwtStrategy(config);
    new FxaOAuthVerifyStrategy(config);

    statsd = { increment: jest.fn(), timing: jest.fn() };
    logger = { warn: jest.fn(), error: jest.fn(), log: jest.fn() };
    guard = new FxaOAuthAuthGuard(
      logger as unknown as LoggerService,
      statsd as unknown as StatsD
    );
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    // Strategies register in passport's process-global registry by name;
    // de-register so this suite can't leak into others sharing those names.
    passport.unuse('fxa-oauth-jwt');
    passport.unuse('fxa-oauth-verify');
  });

  // An opaque token (no dots) makes the JWT strategy fail structurally, so the
  // verify strategy runs as the fallback.
  function contextForOpaqueToken(): ExecutionContext {
    const req = {
      method: 'GET',
      url: `/${NORMALIZED_PATH}`,
      headers: { authorization: 'Bearer opaque-not-a-jwt-token' },
      route: { path: `/${NORMALIZED_PATH}` },
    };
    return {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => ({}),
        getNext: () => undefined,
      }),
    } as unknown as ExecutionContext;
  }

  it('maps an opaque token + verify 5xx to 503 (upstream wins in the info array)', async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    } as Response);

    await expect(guard.canActivate(contextForOpaqueToken())).rejects.toThrow(
      ServiceUnavailableException
    );
    expect(statsd.increment).toHaveBeenCalledWith('auth.fail', {
      reason: 'OAuthVerifyServerError',
      path: NORMALIZED_PATH,
    });
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  it('maps an opaque token + verify 4xx to 401', async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
    } as Response);

    await expect(guard.canActivate(contextForOpaqueToken())).rejects.toThrow(
      UnauthorizedException
    );
    expect(statsd.increment).toHaveBeenCalledWith('auth.fail', {
      reason: 'OAuthTokenRejectedError',
      path: NORMALIZED_PATH,
    });
  });
});
