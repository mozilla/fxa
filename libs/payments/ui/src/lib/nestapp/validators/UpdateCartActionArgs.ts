/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TaxAddress } from './common/TaxAddress';

export class UpdateCartActionCartDetailsArgs {
  @IsString()
  @IsOptional()
  uid?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TaxAddress)
  taxAddress?: TaxAddress;

  @IsString()
  @IsOptional()
  couponCode?: string;
}

export class UpdateCartActionArgs {
  @IsString()
  cartId!: string;

  @IsNumber()
  version!: number;

  @Type(() => UpdateCartActionCartDetailsArgs)
  @ValidateNested()
  cartDetails!: UpdateCartActionCartDetailsArgs;
}
