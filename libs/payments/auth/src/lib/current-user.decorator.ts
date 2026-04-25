/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { FxaOAuthUser } from './fxa-access-token.schemas';

export const CurrentUser = createParamDecorator<
  unknown,
  ExecutionContext,
  FxaOAuthUser
>((_data, context) => context.switchToHttp().getRequest().user);
