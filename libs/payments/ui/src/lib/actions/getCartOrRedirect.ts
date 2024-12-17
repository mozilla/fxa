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
  page: SupportedPages.START,
  searchParams?: Record<string, string>
): Promise<WithContextCart>;
async function getCartOrRedirectAction(
  cartId: string,
  page: SupportedPages.PROCESSING,
  searchParams?: Record<string, string>
): Promise<WithContextCart>;
async function getCartOrRedirectAction(
  cartId: string,
  page: SupportedPages.NEEDS_INPUT,
  searchParams?: Record<string, string>
): Promise<WithContextCart>;
async function getCartOrRedirectAction(
  cartId: string,
  page: SupportedPages.ERROR,
  searchParams?: Record<string, string>
): Promise<WithContextCart>;
async function getCartOrRedirectAction(
  cartId: string,
  page: SupportedPages.SUCCESS,
  searchParams?: Record<string, string>
): Promise<SuccessCart>;

async function getCartOrRedirectAction(
  cartId: string,
  page: SupportedPages,
  searchParams?: Record<string, string>
): Promise<WithContextCart | SuccessCart> {
  let cart: WithContextCart | SuccessCart | undefined;
  const urlSearchParams = new URLSearchParams(searchParams);
  const params = searchParams ? `?${urlSearchParams.toString()}` : '';
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
          redirect(getRedirect(VError.info(error).state) + params);
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
    redirect(getRedirect(cart.state) + params);
  }

  return cart;
}

export { getCartOrRedirectAction };
