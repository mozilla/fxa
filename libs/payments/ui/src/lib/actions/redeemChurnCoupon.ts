/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { getApp } from '../nestapp/app';
import { flattenRouteParams } from '../utils/flatParam';
import { getAdditionalRequestArgs } from '../utils/getAdditionalRequestArgs';

export const redeemChurnCouponAction = async (
  uid: string,
  subscriptionId: string,
  churnType: 'cancel' | 'stay_subscribed',
  params: Record<string, string | string[]>,
  searchParams: Record<string, string | string[]>,
  acceptLanguage?: string | null,
  selectedLanguage?: string
) => {
  const requestArgs = {
    ...getAdditionalRequestArgs(),
    params: flattenRouteParams(params),
    searchParams: flattenRouteParams(searchParams),
  };

  return await getApp().getActionsService().redeemChurnCoupon({
    uid,
    subscriptionId,
    churnType,
    acceptLanguage,
    selectedLanguage,
    requestArgs,
  });
};
