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
import { RequestArgs } from './common/RequestArgs';

export class CheckoutCartWithPaypalActionUtmAttributionData {
  @IsString()
  campaign!: string;

  @IsString()
  content!: string;

  @IsString()
  medium!: string;

  @IsString()
  source!: string;

  @IsString()
  term!: string;
}

export class CheckoutCartWithPaypalActionSessionAttributionData {
  @IsString()
  flow_id!: string;

  @IsString()
  entrypoint!: string;

  @IsString()
  entrypoint_experiment!: string;

  @IsString()
  entrypoint_variation!: string;
}
export class CheckoutCartWithPaypalActionAttributionData {
  @Type(() => CheckoutCartWithPaypalActionUtmAttributionData)
  @ValidateNested()
  utm!: CheckoutCartWithPaypalActionUtmAttributionData;

  @Type(() => CheckoutCartWithPaypalActionSessionAttributionData)
  @ValidateNested()
  session!: CheckoutCartWithPaypalActionSessionAttributionData;
}

export class CheckoutCartWithPaypalActionArgs {
  @IsString()
  cartId!: string;

  @IsNumber()
  version!: number;

  @IsString()
  @IsOptional()
  sessionUid?: string;

  @IsString()
  @IsOptional()
  token?: string;

  @Type(() => CheckoutCartWithPaypalActionAttributionData)
  @ValidateNested()
  attributionData!: CheckoutCartWithPaypalActionAttributionData;

  @Type(() => RequestArgs)
  @ValidateNested()
  requestArgs!: RequestArgs;
}
