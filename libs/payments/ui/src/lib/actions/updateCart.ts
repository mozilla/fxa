/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { UpdateCart } from '@fxa/payments/cart';
import { app } from '../nestapp/app';
import { UpdateCartActionArgs } from '../nestapp/validators/UpdateCartActionArgs';
import { plainToClass } from 'class-transformer';

export const updateCartAction = async (
  cartId: string,
  version: number,
  cartDetails: UpdateCart
) => {
  const actionsService = await app.getActionsService();

  await actionsService.updateCart(
    plainToClass(UpdateCartActionArgs, {
      cartId,
      version,
      cartDetails,
    })
  );
};
