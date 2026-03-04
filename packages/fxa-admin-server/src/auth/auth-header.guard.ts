/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Observable } from 'rxjs';

import { AppConfig } from '../config';

@Injectable()
export class AuthHeaderGuard implements CanActivate {
  private authHeader: string;

  constructor(configService: ConfigService<AppConfig>) {
    this.authHeader = configService.get('authHeader') as string;
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const username = request.get(this.authHeader);
    if (username) {
      (request as any).user = username;
    }
    return !!username;
  }
}

/** @deprecated Use AuthHeaderGuard instead */
export const GqlAuthHeaderGuard = AuthHeaderGuard;
