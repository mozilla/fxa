/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
  ValidatorConstraint,
  type ValidationArguments,
  type ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'ResultErrorConsistency', async: false })
class ResultErrorConsistency implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as TemplateResult;

    if (obj.ok) {
      return obj.result != null && obj.errorMessage == null;
    }

    return obj.result == null && typeof obj.errorMessage === 'string';
  }

  defaultMessage() {
    return 'Invalid combination of ok, result, and errorMessage';
  }
}

class TemplateSuccessResponse {
  @IsString()
  id!: string;
}

export class TemplateResult {
  @IsBoolean()
  ok!: boolean;

  @ValidateNested()
  @Type(() => TemplateSuccessResponse)
  @IsOptional()
  result!: TemplateSuccessResponse | null;

  @IsString()
  @IsOptional()
  errorMessage!: string | null;

  @Validate(ResultErrorConsistency)
  _consistencyCheck!: boolean;
}
