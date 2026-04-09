/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';

import { FxaOAuthConfig } from './fxa-oauth.config';
import {
  FxaOAuthUser,
  fxaVerifyResponseSchema,
} from './fxa-access-token.schemas';

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
      async (req: Request, done: (err: Error | null, user?: any) => void) => {
        try {
          const claims = await this.verifyToken(req);
          done(null, claims);
        } catch (err) {
          done(null, false);
        }
      }
    );
    this.verifyUrl = `${config.fxaOAuthServerUrl}/v1/verify`;
    this.requiredScope = config.fxaOAuthRequiredScope;
  }

  private async verifyToken(req: Request): Promise<FxaOAuthUser> {
    const token = this.extractBearerToken(req);
    if (!token) {
      throw new UnauthorizedException('Bearer token not provided');
    }

    const res = await fetch(this.verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      throw new UnauthorizedException('Bearer token invalid');
    }

    const verifyResult = fxaVerifyResponseSchema.safeParse(await res.json());
    if (!verifyResult.success) {
      throw new UnauthorizedException('Invalid verify response');
    }
    const body = verifyResult.data;

    if (!body.scope?.includes(this.requiredScope)) {
      throw new UnauthorizedException('Insufficient scope');
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
