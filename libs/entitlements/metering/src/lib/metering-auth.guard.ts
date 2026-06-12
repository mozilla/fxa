/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import type { Request } from 'express';

import { MeteringConfig } from './metering.config';
import { extractBearerToken } from './utils/extractBearerToken';

export interface AuthenticatedMeteringClient {
  clientId: string;
}

const REQUEST_CLIENT_KEY = '__meteringClient';

interface RequestWithClient extends Request {
  [REQUEST_CLIENT_KEY]?: AuthenticatedMeteringClient;
}

/**
 * Validates `Authorization: Bearer <token>` against
 * `MeteringConfig.clients` `{ clientId: secret }`
 */
@Injectable()
export class MeteringAuthGuard implements CanActivate {
  private readonly clientIdByToken: Map<string, string>;

  constructor(meteringConfig: MeteringConfig) {
    this.clientIdByToken = new Map();
    for (const [clientId, secret] of Object.entries(
      meteringConfig.clients ?? {}
    )) {
      const normalizedSecret = typeof secret === 'string' ? secret.trim() : '';
      if (normalizedSecret.length === 0) {
        throw new Error(
          `MeteringConfig.clients[${clientId}] has an empty secret`
        );
      }
      const existing = this.clientIdByToken.get(normalizedSecret);
      if (existing !== undefined) {
        throw new Error(
          `MeteringConfig.clients[${clientId}] and clients[${existing}] share the same secret`
        );
      }
      this.clientIdByToken.set(normalizedSecret, clientId);
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithClient>();
    return this.authorize(request);
  }

  authorize(request: {
    headers: Request['headers'];
    [REQUEST_CLIENT_KEY]?: AuthenticatedMeteringClient;
  }): boolean {
    const token = extractBearerToken(request.headers['authorization']);
    if (!token) {
      throw new UnauthorizedException();
    }

    const clientId = this.clientIdByToken.get(token);
    if (!clientId) {
      throw new UnauthorizedException();
    }

    request[REQUEST_CLIENT_KEY] = { clientId };
    return true;
  }
}

export function meteringClientFromRequest(request: {
  [REQUEST_CLIENT_KEY]?: AuthenticatedMeteringClient;
}): AuthenticatedMeteringClient {
  const authenticatedMeteringClient = request[REQUEST_CLIENT_KEY];
  if (!authenticatedMeteringClient) {
    throw new UnauthorizedException();
  }
  return authenticatedMeteringClient;
}

export const CurrentMeteringClient = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedMeteringClient =>
    meteringClientFromRequest(
      context.switchToHttp().getRequest<RequestWithClient>()
    )
);
