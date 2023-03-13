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
  ModelDataProvider,
} from '../../../lib/context';

export class CompleteResetPasswordLink
  extends ModelDataProvider
  implements ModelContextProvider
{
  // TODO: change `isNonEmptyString` to `email` when validation is properly set up.
  // This is temporary for tests/Storybook so that `email=''` shows a damaged link
  @bind([V.isNonEmptyString, V.isRequired])
  email: string = '';

  // TODO: add @bind `isEmail` when validation is properly set up.
  // This should be _optional_ but when this exists it should be an email.
  emailToHashWith: string = '';

  @bind([V.isNonEmptyString, V.isRequired])
  code: string = '';

  @bind([V.isHex, V.isRequired])
  token: string = '';

  constructor(public readonly context: ModelContext) {
    super(context);
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
