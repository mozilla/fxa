/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

import Config, { AppConfig } from '../config';

@Injectable()
export class AuthHeaderGuard implements CanActivate {
  private authHeader: string;
  private dev: boolean;

  constructor(configService: ConfigService<AppConfig>) {
    this.authHeader = configService.get('authHeader') as string;
    this.dev = Config.get('env') === 'development';
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (this.dev) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const username = request.get(this.authHeader);
    if (username) {
      (request as any).user = username;
    }
    return !!username;
  }
}
