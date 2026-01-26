/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { getApp } from '../nestapp/app';
import type { SubscriptionAttributionParams } from '@fxa/payments/cart';
import { getAdditionalRequestArgs } from '../utils/getAdditionalRequestArgs';
import { flattenRouteParams } from '../utils/flatParam';

export const checkoutCartWithPaypal = async (
  cartId: string,
  version: number,
  attribution: SubscriptionAttributionParams,
  params: Record<string, string | string[]>,
  searchParams: Record<string, string | string[]>,
  sessionUid?: string,
  token?: string
) => {
  const requestArgs = {
    ...getAdditionalRequestArgs(),
    params: flattenRouteParams(params),
    searchParams: flattenRouteParams(searchParams),
  };

  await getApp().getActionsService().checkoutCartWithPaypal({
    cartId,
    version,
    attribution,
    requestArgs,
    sessionUid,
    token,
  });
};
