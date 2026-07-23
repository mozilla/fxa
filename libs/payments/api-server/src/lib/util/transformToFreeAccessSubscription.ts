/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { FreeAccessSubscription } from '../billing-and-subscriptions.schema';

/**
 * Build a `free_access` subscription entry from the related offering's product
 * identity. A free grant has no Stripe subscription or Price, so no billing
 * data (price, interval, subscription id) is reported. `currentPeriodEnd` is the
 * CMS-sourced grant expiry, as a unix timestamp in seconds.
 */
export const transformToFreeAccessSubscription = (args: {
  currentPeriodEnd: number;
  productId: string;
}): FreeAccessSubscription => {
  return {
    _subscription_type: 'free_access',
    current_period_end: args.currentPeriodEnd,
    product_id: args.productId,
  };
};
