/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MozLoggerService } from '@fxa/shared/mozlog';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import {
  AdminPanelEnv,
  AdminPanelFeature,
  AdminPanelGuard,
  USER_GROUP_HEADER,
} from 'fxa-shared/guards';
import config from '../config';
import { FEATURE_KEY } from './user-group-header.decorator';

const guard = new AdminPanelGuard(config.get('guard.env') as AdminPanelEnv);

@Injectable()
export class UserGroupGuard implements CanActivate {
  constructor(private reflector?: Reflector, private log?: MozLoggerService) {}

  canActivate(context: ExecutionContext): boolean {
    // Reflect on the end point to determine if it has been tagged with admin panel feature.
    // If it does, check to make sure the user's group has a permission level that permits access.
    const features =
      this.reflector?.getAllAndOverride<AdminPanelFeature[]>(FEATURE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    if (features.length === 0) {
      return true;
    }

    // Requires different setup depending on context type. Currently
    // guards are only applied to GQL contexts.
    let userGroupHeader = '';
    if (context.getType().toString() === 'graphql') {
      userGroupHeader =
        GqlExecutionContext.create(context)
          ?.getContext()
          ?.req?.get(USER_GROUP_HEADER) || '';
    }
    this.log?.info('userGroupHeader', { userGroupHeader });

    const group = guard.getBestGroup(userGroupHeader);
    const allowed = features.some((x) => guard.allow(x, group));
    return allowed;
  }
}
