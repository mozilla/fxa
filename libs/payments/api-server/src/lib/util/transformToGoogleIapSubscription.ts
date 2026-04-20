/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { PlayStoreSubscriptionPurchase } from '@fxa/payments/iap';

import type { GoogleIapSubscription } from '../billing-and-subscriptions.schema';
import type { IapPriceInfoEntry } from './buildIapPriceInfoMap';

export const transformToGoogleIapSubscription = (
  purchase: PlayStoreSubscriptionPurchase,
  iap: IapPriceInfoEntry
): GoogleIapSubscription => ({
  _subscription_type: 'iap_google',
  auto_renewing: purchase.autoRenewing,
  ...(purchase.cancelReason && {
    cancel_reason: purchase.cancelReason,
  }),
  expiry_time_millis: purchase.expiryTimeMillis,
  package_name: purchase.packageName,
  sku: purchase.sku,
  price_id: iap.priceId,
  product_id: iap.productId,
  product_name: iap.productName,
  priceInfo: iap.priceInfo,
});
