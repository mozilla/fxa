/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { PaymentProvidersType } from '@fxa/payments/cart';
import { CartEligibilityStatus, CartState } from '@fxa/shared/db/mysql/account';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TaxAddress } from './common/TaxAddress';

class TaxAmount {
  @IsString()
  title!: string;

  @IsBoolean()
  inclusive!: number;

  @IsNumber()
  amount!: number;
}

class Invoice {
  @IsString()
  currency!: string;

  @IsNumber()
  listAmount!: number;

  @IsNumber()
  totalAmount!: number;

  @ValidateNested({ each: true })
  @Type(() => TaxAmount)
  taxAmounts!: TaxAmount[];

  @IsOptional()
  @IsNumber()
  discountAmount?: number | null;

  @IsNumber()
  subtotal!: number;

  @IsOptional()
  @IsNumber()
  discountEnd?: number | null;

  @IsOptional()
  @IsString()
  discountType?: string;

  @IsOptional()
  @IsString()
  number?: string | null;
}

class PaymentInfo {
  @IsString()
  @IsIn([
    'card',
    'google_iap',
    'apple_iap',
    'external_paypal',
  ] satisfies PaymentProvidersType[])
  type!: PaymentProvidersType;

  @IsOptional()
  @IsString()
  last4?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  customerSessionClientSecret?: string;
}

class FromPriceInfo {
  @IsString()
  currency!: string;

  @IsString()
  interval!: string;

  @IsNumber()
  unitAmount!: number;
}

export class GetCartActionResult {
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

  @IsBoolean()
  metricsOptedOut!: boolean;

  @ValidateNested()
  @Type(() => Invoice)
  upcomingInvoicePreview!: Invoice;

  @IsOptional()
  @ValidateNested()
  @Type(() => Invoice)
  latestInvoicePreview?: Invoice;

  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentInfo)
  paymentInfo?: PaymentInfo;

  @IsOptional()
  @IsString()
  fromOfferingConfigId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => FromPriceInfo)
  fromPrice?: FromPriceInfo;
}
