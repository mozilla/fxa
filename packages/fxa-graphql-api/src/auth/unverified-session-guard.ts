/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { deriveHawkCredentials } from '@fxa/accounts/auth-client';
import { SessionToken } from 'fxa-shared/db/models/auth/session-token';
import { IncomingHttpHeaders } from 'http';
import { SESSION_TOKEN_REGEX } from './session-token.strategy';

/**
 * This is a guard that explicitly requires a valid session token, but
 * does not require that the session token be verified. There is really
 * a limited applicability to this... It was introduced to allow
 * us to validate unverified sessions during TOTP checks. In this case
 * calls are made to graphql containing unverified session tokens. The
 * act of submitting the TOTP is what validates the session, and
 * therefore we need a guard that specifically does not check the session
 * tokens verified status.
 *
 * Note: Our default AuthGuard requires that session tokens be verified. Note,
 * that the pattern used for this only has access to the token itself,
 * and lacks access to the greater context. As a result, the code in
 * session-token.strategy has no good way to conditionally skip the verified
 * check.
 */
export class UnverifiedSessionGuard implements CanActivate {
  extractSessionToken(req: { headers: IncomingHttpHeaders }) {
    const bearerToken = req.headers.authorization;
    if (bearerToken == null) {
      throw new UnauthorizedException('Invalid token');
    }
    if (!bearerToken.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid token');
    }

    const token = bearerToken?.replace('Bearer ', '');
    if (!SESSION_TOKEN_REGEX.test(token)) {
      throw new UnauthorizedException('Invalid token');
    }
    return token;
  }

  async resolveSessionToken(token: string) {
    const { id } = await deriveHawkCredentials(token, 'sessionToken');
    const session = await SessionToken.findByTokenId(id);
    if (!session) {
      throw new UnauthorizedException('Invalid token');
    }
    return session;
  }

  getRequest(context: ExecutionContext): {
    headers: IncomingHttpHeaders;
    user: any;
  } {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = this.getRequest(context);
    const token = this.extractSessionToken(req);
    const session = await this.resolveSessionToken(token);
    req.user = {
      token,
      session,
    };
    return true;
  }
}
