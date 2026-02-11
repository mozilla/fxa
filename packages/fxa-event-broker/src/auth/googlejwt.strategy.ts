/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AppConfig } from '../config';
import { PubSubJWT } from './pubsubclaim.interface';

@Injectable()
export class GoogleJwtStrategy extends PassportStrategy(Strategy, 'googlejwt') {
  private verificationToken: string;

  constructor(configService: ConfigService<AppConfig>) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer: 'https://accounts.google.com',
      algorithms: ['RS256'],
      audience: (configService.get('pubsub') as AppConfig['pubsub']).audience,

      // Ensure we make request available to validate function for token verification.
      passReqToCallback: true,
    });
    this.verificationToken = (configService.get(
      'pubsub'
    ) as AppConfig['pubsub']).verificationToken;
  }

  /**
   * Validate that the given verified JWT payload is valid.
   *
   * @param claim Validated JWT payload
   * @param done
   */
  public validate(
    request: Request,
    claim: PubSubJWT,
    done: (err: Error | null, result: PubSubJWT | null) => void
  ): void {
    if (request.query.token !== this.verificationToken) {
      done(new UnauthorizedException(), null);
      return;
    }
    done(null, claim);
  }
}
