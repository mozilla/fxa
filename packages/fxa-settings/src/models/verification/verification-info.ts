/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  ContextKeyTransforms,
  ContextValidation,
  ContextValidationErrors,
  ModelContext,
  ModelContextProvider,
  bind,
  validateContext,
} from '../../lib/context';

export * from './verification-info';

export type VerificationInfoLinkStatus = 'expired' | 'damaged' | 'valid';

const { isEmail, isRequired, isVerificationCode, isHex, isString, isBoolean } =
  ContextValidation;
const { snakeCase } = ContextKeyTransforms;

export class VerificationInfo implements ModelContextProvider {
  @bind([isEmail, isRequired])
  email: string = '';

  @bind([isEmail, isRequired])
  emailToHashWith: string = '';

  @bind([isVerificationCode, isRequired])
  code: string = '';

  @bind([isHex, isRequired])
  token: string = '';

  @bind([isString, isRequired])
  uid: string = '';

  @bind([isBoolean], snakeCase)
  forceAuth: boolean = false;

  @bind([isBoolean])
  lostRecoveryKey: boolean | undefined;

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
