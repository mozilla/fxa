/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CartEligibilityStatus, CartState } from '@fxa/shared/db/mysql/account';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TaxAddress } from './common/TaxAddress';

export class UpdateCartActionResult {
  @IsString()
  id!: string;

  @IsOptional()
  @IsString()
  uid?: string;

  @IsEnum(CartState)
  state!: CartState;

  @IsString()
  offeringConfigId!: string;

  @IsString()
  interval!: string;

  @IsOptional()
  @IsString()
  experiment?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TaxAddress)
  taxAddress?: TaxAddress;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsNumber()
  createdAt!: number;

  @IsNumber()
  updatedAt!: number;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsString()
  stripeCustomerId?: string;

  @IsOptional()
  @IsString()
  stripeSubscriptionId?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsNumber()
  amount!: number;

  @IsNumber()
  version!: number;

  @IsEnum(CartEligibilityStatus)
  eligibilityStatus!: CartEligibilityStatus;
}
