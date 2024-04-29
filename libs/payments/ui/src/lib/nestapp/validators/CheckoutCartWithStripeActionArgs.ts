/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsNumber, IsString } from 'class-validator';

export class CheckoutCartWithStripeActionArgs {
  @IsString()
  cartId!: string;

  @IsNumber()
  version!: number;

  @IsString()
  paymentMethodId!: string;
}
