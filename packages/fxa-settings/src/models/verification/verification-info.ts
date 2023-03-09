/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  bind,
  ContextValidation as V,
  ContextKeyTransforms as T,
  ModelContextProvider,
  validateContext,
  ContextValidationErrors,
  ModelContext,
} from '../../lib/context';

export * from './verification-info';

export type VerificationInfoLinkStatus = 'expired' | 'damaged' | 'valid';

export class VerificationInfo implements ModelContextProvider {
  @bind([V.isEmail, V.isRequired])
  email: string = '';

  @bind([V.isEmail, V.isRequired])
  emailToHashWith: string = '';

  @bind([V.isVerificationCode, V.isRequired])
  code: string = '';

  @bind([V.isHex, V.isRequired])
  token: string = '';

  @bind([V.isString, V.isRequired])
  uid: string = '';

  @bind([V.isBoolean], T.snakeCase)
  forceAuth: boolean = false;

  constructor(public readonly context: ModelContext) {}
  [x: string]: any;
  getModelContext(): ModelContext {
    return this.context;
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
