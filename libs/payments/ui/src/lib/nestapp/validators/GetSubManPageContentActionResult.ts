/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  SubplatInterval,
  type PaymentProvidersType,
} from '@fxa/payments/customer';

class AccountCreditBalance {
  @IsNumber()
  balance!: number;

  @IsString()
  currency!: string | null;
}

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

class SubscriptionContent {
  @IsString()
  id!: string;

  @IsString()
  productName!: string;

  @IsString()
  currency!: string;

  @IsOptional()
  @IsEnum(SubplatInterval)
  interval?: SubplatInterval;

  @IsNumber()
  currentInvoiceTax!: number;

  @IsNumber()
  currentInvoiceTotal!: number;

  @IsNumber()
  currentPeriodEnd!: number;

  @IsNumber()
  nextInvoiceDate!: number;

  @IsOptional()
  @IsNumber()
  nextInvoiceTax?: number;

  @IsOptional()
  @IsNumber()
  nextInvoiceTotal?: number;

  @IsOptional()
  @IsString()
  promotionName?: string | null;
}

export class GetSubManPageContentActionResult {
  @ValidateNested()
  @Type(() => AccountCreditBalance)
  accountCreditBalance!: AccountCreditBalance;

  @IsOptional()
  @ValidateNested()
  @Type(() => DefaultPaymentMethod)
  defaultPaymentMethod?: DefaultPaymentMethod;

  @ValidateNested()
  @Type(() => SubscriptionContent)
  subscriptions!: SubscriptionContent[];
}
