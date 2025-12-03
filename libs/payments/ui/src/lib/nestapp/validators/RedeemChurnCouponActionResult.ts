/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CmsChurnInterventionEntryResult {
  @IsString()
  webIcon!: string;

  @IsString()
  churnInterventionId!: string;

  @IsString()
  churnType!: string;

  @IsOptional()
  @IsNumber()
  redemptionLimit?: number | null;

  @IsString()
  stripeCouponId!: string;

  @IsString()
  interval!: string;

  @IsNumber()
  discountAmount!: number;

  @IsString()
  ctaMessage!: string;

  @IsString()
  modalHeading!: string;

  @IsArray()
  @IsString({ each: true })
  modalMessage!: string[];

  @IsString()
  productPageUrl!: string;

  @IsString()
  termsHeading!: string;

  @IsArray()
  @IsString({ each: true })
  termsDetails!: string[];

  @IsString()
  supportUrl!: string;
}

export class ChurnInterventionEntryDataResult {
  @IsString()
  customerId!: string;

  @IsString()
  churnInterventionId!: string;

  @IsNumber()
  redemptionCount!: number;
}

export class RedeemChurnCouponActionResult {
  @IsBoolean()
  redeemed!: boolean;

  @IsString()
  reason!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChurnInterventionEntryDataResult)
  updatedChurnInterventionEntryData!: ChurnInterventionEntryDataResult | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => CmsChurnInterventionEntryResult)
  cmsChurnInterventionEntry!: CmsChurnInterventionEntryResult | null;
}
