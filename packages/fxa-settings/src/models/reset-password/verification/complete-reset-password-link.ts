/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  bind,
  ContextValidation as V,
  ModelContextProvider,
  validateContext,
  ContextValidationErrors,
  ModelContext,
} from '../../../lib/context';
import { CompleteResetPasswordParams } from '../../../pages/ResetPassword/CompleteResetPassword';

export class CompleteResetPasswordLinkValidator
  implements ModelContextProvider
{
  @bind([V.isEmail, V.isRequired])
  email: string = '';

  @bind([V.isEmail])
  emailToHashWith: string = '';

  @bind([V.isString, V.isRequired])
  code: string = '';

  @bind([V.isHex, V.isRequired])
  token: string = '';

  constructor(public readonly context: ModelContext) {}
  [x: string]: any;
  getModelContext(): ModelContext {
    return this.context;
  }

  getModelValues(): CompleteResetPasswordParams {
    return {
      email: this.email,
      emailToHashWith: this.emailToHashWith,
      code: this.code,
      token: this.token,
    };
  }

  isValid() {
    try {
      this.validate();
    } catch (error) {
      console.error(error);
      return false;
    }
    return true;
  }

  validate(): void {
    validateContext(this);
  }

  tryValidate(): { isValid: boolean; error?: ContextValidationErrors } {
    let error: ContextValidationErrors | undefined;
    let isValid = true;
    try {
      this.validate();
    } catch (err) {
      console.error(err);
      isValid = false;
      if (err instanceof ContextValidationErrors) {
        error = err;
      } else {
        throw err;
      }
    }

    return {
      isValid,
      error,
    };
  }
}
