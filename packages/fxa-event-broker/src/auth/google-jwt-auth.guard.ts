import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

import { AppConfig } from '../config';

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
@Injectable()
export class GoogleJwtAuthGuard extends AuthGuard('googlejwt') {
  private env: string;

  constructor(configService: ConfigService<AppConfig>) {
    super();
    this.env = configService.get('env') as string;
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (this.env === 'development') {
      return true;
    } else {
      return super.canActivate(context);
    }
  }
}
