/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  bind,
  ContextKeyTransforms as T,
  ModelContextProvider,
  ContextValidation as V,
  validateContext,
} from '../../lib/context';
import { ModelContext } from '../../lib/context/interfaces/model-context';

export class ClientInfo implements ModelContextProvider {
  @bind([V.isString, V.isHex], 'id')
  clientId: string | undefined;

  @bind([V.isString], T.snakeCase)
  imageUri: string | undefined;

  @bind([V.isString, V.isRequired], 'name')
  serviceName: string | undefined;

  @bind([V.isString], T.snakeCase)
  redirectUri: string | undefined;

  @bind([V.isBoolean])
  trusted: boolean | undefined;

  constructor(protected readonly context: ModelContext) {}

  getModelContext(): ModelContext {
    return this.context;
  }

  validate(): void {
    return validateContext(this);
  }
}
