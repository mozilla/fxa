/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { OAuth2Client } from 'google-auth-library';

import { MeteringConfig } from './metering.config';
import { extractBearerToken } from './utils/extractBearerToken';

interface BearerRequest {
  headers: { authorization?: string | string[] };
}

@Injectable()
export class MeteringCloudTasksGuard implements CanActivate {
  private readonly oauth: OAuth2Client;
  private readonly audience: string;
  private readonly runnerEmail: string;
  private readonly useLocalEmulator: boolean;

  constructor(meteringConfig: MeteringConfig) {
    const { useLocalEmulator, oidc } = meteringConfig.cloudTasks;
    this.useLocalEmulator = useLocalEmulator === true;
    if (!this.useLocalEmulator && (!oidc?.aud || !oidc?.serviceAccountEmail)) {
      throw new Error(
        'MeteringConfig.cloudTasks.oidc.aud and serviceAccountEmail are required for the threshold-check handler'
      );
    }
    this.audience = oidc?.aud ?? '';
    this.runnerEmail = (oidc?.serviceAccountEmail ?? '').trim().toLowerCase();
    this.oauth = new OAuth2Client();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.useLocalEmulator) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    await this.authorize(request);
    return true;
  }

  async authorize(request: BearerRequest): Promise<void> {
    const token = extractBearerToken(request.headers.authorization);
    if (!token) {
      throw new UnauthorizedException();
    }

    const ticket = await this.oauth
      .verifyIdToken({ idToken: token, audience: this.audience })
      .catch(() => {
        throw new UnauthorizedException();
      });

    const email = ticket.getPayload()?.email?.trim().toLowerCase();
    if (!email || email !== this.runnerEmail) {
      throw new UnauthorizedException();
    }
  }
}
