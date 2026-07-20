/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { StripeError } from '@stripe/stripe-js';
import { getApp } from '../nestapp/app';
import { redirect } from 'next/navigation';
import { stripeErrorToErrorReasonId } from '@fxa/payments/cart';
import { URLSearchParams } from 'url';
import { flattenRouteParams } from '../utils/flatParam';
import { sanitizePathname } from '../utils/sanitizePathname';

export const handleStripeErrorAction = async (
  cartId: string,
  stripeError: StripeError,
  currentPathname: string,
  searchParams?: Record<string, string | string[] | undefined>
) => {
  const errorReasonId = stripeErrorToErrorReasonId(stripeError);
  const urlSearchParams = new URLSearchParams(
    searchParams ? flattenRouteParams(searchParams) : undefined
  );
  const params = searchParams ? `?${urlSearchParams.toString()}` : '';

  await getApp().getActionsService().finalizeCartWithError({
    cartId,
    errorReasonId,
  });

  // Sanitize pathname to prevent open redirect vulnerabilities
  const safePath = sanitizePathname(currentPathname);
  
  // Replace the last segment with 'error' to maintain the full path structure
  const pathSegments = safePath.split('/');
  pathSegments[pathSegments.length - 1] = 'error';
  const errorPath = pathSegments.join('/');

  redirect(`${errorPath}${params}`);
};