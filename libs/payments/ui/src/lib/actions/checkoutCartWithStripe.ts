/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { getApp } from '../nestapp/app';
import type { SubscriptionAttributionParams } from '@fxa/payments/cart';
import { getAdditionalRequestArgs } from '../utils/getAdditionalRequestArgs';
import { flattenRouteParams } from '../utils/flatParam';

export const checkoutCartWithStripe = async (
  cartId: string,
  version: number,
  confirmationTokenId: string,
  attribution: SubscriptionAttributionParams,
  params: Record<string, string | string[]>,
  searchParams: Record<string, string | string[]>,
  sessionUid?: string
) => {
  const requestArgs = {
    ...getAdditionalRequestArgs(),
    params: flattenRouteParams(params),
    searchParams: flattenRouteParams(searchParams),
  };

  getApp().getActionsService().checkoutCartWithStripe({
    cartId,
    version,
    confirmationTokenId,
    attribution,
    requestArgs,
    sessionUid,
  });
};
