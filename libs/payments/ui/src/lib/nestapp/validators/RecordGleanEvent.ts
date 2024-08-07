/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

/**
 * @@todo: Temporary location. Move enum to Emittery implementation added as part of FXA-10087
 */
export enum EventName {
  PAY_SETUP_ENGAGE = 'pay_setup - engage',
}

enum CheckoutType {
  WITH_ACCOUNT = 'with-account',
  WITHOUT_ACCOUNT = 'without-account',
}

/**
 * Metrics specifc for the pay_setup - engage event
 */
class PaySetupEngageMetrics {
  @IsEnum(CheckoutType)
  checkoutType!: CheckoutType;
}

/**
 * Common metrics that can be found on all events
 */
class CommonMetrics {
  @IsOptional()
  @IsString()
  priceId?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @IsOptional()
  @IsString()
  utmContent?: string;

  @IsOptional()
  @IsString()
  utmMedium?: string;

  @IsOptional()
  @IsString()
  utmReferrer?: string;

  @IsOptional()
  @IsString()
  utmSource?: string;

  @IsOptional()
  @IsString()
  utmTerm?: string;
}

export class RecordGleanEvent {
  @IsEnum(EventName)
  eventName!: EventName;

  @Type(() => CommonMetrics)
  @ValidateNested()
  commonMetrics!: CommonMetrics;

  @IsOptional()
  @Type(() => PaySetupEngageMetrics)
  @ValidateNested()
  paySetupEngageMetrics?: PaySetupEngageMetrics;
}
