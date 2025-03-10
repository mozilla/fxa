/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { deriveHawkCredentials } from 'fxa-auth-client';
import { SessionToken } from 'fxa-shared/db/models/auth/session-token';
import { ExtendedError } from 'fxa-shared/nestjs/error';
import { Strategy } from 'passport-http-bearer';

export interface SessionTokenResult {
  token: string;
  session: SessionToken;
}

export const SESSION_TOKEN_REGEX = /^(?:[a-fA-F0-9]{2})+$/;

export async function validateSessionToken(token: string) {
  try {
    if (!SESSION_TOKEN_REGEX.test(token)) {
      throw new UnauthorizedException('Invalid token');
    }
    const { id } = await deriveHawkCredentials(token, 'sessionToken');
    const session = await SessionToken.findByTokenId(id);
    if (!session) {
      throw new UnauthorizedException('Invalid token');
    }
    if (
      session.mustVerify &&
      (!session.tokenVerified || !session.emailVerified)
    ) {
      throw new UnauthorizedException('Must verify');
    }
    return { token, session };
  } catch (err) {
    if (err.status) {
      // Re-throw NestJS errors that include a status.
      throw err;
    }
    throw ExtendedError.withCause(
      'Unexpected error during authentication.',
      err
    );
  }
}

@Injectable()
export class SessionTokenStrategy extends PassportStrategy(Strategy) {
  async validate(token: string): Promise<SessionTokenResult> {
    return validateSessionToken(token);
  }
}
