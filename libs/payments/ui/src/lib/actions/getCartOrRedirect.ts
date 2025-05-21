/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { redirect } from 'next/navigation';
import { getApp } from '../nestapp/app';
import { getRedirect, validateCartState } from '../utils/get-cart';
import { SupportedPages } from '../utils/types';
import {
  StartCartDTO,
  ProcessingCartDTO,
  NeedsInputCartDTO,
  FailCartDTO,
  SuccessCartDTO,
  CartDTO,
} from '@fxa/payments/cart';

/**
 * Get Cart or Redirect if cart state does not match supported page
 * @@param cartId - Cart ID
 * @@param page - Page that action is being called from
 */
async function getCartOrRedirectAction(
  cartId: string,
  page: SupportedPages.START,
  searchParams?: Record<string, string>
): Promise<StartCartDTO>;
async function getCartOrRedirectAction(
  cartId: string,
  page: SupportedPages.PROCESSING,
  searchParams?: Record<string, string>
): Promise<ProcessingCartDTO>;
async function getCartOrRedirectAction(
  cartId: string,
  page: SupportedPages.NEEDS_INPUT,
  searchParams?: Record<string, string>
): Promise<NeedsInputCartDTO>;
async function getCartOrRedirectAction(
  cartId: string,
  page: SupportedPages.ERROR,
  searchParams?: Record<string, string>
): Promise<FailCartDTO>;
async function getCartOrRedirectAction(
  cartId: string,
  page: SupportedPages.SUCCESS,
  searchParams?: Record<string, string>
): Promise<SuccessCartDTO>;

async function getCartOrRedirectAction(
  cartId: string,
  page: SupportedPages,
  searchParams?: Record<string, string>
): Promise<CartDTO> {
  const urlSearchParams = new URLSearchParams(searchParams);
  const params = searchParams ? `?${urlSearchParams.toString()}` : '';
  const cart = await getApp().getActionsService().getCart({
    cartId,
  });

  if (!validateCartState(cart.state, page)) {
    redirect(getRedirect(cart.state) + params);
  }

  return cart;
}

export { getCartOrRedirectAction };
