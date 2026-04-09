/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

import { FxaOAuthConfig } from './fxa-oauth.config';
import {
  fxaAccessTokenClaimsSchema,
  FxaOAuthUser,
} from './fxa-access-token.schemas';

@Injectable()
export class FxaOAuthJwtStrategy extends PassportStrategy(
  Strategy,
  'fxa-oauth-jwt'
) {
  private requiredScope: string;

  constructor(config: FxaOAuthConfig) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: config.fxaOAuthJwksUri,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer: config.fxaOAuthIssuer,
      algorithms: ['RS256'],
      passReqToCallback: true,
    });
    this.requiredScope = config.fxaOAuthRequiredScope;
  }

  public validate(req: Request, claims: unknown): FxaOAuthUser {
    const result = fxaAccessTokenClaimsSchema.safeParse(claims);
    if (!result.success) {
      throw new UnauthorizedException('Invalid token claims');
    }

    const scopes = result.data.scope?.split(' ') ?? [];
    if (!scopes.includes(this.requiredScope)) {
      throw new UnauthorizedException('Insufficient scope');
    }

    return {
      sub: result.data.sub,
      client_id: result.data.client_id,
      scope: scopes,
    };
  }
}
