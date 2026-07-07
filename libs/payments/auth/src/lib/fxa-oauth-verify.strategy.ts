/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';

import { FxaOAuthConfig } from './fxa-oauth.config';
import {
  FxaOAuthUser,
  fxaVerifyResponseSchema,
} from './fxa-access-token.schemas';
import {
  NoBearerTokenError,
  OAuthTokenRejectedError,
  OAuthVerifyNetworkError,
  OAuthVerifyResponseParseError,
  OAuthVerifyResponseSchemaError,
  OAuthVerifyServerError,
  VerifyInsufficientScopeError,
} from './fxa-oauth.error';

/**
 * Passport strategy that validates opaque FxA OAuth access tokens by calling
 * the auth server's POST /v1/verify endpoint. This is the same verification
 * path used by the profile server and the auth server's own oauthToken scheme.
 *
 * Used as a fallback when the token is not a JWT (see FxaOAuthJwtStrategy).
 */
@Injectable()
export class FxaOAuthVerifyStrategy extends PassportStrategy(
  Strategy,
  'fxa-oauth-verify'
) {
  private verifyUrl: string;
  private requiredScope: string;

  constructor(config: FxaOAuthConfig) {
    super(
      async (
        req: Request,
        done: (err: Error | null, user?: any, info?: any) => void
      ) => {
        try {
          const claims = await this.verifyToken(req);
          done(null, claims);
        } catch (err) {
          // Surface the specific failure to the guard instead of swallowing it,
          // so operators can distinguish a rejected token from an auth-server
          // outage. The verdict is unchanged: auth still fails.
          done(null, false, err);
        }
      }
    );
    this.verifyUrl = `${config.fxaOAuthServerUrl}/v1/verify`;
    this.requiredScope = config.fxaOAuthRequiredScope;
  }

  private async verifyToken(req: Request): Promise<FxaOAuthUser> {
    const token = this.extractBearerToken(req);
    if (!token) {
      throw new NoBearerTokenError();
    }

    let res: Response;
    try {
      res = await fetch(this.verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
    } catch (err) {
      // Network-level failure reaching the auth server — an outage, not a bad
      // token.
      throw new OAuthVerifyNetworkError(
        err instanceof Error ? err : new Error(String(err))
      );
    }

    if (!res.ok) {
      // 5xx from the auth server is an upstream problem; 4xx means the token
      // was rejected.
      throw res.status >= 500
        ? new OAuthVerifyServerError(res.status)
        : new OAuthTokenRejectedError(res.status);
    }

    let payload: unknown;
    try {
      payload = await res.json();
    } catch (err) {
      throw new OAuthVerifyResponseParseError(
        err instanceof Error ? err : new Error(String(err))
      );
    }

    const verifyResult = fxaVerifyResponseSchema.safeParse(payload);
    if (!verifyResult.success) {
      throw new OAuthVerifyResponseSchemaError();
    }
    const body = verifyResult.data;

    if (!body.scope?.includes(this.requiredScope)) {
      throw new VerifyInsufficientScopeError();
    }

    return {
      sub: body.user,
      client_id: body.client_id,
      scope: body.scope,
    };
  }

  private extractBearerToken(req: Request): string | null {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      return null;
    }
    return auth.slice(7);
  }
}
