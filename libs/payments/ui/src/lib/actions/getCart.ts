/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { plainToClass } from 'class-transformer';
import { app } from '../nestapp/app';
import { GetCartActionArgs } from '../nestapp/validators/GetCartActionArgs';

export const getCartAction = async (cartId: string) => {
  const cart = await app.getActionsService().getCart(
    plainToClass(GetCartActionArgs, {
      cartId,
    })
  );

  return cart;
};
