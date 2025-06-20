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
import { CheckOptions, CustomsService } from '@fxa/shared/nestjs/customs';
import { SessionTokenResult } from './session-token.strategy';
import * as Sentry from '@sentry/nestjs';

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

      const opts: CheckOptions = {
        action,
        email,
        uid,
        ip,
        headers,
        query,
      };
      if (ip && email) {
        opts.ip_email = `${ip}_${email}`;
      }
      if (ip && uid) {
        opts.ip_uid = `${ip}_${uid}`;
      }

      try {
        await this.customs.check(opts);
      } catch (err) {
        Sentry.captureException(err, {
          tags: {
            source: 'customs',
            action,
            ip_email: !!opts.ip_email,
            ip_uid: !!opts.ip_uid,
            ip: !!opts.ip,
            email: !!opts.email,
            uid: !!opts.uid,
          },
        });
      }
      return true;
    }
  }

  return mixin(CustomsGuard);
}
