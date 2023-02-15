/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  bind,
  ModelContext,
  ContextKeyTransforms as T,
  ModelContextProvider,
  ContextValidation as V,
  validateContext,
} from '../../lib/context';

export class ChannelInfo implements ModelContextProvider {
  @bind([V.isChannelId], T.snakeCase)
  channelId: string | undefined;

  @bind([V.isChannelKey], T.snakeCase)
  channelKey: string | undefined;

  constructor(protected readonly context: ModelContext) {}

  getModelContext(): ModelContext {
    return this.context;
  }

  validate(): void {
    return validateContext(this);
  }
}
