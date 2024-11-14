/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { plainToClass } from 'class-transformer';
import { redirect } from 'next/navigation';
import { getApp } from '../nestapp/app';
import { GetCartActionArgs } from '../nestapp/validators/GetCartActionArgs';
import { getRedirect, validateCartState } from '../utils/get-cart';
import { SupportedPages } from '../utils/types';
import { SuccessCart, WithContextCart } from '@fxa/payments/cart';
import { CartInvalidStateForActionError } from 'libs/payments/cart/src/lib/cart.error';
import { VError } from 'verror';

/**
 * Get Cart or Redirect if cart state does not match supported page
 * @@param cartId - Cart ID
 * @@param page - Page that action is being called from
 */
async function getCartOrRedirectAction(
  cartId: string,
  page: SupportedPages.START
): Promise<WithContextCart>;
async function getCartOrRedirectAction(
  cartId: string,
  page: SupportedPages.PROCESSING
): Promise<WithContextCart>;
async function getCartOrRedirectAction(
  cartId: string,
  page: SupportedPages.NEEDS_INPUT
): Promise<WithContextCart>;
async function getCartOrRedirectAction(
  cartId: string,
  page: SupportedPages.ERROR
): Promise<WithContextCart>;
async function getCartOrRedirectAction(
  cartId: string,
  page: SupportedPages.SUCCESS
): Promise<SuccessCart>;

async function getCartOrRedirectAction(
  cartId: string,
  page: SupportedPages
): Promise<WithContextCart | SuccessCart> {
  let cart: WithContextCart | SuccessCart | undefined;
  switch (page) {
    case SupportedPages.SUCCESS: {
      try {
        cart = await getApp().getActionsService().getSuccessCart(
          plainToClass(GetCartActionArgs, {
            cartId,
          })
        );
      } catch (error) {
        if (error instanceof CartInvalidStateForActionError) {
          redirect(getRedirect(VError.info(error).state));
        } else {
          throw error;
        }
      }
      break;
    }
    case SupportedPages.START:
    case SupportedPages.PROCESSING:
    case SupportedPages.NEEDS_INPUT:
    case SupportedPages.ERROR: {
      cart = await getApp().getActionsService().getCart(
        plainToClass(GetCartActionArgs, {
          cartId,
        })
      );
      break;
    }
  }

  if (!validateCartState(cart.state, page)) {
    redirect(getRedirect(cart.state));
  }

  return cart;
}

export { getCartOrRedirectAction };
