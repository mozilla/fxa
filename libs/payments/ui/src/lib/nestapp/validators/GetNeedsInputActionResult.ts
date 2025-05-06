/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { NeedsInputType } from '@fxa/payments/cart';
import { Type } from 'class-transformer';

class NextActionData {
  @IsString()
  clientSecret!: string;
}

export class getNeedsInputActionResult {
  @IsEnum(NeedsInputType)
  inputType!: NeedsInputType;

  @ValidateNested()
  @Type(() => NextActionData)
  data!: NextActionData;
}
