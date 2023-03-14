/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  bind,
  ContextValidation,
  ModelContextProvider,
  ModelContext,
  validateContext,
  ContextValidationErrors,
} from '../../lib/context';

const { isNonEmptyString, isRequired } = ContextValidation;

export class AccountRecoveryKeyInfo implements ModelContextProvider {
  @bind([isNonEmptyString, isRequired])
  accountResetToken: string = '';

  @bind([isNonEmptyString, isRequired])
  kB: string = '';

  @bind([isNonEmptyString, isRequired])
  recoveryKeyId: string = '';

  constructor(public readonly context: ModelContext) {}

  isValid() {
    try {
      this.validate();
      return true;
    } catch (err) {
      if (err instanceof ContextValidationErrors) {
        console.error(
          err.errors.map((x) => `${x.key}-${x.value}-${x.message}`)
        );
        return false;
      }
      throw err;
    }
  }

  getModelContext() {
    return this.context;
  }

  validate(): void {
    validateContext(this);
  }
}
