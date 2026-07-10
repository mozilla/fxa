/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MozLoggerService } from '@fxa/shared/mozlog';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  GuardEnv,
  AdminPanelFeature,
  AdminPanelGuard,
  USER_GROUP_HEADER,
} from '@fxa/shared/guards';
import config from '../config';
import { FEATURE_KEY } from './user-group-header.decorator';

const guard = new AdminPanelGuard(config.get('guard.env') as GuardEnv);

@Injectable()
export class UserGroupGuard implements CanActivate {
  constructor(
    private reflector?: Reflector,
    private log?: MozLoggerService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const features =
      this.reflector?.getAllAndOverride<AdminPanelFeature[]>(FEATURE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    if (features.length === 0) {
      return true;
    }

    let userGroupHeader = '';
    if (context.getType() === 'http') {
      userGroupHeader =
        context.switchToHttp().getRequest().get(USER_GROUP_HEADER) || '';
    }
    this.log?.info('userGroupHeader', { userGroupHeader });

    const group = guard.getBestGroup(userGroupHeader);
    const allowed = features.some((x) => guard.allow(x, group));
    return allowed;
  }
}
