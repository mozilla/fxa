/**
 * Copyright 2018 Google LLC. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This file defines types that are exposed externally to the library consumers.

/* An abstract representation of a purchase made via Google Play Billing
 * It includes both one-time purchase and recurring subscription purchase.
 * The intention is to expose the raw response from Google Play Developer API,
 * while adding some fields to support user-purchase management.
 */
export interface Purchase {
  // Library-managed properties that represents a purchase made via Google Play Billing
  packageName: string;
  purchaseToken: string;
  sku: string;
  userId?: string; // userId of the user who made this purchase
  verifiedAt: number; // epoch timestamp of when the server last queried Play Developer API for this purchase
  isRegisterable(): boolean; // determine if a purchase can be registered to an user
}

// Representing type of a purchase / product.
// https://developer.android.com/reference/com/android/billingclient/api/BillingClient.SkuType.html
export enum SkuType {
  ONE_TIME = 'inapp',
  SUBS = 'subs',
}

// Representing the payment state of a purchase / product.
// Not present for cancelled/expired purchases.
// https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.subscriptions
export enum PaymentState {
  PENDING = 0,
  RECEIVED = 1,
  FREE_TRIAL = 2,
  PENDING_DEFERRED = 3, // Pending a deferred upgrade/downgrade
}

// Representing the purchase type
// Only set if the purchase was not made with the standard in-app billing flow.
export enum PurchaseType {
  TEST = 0,
  PROMO = 1,
}
