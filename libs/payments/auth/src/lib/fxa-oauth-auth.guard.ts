/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

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
]) {}
