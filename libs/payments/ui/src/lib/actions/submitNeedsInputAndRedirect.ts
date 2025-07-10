/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { getApp } from '../nestapp/app';
import { redirect } from 'next/navigation';
import { URLSearchParams } from 'url';

export const submitNeedsInputAndRedirectAction = async (
  cartId: string,
  searchParams?: Record<string, string | string[]>
) => {
  let redirectPath: string | undefined;
  const urlSearchParams = new URLSearchParams(searchParams);
  const params = searchParams ? `?${urlSearchParams.toString()}` : '';
  try {
    await getApp().getActionsService().submitNeedsInput({ cartId });
    redirectPath = 'success';
  } catch (error) {
    console.error('Error submitting needs input', error);
   redirectPath = 'error';
  }

  redirect(`${redirectPath}${params}`);
};
