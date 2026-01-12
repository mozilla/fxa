/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

export class PaymentMethodDetails {
  @IsString()
  id!: string;

  @IsString()
  @IsOptional()
  type?: string;
}

export class GetStripePaymentManagementDetailsResult {
  @IsString()
  clientSecret!: string;

  @IsString()
  customer!: string;

  @ValidateNested({ each: true })
  @Type(() => PaymentMethodDetails)
  @IsOptional()
  defaultPaymentMethod?: PaymentMethodDetails;

  @IsString()
  currency!: string;
}
