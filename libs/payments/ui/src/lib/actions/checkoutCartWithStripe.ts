/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { plainToClass } from 'class-transformer';
import { getApp } from '../nestapp/app';
import {
  CheckoutCartWithStripeActionArgs,
  CheckoutCartWithStripeActionCustomerData,
} from '../nestapp/validators/CheckoutCartWithStripeActionArgs';
import { SetCartProcessingActionArgs } from '../nestapp/validators/SetCartProcessingActionArgs';

export const checkoutCartWithStripe = async (
  cartId: string,
  version: number,
  paymentMethodId: string,
  customerData: CheckoutCartWithStripeActionCustomerData
) => {
  await getApp()
    .getActionsService()
    .setCartProcessing(
      plainToClass(SetCartProcessingActionArgs, { cartId, version })
    );

  const updatedVersion = version + 1;

  getApp()
    .getActionsService()
    .checkoutCartWithStripe(
      plainToClass(CheckoutCartWithStripeActionArgs, {
        cartId,
        version: updatedVersion,
        customerData,
        paymentMethodId,
      })
    );
};
