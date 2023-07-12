/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  IsEmail,
  MinLength,
  IsOptional,
  IsNotEmpty,
  ValidationArguments,
} from 'class-validator';

// ❌ ResetPassword doesn't require query params, but this is an example of
// how we can make a schema for them using `class-validator` to validate.
export class ResetPasswordQueryParams {
  @IsEmail()
  @IsNotEmpty()
  email = '';

  @IsOptional()
  @MinLength(3, {
    message: (args: ValidationArguments) => {
      // probably want to handle this differently, this was pulled straight from the docs
      // just to show this is possible
      if (args.value.length === 1) {
        return 'Too short, minimum length is 1 character';
      } else {
        return (
          'Too short, minimum length is ' + args.constraints[0] + ' characters'
        );
      }
    },
  })
  someOtherParam?: string;
}

// ❌ What AccountRecoveryKeyInfo might look like, e.g. a non-query param schema
export class AccountRecoveryKeyInfo {
  @IsNotEmpty()
  accountResetToken = '';

  @IsNotEmpty()
  kB = '';

  @IsNotEmpty()
  recoveryKeyId = '';
}
