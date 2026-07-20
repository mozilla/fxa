/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { getApp } from '../nestapp/app';
import { redirect } from 'next/navigation';
import { URLSearchParams } from 'url';
import { flattenRouteParams } from '../utils/flatParam';
import { getAdditionalRequestArgs } from '../utils/getAdditionalRequestArgs';
import { sanitizePathname } from '../utils/sanitizePathname';

export const submitNeedsInputAndRedirectAction = async (
  cartId: string,
  params: Record<string, string | string[] | undefined>,
  currentPathname: string,
  searchParams?: Record<string, string | string[] | undefined>
) => {
  let redirectPath: string | undefined;
  const urlSearchParams = new URLSearchParams(searchParams ? flattenRouteParams(searchParams) : undefined);
  const searchParamsString = searchParams
    ? `?${urlSearchParams.toString()}`
    : '';
  const requestArgs = {
    ...(await getAdditionalRequestArgs()),
    params: flattenRouteParams(params),
    searchParams: flattenRouteParams(searchParams ?? {}),
  };
  try {
    await getApp().getActionsService().submitNeedsInput({ cartId, requestArgs });
    redirectPath = 'success';
  } catch (error) {
    getApp().getLogger().error('Error submitting needs input', { error });
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
