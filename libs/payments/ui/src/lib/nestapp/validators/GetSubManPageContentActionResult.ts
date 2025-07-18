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
import type { PaymentProvidersType } from '@fxa/payments/customer';

class DefaultPaymentMethod {
  @IsString()
  type!: PaymentProvidersType;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  last4?: string;

  @IsOptional()
  @IsNumber()
  expMonth?: number;

  @IsOptional()
  @IsNumber()
  expYear?: number;

  @IsOptional()
  @IsString()
  billingAgreementId?: string;
}

export class GetSubManPageContentActionResult {
  @IsOptional()
  @ValidateNested()
  @Type(() => DefaultPaymentMethod)
  defaultPaymentMethod?: DefaultPaymentMethod;
}
