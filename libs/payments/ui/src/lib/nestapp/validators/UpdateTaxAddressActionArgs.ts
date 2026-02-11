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

export class UpdateTaxAddressActionArgs {
  @IsString()
  cartId!: string;

  @IsNumber()
  version!: number;

  @IsString()
  offeringId!: string;

  @ValidateNested()
  @Type(() => TaxAddress)
  taxAddress?: TaxAddress;

  @IsOptional()
  @IsString()
  uid?: string;
}
