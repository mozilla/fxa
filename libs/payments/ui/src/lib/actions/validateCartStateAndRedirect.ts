/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { redirect } from 'next/navigation';
import { getApp } from '../nestapp/app';
import { getRedirect, validateCartState } from '../utils/get-cart';
import { SupportedPages } from '../utils/types';

/**
 * Redirect if cart state does not match supported page
 * @@param cartId - Cart ID
 * @@param page - Page that action is being called from
 */
async function validateCartStateAndRedirectAction(
  cartId: string,
  page: SupportedPages,
  searchParams?: Record<string, string>
): Promise<void> {
  const urlSearchParams = new URLSearchParams(searchParams);
  const params = searchParams ? `?${urlSearchParams.toString()}` : '';
  const { state } = await getApp().getActionsService().getCartState({
    cartId,
  });

  if (!validateCartState(state, page)) {
    redirect(getRedirect(state) + params);
  }
}

export { validateCartStateAndRedirectAction };
