/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import AuthClient from 'fxa-auth-client';
import { ExtendedError } from 'fxa-shared/nestjs/error';
import { Strategy } from 'passport-http-bearer';

import { AuthClientService } from '../backend/auth-client.service';

// Unwrap the type from a promise
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

export interface SessionTokenResult {
  token: string;
  session: ThenArg<ReturnType<AuthClient['sessionStatus']>>;
}

@Injectable()
export class SessionTokenStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(AuthClientService) private authAPI: AuthClient) {
    super({});
  }

  async validate(token: string): Promise<SessionTokenResult> {
    try {
      const session = await this.authAPI.sessionStatus(token);
      return { token, session };
    } catch (err) {
      if (err.code === 400 || err.code === 401) {
        // AuthenticationError doesn't allow us to pass along the error code,
        // but the error message is unique for most auth-server errors.
        throw new UnauthorizedException(err.message);
      } else {
        throw ExtendedError.withCause(
          'Unexpected error during authentication.',
          err
        );
      }
    }
  }
}
