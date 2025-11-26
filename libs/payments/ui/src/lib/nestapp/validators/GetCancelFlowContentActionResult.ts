/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator';

export class GetCancelFlowContentActionResult {
  @IsString()
  @IsIn(['not_found', 'cancel'])
  flowType!: 'not_found' | 'cancel';

  @ValidateIf((o) => o.flowType !== 'not_found')
  @IsBoolean()
  active!: boolean;

  @ValidateIf((o) => o.flowType !== 'not_found')
  @IsBoolean()
  cancelAtPeriodEnd!: boolean;

  @ValidateIf((o) => o.flowType !== 'not_found')
  @IsNumber()
  currentPeriodEnd!: number;

  @ValidateIf((o) => o.flowType !== 'not_found')
  @IsString()
  productName!: string;

  @ValidateIf((o) => o.flowType !== 'not_found')
  @IsString()
  supportUrl!: string;

  @ValidateIf((o) => o.flowType !== 'not_found')
  @IsString()
  webIcon!: string;
}
