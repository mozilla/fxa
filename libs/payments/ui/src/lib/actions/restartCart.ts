/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { plainToClass } from 'class-transformer';
import { app } from '../nestapp/app';
import { RestartCartActionArgs } from '../nestapp/validators/RestartCartActionArgs';

export const restartCartAction = async (cartId: string) => {
  const actionsService = app.getActionsService();

  const cart = await actionsService.restartCart(
    plainToClass(RestartCartActionArgs, {
      cartId,
    })
  );

  return cart;
};
