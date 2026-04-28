/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { headers } from 'next/headers';
import { getApp } from '../nestapp/app';
import { parseSearchParams } from '../utils/searchParams';

export const getCartAction = async (
  cartId: string,
  searchParams?: Record<string, string | string[] | undefined>
) => {
  const experimentationId = (await headers()).get('x-experimentation-id') || undefined;
  const cart = await getApp().getActionsService().getCart({
    cartId,
    searchParams: parseSearchParams(searchParams),
    experimentationId,
  });

  return cart;
};
