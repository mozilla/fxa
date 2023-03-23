/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelContext } from './model-context';

export interface ModelContextProvider extends Record<string, any> {
  getModelContext(): ModelContext;
  validate(): void;
}

export abstract class ModelDataProvider implements ModelContextProvider {
  abstract validate(): void;

  getModelContext() {
    return this.context;
  }

  isValid() {
    try {
      this.validate();
    } catch (error) {
      return false;
    }
    return true;
  }

  constructor(protected readonly context: ModelContext) {}
}
