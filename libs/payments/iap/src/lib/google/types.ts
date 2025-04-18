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

import { IapExtraStripeInfo } from '../types';
import { PlayStoreSubscriptionPurchase } from './subscription-purchase';

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

// As defined in https://developer.android.com/google/play/billing/realtime_developer_notifications.html#json_specification
export interface DeveloperNotification {
  version: string;
  packageName: string;
  eventTimeMillis: number;
  subscriptionNotification?: SubscriptionNotification;
  testNotification?: TestNotification;
}

// As defined in https://developer.android.com/google/play/billing/realtime_developer_notifications.html#json_specification
export interface SubscriptionNotification {
  version: string;
  notificationType: NotificationType;
  purchaseToken: string;
  subscriptionId: string;
}

// As defined in https://developer.android.com/google/play/billing/realtime_developer_notifications.html#json_specification
export interface TestNotification {
  version: string;
}

// As defined in https://developer.android.com/google/play/billing/realtime_developer_notifications.html#notification_types
export enum NotificationType {
  SUBSCRIPTION_RECOVERED = 1,
  SUBSCRIPTION_RENEWED = 2,
  SUBSCRIPTION_CANCELED = 3,
  SUBSCRIPTION_PURCHASED = 4,
  SUBSCRIPTION_ON_HOLD = 5,
  SUBSCRIPTION_IN_GRACE_PERIOD = 6,
  SUBSCRIPTION_RESTARTED = 7,
  SUBSCRIPTION_PRICE_CHANGE_CONFIRMED = 8,
  SUBSCRIPTION_DEFERRED = 9,
  SUBSCRIPTION_PAUSED = 10,
  SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED = 11,
  SUBSCRIPTION_REVOKED = 12,
  SUBSCRIPTION_EXPIRED = 13,
}

export type AppendedPlayStoreSubscriptionPurchase =
  PlayStoreSubscriptionPurchase & IapExtraStripeInfo;
