/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  mixin,
  Type,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { CustomsService } from '@fxa/shared/nestjs/customs';
import { SessionTokenResult } from './session-token.strategy';

export function GqlCustomsGuard(action: string): Type<CanActivate> {
  // This is a way to get injection and pass a parameter to the guard.
  @Injectable()
  class CustomsGuard implements CanActivate {
    constructor(@Inject(CustomsService) private customs: CustomsService) {
      if (!customs) {
        throw new Error('No customs service provided.');
      }
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const ctx = GqlExecutionContext.create(context);
      const req = ctx.getContext().req as Request;
      const { ip, headers, query } = req;
      const { email, uid } = (req.user as SessionTokenResult).session;

      await this.customs.check({
        action,
        email,
        uid,
        ip,
        headers,
        query,
      });
      return true;
    }
  }

  return mixin(CustomsGuard);
}
