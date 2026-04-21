/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { redirect } from 'next/navigation';
import { getApp } from '../nestapp/app';
import { getRedirect, validateCartState } from '../utils/get-cart';
import { SupportedPages } from '../utils/types';
import { URLSearchParams } from 'url';
import { sanitizePathname } from '../utils/sanitizePathname';
import { parseSearchParams } from '../utils/searchParams';
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
 * @@param currentPathname - Current pathname for constructing redirect URLs
 */
async function getCartOrRedirectAction(
  cartId: string,
  page: SupportedPages.START,
  currentPathname: string,
  searchParams?: Record<string, string | string[] | undefined>
): Promise<StartCartDTO>;
async function getCartOrRedirectAction(
  cartId: string,
  page: SupportedPages.PROCESSING,
  currentPathname: string,
  searchParams?: Record<string, string | string[] | undefined>
): Promise<ProcessingCartDTO>;
async function getCartOrRedirectAction(
  cartId: string,
  page: SupportedPages.NEEDS_INPUT,
  currentPathname: string,
  searchParams?: Record<string, string | string[] | undefined>
): Promise<NeedsInputCartDTO>;
async function getCartOrRedirectAction(
  cartId: string,
  page: SupportedPages.ERROR,
  currentPathname: string,
  searchParams?: Record<string, string | string[] | undefined>
): Promise<FailCartDTO>;
async function getCartOrRedirectAction(
  cartId: string,
  page: SupportedPages.SUCCESS,
  currentPathname: string,
  searchParams?: Record<string, string | string[] | undefined>
): Promise<SuccessCartDTO>;
async function getCartOrRedirectAction(
  cartId: string,
  page: SupportedPages,
  currentPathname: string,
  searchParams?: Record<string, string | string[] | undefined>
): Promise<CartDTO> {
  const filteredParams = searchParams
    ? Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v != null)) as Record<string, string | string[]>
    : undefined;
  const urlSearchParams = new URLSearchParams(filteredParams);
  const params = searchParams ? `?${urlSearchParams.toString()}` : '';
  const cart = await getApp().getActionsService().getCart({
    cartId,
    searchParams: parseSearchParams(searchParams),
  });

  if (!validateCartState(cart.state, page)) {
    // Sanitize pathname to prevent open redirect vulnerabilities
    const safePath = sanitizePathname(currentPathname);
    
    // Replace the last segment with the redirect path to maintain the full path structure
    const pathSegments = safePath.split('/');
    pathSegments[pathSegments.length - 1] = getRedirect(cart.state);
    const redirectPath = pathSegments.join('/');
    redirect(redirectPath + params);
  }

  return cart;
}

export { getCartOrRedirectAction };