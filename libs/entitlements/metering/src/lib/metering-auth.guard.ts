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
 * Validates the `Authorization: Bearer <token>` header against the
 * `MeteringConfig.clients` env-provisioned `{ clientId: secret }` map.
 *
 * The guard precomputes a `secret -> clientId` lookup at construction time.
 * On each request it does a single `Map.get` on the inbound bearer token —
 * no per-client linear scan, no Strapi round-trip. On hit it attaches
 * `{ clientId }` to the request for the `@CurrentMeteringClient()` decorator.
 *
 * Two clients sharing a secret throws at construction. Without this check
 * the second `Map.set` silently overwrites the first and *all* traffic for
 * that secret authenticates as the wrong client. We refuse to start rather
 * than route to the wrong principal.
 */
@Injectable()
export class MeteringAuthGuard implements CanActivate {
  private readonly clientIdByToken: Map<string, string>;

  constructor(meteringConfig: MeteringConfig) {
    this.clientIdByToken = new Map();
    for (const [clientId, secret] of Object.entries(meteringConfig.clients ?? {})) {
      const existing = this.clientIdByToken.get(secret);
      if (existing !== undefined) {
        throw new Error(
          `MeteringConfig.clients[${clientId}] and clients[${existing}] share the same secret`
        );
      }
      this.clientIdByToken.set(secret, clientId);
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithClient>();
    return this.authorize(request);
  }

  /**
   * Exposed for unit testing: operates on a plain request object so callers
   * don't need to construct an `ExecutionContext`. Mutates the request to
   * attach the matched client on success.
   */
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

export const CurrentMeteringClient = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedMeteringClient => {
    const request = context.switchToHttp().getRequest<RequestWithClient>();
    const authenticatedMeteringClient = request[REQUEST_CLIENT_KEY];
    if (!authenticatedMeteringClient) {
      throw new UnauthorizedException();
    }
    return authenticatedMeteringClient;
  }
);
