/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { getApp } from '../nestapp/app';
import { redirect } from 'next/navigation';
import { URLSearchParams } from 'url';
import { recordEmitterEventAction } from './recordEmitterEvent';
import { flattenRouteParams } from '../utils/flatParam';
import { sanitizePathname } from '../utils/sanitizePathname';

export const submitNeedsInputAndRedirectAction = async (
  cartId: string,
  params: Record<string, string | string[] | undefined>,
  currentPathname: string,
  searchParams?: Record<string, string | string[] | undefined>,
  isFreeTrial?: boolean
) => {
  let redirectPath: string | undefined;
  const urlSearchParams = new URLSearchParams(searchParams ? flattenRouteParams(searchParams) : undefined);
  const searchParamsString = searchParams
    ? `?${urlSearchParams.toString()}`
    : '';
  try {
    await getApp().getActionsService().submitNeedsInput({ cartId });

    await recordEmitterEventAction(
      'checkoutSuccess',
      { ...params },
      { ...searchParams },
      undefined,
      undefined,
      isFreeTrial
    );

    redirectPath = 'success';
  } catch (error) {
    getApp().getLogger().error('Error submitting needs input', { error });

    await recordEmitterEventAction(
      'checkoutFail',
      { ...params },
      { ...searchParams },
      undefined,
      undefined,
      isFreeTrial
    );

    redirectPath = 'error';
  }

  // Sanitize pathname to prevent open redirect vulnerabilities
  const safePath = sanitizePathname(currentPathname);
  
  // Replace the last segment with the redirect path to maintain the full path structure
  const pathSegments = safePath.split('/');
  pathSegments[pathSegments.length - 1] = redirectPath;
  const fullRedirectPath = pathSegments.join('/');

  redirect(`${fullRedirectPath}${searchParamsString}`);
};