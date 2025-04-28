/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { CustomsService } from 'fxa-shared/nestjs/customs/customs.service';

import { SessionTokenResult } from './session-token.strategy';

@Injectable()
export class GqlCustomsGuard implements CanActivate {
  constructor(private customs: CustomsService) {
    if (!customs) {
      throw new Error('No customs service provided.');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req as Request;
    const { email } = (req.user as SessionTokenResult).session;
    const handlerName = context.getHandler().name;
    const className = (context as any).constructorRef.name;
    const customsName = [className, handlerName].join('.');
    await this.customs.check({
      action: customsName,
      email,
      ip: req.ip ?? 'unknown', // req.ip may be undefined, but the original contract expects a string
      headers: req.headers,
      query: req.query,
    });
    return true;
  }
}
