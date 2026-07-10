/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
  type LoggerService,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { StatsD } from 'hot-shots';

import { StatsDService, normalizeRoute } from '@fxa/shared/metrics/statsd';
import { FxaOAuthError, OAuthVerifyUpstreamError } from './fxa-oauth.error';

/**
 * StatsD counter incremented once per auth rejection, tagged { reason, path }.
 * `reason` is the failing error's class name (see fxa-oauth.error.ts), so that
 * set must stay small and stable — it is a metric tag dimension, and an
 * unbounded/renamed set would blow up cardinality or break dashboards.
 */
export const AUTH_FAIL_METRIC = 'auth.fail';

/**
 * Passport hands a multi-strategy guard the failures from every strategy that
 * ran — as `err` and/or an array of `info`, in strategy order. For an opaque
 * token the JWT strategy always "fails" first (it isn't a JWT), so its error is
 * noise; the meaningful verdict comes from the verify strategy's FxaOAuthError.
 *
 * Selection order matters: an upstream fault must win even when another
 * FxaOAuthError precedes it in the array (e.g. a JWT-scope failure followed by
 * a verify 5xx), otherwise the outage would be reported as a 401. So prefer any
 * OAuthVerifyUpstreamError, then any FxaOAuthError, then whatever passport
 * surfaced (e.g. a passport-jwt TokenExpiredError) — all bounded, useful names.
 */
function pickAuthError(err: unknown, info: unknown): Error | undefined {
  const candidates = [err, ...(Array.isArray(info) ? info : [info])].filter(
    (c): c is Error => c instanceof Error
  );
  return (
    candidates.find((c) => c instanceof OAuthVerifyUpstreamError) ??
    candidates.find((c) => c instanceof FxaOAuthError) ??
    candidates[0]
  );
}

/**
 * Route guard that validates FxA OAuth access tokens.
 *
 * Accepts both token formats via Authorization: Bearer <token>:
 *
 *  1. JWT access tokens — validated locally via JWKS (fast, no network call).
 *     Requires the OAuth client to be in jwtAccessTokens.enabledClientIds.
 *     See FxaOAuthJwtStrategy (./fxa-oauth-jwt.strategy.ts).
 *
 *  2. Opaque hex access tokens — validated by calling POST {auth-server}/v1/verify,
 *     the same path used by the profile server and the auth server's own
 *     oauthToken scheme. See FxaOAuthVerifyStrategy (./fxa-oauth-verify.strategy.ts).
 *
 * The JWT strategy is tried first. If it fails (token is not a JWT), the
 * verify strategy handles it as a fallback.
 *
 * Requirements:
 *  - Token must include the scope from FXA_O_AUTH_CONFIG__FXA_O_AUTH_REQUIRED_SCOPE.
 *  - For JWTs: issuer must match oauthServer.openid.issuer (localhost:3030 in dev).
 *  - Auth server URL set via FXA_O_AUTH_CONFIG__FXA_O_AUTH_SERVER_URL for verify fallback.
 */
@Injectable()
export class FxaOAuthAuthGuard extends AuthGuard([
  'fxa-oauth-jwt',
  'fxa-oauth-verify',
]) {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    @Inject(StatsDService) private readonly statsd: StatsD
  ) {
    super();
  }

  override handleRequest<TUser = any>(
    err: any,
    user: TUser,
    info: any,
    context: ExecutionContext
  ): TUser {
    if (user) {
      return user;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const path = normalizeRoute(req.route?.path);
    const authError = pickAuthError(err, info);
    const reason = authError?.name ?? 'unknown';

    this.statsd.increment(AUTH_FAIL_METRIC, { reason, path });

    const line = `auth.fail reason=${reason} method=${req.method} path=${path}${
      authError ? ` msg="${authError.message}"` : ''
    }`;

    if (authError instanceof OAuthVerifyUpstreamError) {
      // The auth server was unreachable or errored — this is our failure, not a
      // bad token. Surface it as 503 so it isn't miscounted as a client 401.
      this.logger.error(line, FxaOAuthAuthGuard.name);
      throw new ServiceUnavailableException();
    }

    // Genuine auth rejection. Throw a fresh 401 rather than re-throwing the
    // underlying error, which may be a non-HTTP BaseError (would become a 500).
    this.logger.warn(line, FxaOAuthAuthGuard.name);
    throw new UnauthorizedException();
  }
}
