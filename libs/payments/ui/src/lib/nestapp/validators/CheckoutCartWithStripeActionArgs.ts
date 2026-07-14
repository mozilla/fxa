/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Type } from 'class-transformer';
import {
  IsNumber,
  IsString,
  MaxLength,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { RequestArgs } from './common/RequestArgs';

export class CheckoutCartWithStripeActionUtmAttributionData {
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

export class CheckoutCartWithStripeActionSessionAttributionData {
  @IsString()
  flow_id!: string;

  @IsString()
  entrypoint!: string;

  @IsString()
  entrypoint_experiment!: string;

  @IsString()
  entrypoint_variation!: string;
}
export class CheckoutCartWithStripeActionAttributionData {
  @Type(() => CheckoutCartWithStripeActionUtmAttributionData)
  @ValidateNested()
  utm!: CheckoutCartWithStripeActionUtmAttributionData;

  @Type(() => CheckoutCartWithStripeActionSessionAttributionData)
  @ValidateNested()
  session!: CheckoutCartWithStripeActionSessionAttributionData;
}

export class CheckoutCartWithStripeActionArgs {
  @IsString()
  cartId!: string;

  @IsNumber()
  version!: number;

  @IsString()
  confirmationTokenId!: string;

  // A Stripe Payment Element type string (e.g. card/link/apple_pay/google_pay).
  // Not constrained to a fixed set: the enabled types are account-driven and an
  // unrecognized value is safely bounded to SubPlatPaymentMethodType.Stripe in
  // NextJSActionsService rather than rejected. MaxLength guards against oversized
  // input on this publicly callable boundary.
  @IsString()
  @MaxLength(64)
  paymentMethod!: string;

  @IsString()
  @IsOptional()
  sessionUid?: string;

  @Type(() => CheckoutCartWithStripeActionAttributionData)
  @ValidateNested()
  attributionData!: CheckoutCartWithStripeActionAttributionData;

  @Type(() => RequestArgs)
  @ValidateNested()
  requestArgs!: RequestArgs;
}
