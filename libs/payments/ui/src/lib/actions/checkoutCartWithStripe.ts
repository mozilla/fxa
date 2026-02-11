/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { getApp } from '../nestapp/app';
import type { SubscriptionAttributionParams } from '@fxa/payments/cart';

export const checkoutCartWithStripe = async (
  cartId: string,
  version: number,
  confirmationTokenId: string,
  customerData: {
    locale: string;
  },
  attribution: SubscriptionAttributionParams,
  sessionUid?: string
) => {
  getApp().getActionsService().checkoutCartWithStripe({
    cartId,
    version,
    customerData,
    confirmationTokenId,
    attribution,
    sessionUid,
  });
};
