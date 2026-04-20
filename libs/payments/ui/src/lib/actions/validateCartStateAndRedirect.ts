/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { redirect } from 'next/navigation';
import { getApp } from '../nestapp/app';
import { getRedirect, validateCartState } from '../utils/get-cart';
import { SupportedPages } from '../utils/types';
import { URLSearchParams } from 'url';
import { flattenRouteParams } from '../utils/flatParam';
import { sanitizePathname } from '../utils/sanitizePathname';

/**
 * Redirect if cart state does not match supported page
 * @@param cartId - Cart ID
 * @@param page - Page that action is being called from
 * @@param currentPathname - Current pathname for constructing redirect URLs
 */
async function validateCartStateAndRedirectAction(
  cartId: string,
  page: SupportedPages,
  currentPathname: string,
  searchParams?: Record<string, string | string[] | undefined>,
  redirectNow = true
) {
  const urlSearchParams = new URLSearchParams(searchParams ? flattenRouteParams(searchParams) : undefined);
  const params = searchParams ? `?${urlSearchParams.toString()}` : '';
  const { state } = await getApp().getActionsService().getCartState({
    cartId,
  });

  if (!validateCartState(state, page)) {
    // Sanitize pathname to prevent open redirect vulnerabilities
    const safePath = sanitizePathname(currentPathname);
    
    // Replace the last segment with the redirect path to maintain the full path structure
    const pathSegments = safePath.split('/');
    pathSegments[pathSegments.length - 1] = getRedirect(state);
    const redirectToUrl = pathSegments.join('/') + params;

    if (redirectNow) {
      redirect(redirectToUrl);
    } else {
      return {
        redirectToUrl,
        state,
      };
    }
  }

  return;
}

export { validateCartStateAndRedirectAction };