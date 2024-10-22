/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Type } from 'class-transformer';
import { IsNumber, IsString, ValidateNested } from 'class-validator';

export class CheckoutCartWithStripeActionCustomerData {
  @IsString()
  locale!: string;

  @IsString()
  displayName!: string;
}

export class CheckoutCartWithStripeActionArgs {
  @IsString()
  cartId!: string;

  @IsNumber()
  version!: number;

  @IsString()
  confirmationTokenId!: string;

  @Type(() => CheckoutCartWithStripeActionCustomerData)
  @ValidateNested()
  customerData!: CheckoutCartWithStripeActionCustomerData;
}
