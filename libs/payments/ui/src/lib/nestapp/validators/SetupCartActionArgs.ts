/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { SubplatInterval } from '@fxa/payments/customer';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { TaxAddress } from './common/TaxAddress';

export class SetupCartActionArgs {
  @IsString()
  interval!: SubplatInterval;

  @IsString()
  offeringConfigId!: string;

  @IsString()
  @IsOptional()
  experiment?: string;

  @IsString()
  @IsOptional()
  promoCode?: string;

  @IsString()
  @IsOptional()
  uid?: string;

  @ValidateNested()
  @Type(() => TaxAddress)
  TaxAddress!: TaxAddress;
}
