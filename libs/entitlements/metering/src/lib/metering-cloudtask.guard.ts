/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import type { Request } from 'express';

import { MeteringConfig } from './metering.config';
import { extractBearerToken } from './utils/extractBearerToken';

interface BearerRequest {
  headers: { authorization?: string | string[] };
}

/**
 * Verifies that an inbound request carries a Google OIDC ID token issued by
 * the configured Cloud Tasks runner service account, matching the
 * configured audience.
 */
@Injectable()
export class MeteringCloudTaskGuard implements CanActivate {
  private readonly oauth: OAuth2Client;
  private readonly audience: string;
  private readonly runnerEmail: string;

  constructor(meteringConfig: MeteringConfig) {
    const oidc = meteringConfig.cloudTasks?.oidc;
    if (!oidc || !oidc.aud || !oidc.serviceAccountEmail) {
      throw new Error(
        'MeteringConfig.cloudTasks.oidc.aud and serviceAccountEmail are required for the threshold-check handler'
      );
    }
    this.audience = oidc.aud;
    this.runnerEmail = oidc.serviceAccountEmail;
    this.oauth = new OAuth2Client();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    await this.authorize(request);
    return true;
  }

  async authorize(request: BearerRequest): Promise<void> {
    const token = extractBearerToken(request.headers.authorization);
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }
    let payload;
    try {
      const ticket = await this.oauth.verifyIdToken({
        idToken: token,
        audience: this.audience,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid bearer token');
    }
    if (!payload || payload.email !== this.runnerEmail) {
      throw new UnauthorizedException('Token email does not match runner');
    }
  }
}

