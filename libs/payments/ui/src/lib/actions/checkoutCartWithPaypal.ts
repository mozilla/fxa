/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { getApp } from '../nestapp/app';
import type { SubscriptionAttributionParams } from '@fxa/payments/cart';

export const checkoutCartWithPaypal = async (
  cartId: string,
  version: number,
  customerData: { locale: string; displayName: string },
  attribution: SubscriptionAttributionParams,
  sessionUid?: string,
  token?: string
) => {
  await getApp().getActionsService().checkoutCartWithPaypal({
    cartId,
    version,
    customerData,
    attribution,
    sessionUid,
    token,
  });
};
