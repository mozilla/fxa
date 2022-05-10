/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as iapSubscriptionDTO from 'fxa-shared/dto/auth/payments/iap-subscription';
import { AppendedAppStoreSubscriptionPurchase } from 'fxa-shared/payments/iap/apple-app-store/types';
import { MozillaSubscriptionTypes } from 'fxa-shared/subscriptions/types';

import { AppendedPlayStoreSubscriptionPurchase } from './google-play/types';

/**
 * Formats an AppendedPlayStoreSubscriptionPurchase to the PlayStoreSubscription DTO format.
 */
export function playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO(
  purchase: AppendedPlayStoreSubscriptionPurchase
): iapSubscriptionDTO.PlayStoreSubscription {
  return {
    auto_renewing: purchase.autoRenewing,
    expiry_time_millis: purchase.expiryTimeMillis,
    package_name: purchase.packageName, // Play Store analog to a Stripe Product id
    sku: purchase.sku, // Play Store analog to a Stripe Plan id
    ...(purchase.cancelReason && { cancel_reason: purchase.cancelReason }),
    price_id: purchase.price_id,
    product_id: purchase.product_id,
    product_name: purchase.product_name,
    _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
  };
}

/**
 * Formats an AppendedAppStoreSubscriptionPurchase to the AppStoreSubscription DTO format.
 */
export function appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO(
  purchase: AppendedAppStoreSubscriptionPurchase
): iapSubscriptionDTO.AppStoreSubscription {
  return {
    // App Store analog to a Stripe Plan id, prepended with app_store to avoid confusion.
    app_store_product_id: purchase.productId,
    auto_renewing: !!purchase.autoRenewStatus,
    bundle_id: purchase.bundleId, // App Store analog to a Stripe Product id
    // TODO: Should this always be present or just for TransactionType of
    // "Auto-Renewable Subscription"? See https://developer.apple.com/forums/thread/705730
    ...(purchase.expiresDate && { expiry_time_millis: purchase.expiresDate }),
    ...(purchase.hasOwnProperty('isInBillingRetry') && {
      is_in_billing_retry_period: purchase.isInBillingRetry,
    }),
    price_id: purchase.price_id,
    product_id: purchase.product_id,
    product_name: purchase.product_name,
    _subscription_type: MozillaSubscriptionTypes.IAP_APPLE,
  };
}
