/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { plainToClass } from 'class-transformer';
import { redirect } from 'next/navigation';
import { app } from '../nestapp/app';
import { GetCartActionArgs } from '../nestapp/validators/GetCartActionArgs';
import { getRedirect, validateCartState } from '../utils/get-cart';
import { SupportedPages } from '../utils/types';

/**
 * Get Cart or Redirect if cart state does not match supported page
 * @@param cartId - Cart ID
 * @@param page - Page that action is being called from
 */
export const getCartOrRedirectAction = async (
  cartId: string,
  page: SupportedPages
) => {
  const cart = await app.getActionsService().getCart(
    plainToClass(GetCartActionArgs, {
      cartId,
    })
  );

  if (!validateCartState(cart.state, page)) {
    redirect(getRedirect(cart.state));
  }

  return cart;
};
