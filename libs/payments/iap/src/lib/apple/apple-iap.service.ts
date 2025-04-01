/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable, Logger } from '@nestjs/common';
import {
  DecodedNotificationPayload,
  NotificationSubtype,
  NotificationType,
} from 'app-store-server-api';
import { AppleIapPurchaseManager } from './apple-iap-purchase.manager';
import {
  AppleIapConflictError,
  AppleIapInvalidOriginalTransactionIdError,
} from './apple-iap.error';
import { NOTIFICATION_TYPES_FOR_NON_SUBSCRIPTION_PURCHASES } from './constants';
import { AppStoreSubscriptionPurchase } from './subscription-purchase';

@Injectable()
export class AppleIapService {
  constructor(
    private appleIapPurchaseManager: AppleIapPurchaseManager,
    private log: Logger
  ) {}

  /**
   * Register a purchase (autorenewing subscription) to a user.
   * It's intended to be exposed to the iOS app to verify purchases made in the app.
   */
  async registerToUserAccount(
    bundleId: string,
    originalTransactionId: string,
    userId: string
  ) {
    // STEP 1. Check if the purchase record is already in Firestore
    let purchase = await this.getSubscriptionPurchase(originalTransactionId);
    if (!purchase) {
      // STEP 1b. Query App Store Server API to verify the purchase
      try {
        purchase = await this.appleIapPurchaseManager.getFromAppStoreAPI(
          bundleId,
          originalTransactionId
        );
      } catch (err) {
        // Error when attempt to query purchase. Return not found error to caller.
        const libraryError = new AppleIapInvalidOriginalTransactionIdError(
          'Invalid original transaction id',
          { cause: err }
        );
        this.log.error(
          'registerToUserAccount.PurchaseUpdateError.InvalidOriginalTransactionId',
          {
            err: libraryError,
            originalTransactionId,
          }
        );
        throw libraryError;
      }
    }
    // Unlike Google Play subscriptions, We don't need to check if the purchase is
    // registerable (i.e. not terminal), since the original transaction ID is
    // the primary key in Firestore, and it can be "revived at any time if the customer
    // returns to any SKU in that subscription group".
    // See https://developer.apple.com/forums/thread/704167.

    // STEP 2. Check if the purchase has been registered to a user. If it is, then return conflict error to our caller.
    if (purchase.userId === userId) {
      // Purchase record already registered to the target user. We'll do nothing.
      return purchase;
    } else if (purchase.userId) {
      // this.log.info('Purchase already registered', { purchase });
      // Purchase record already registered to different user. Return 'conflict' to caller
      const libraryError = new AppleIapConflictError(
        'Purchase has been registered to another user'
      );
      this.log.error('registerToUserAccount.PurchaseUpdateError.Conflict', {
        err: libraryError,
        originalTransactionId,
      });
      throw libraryError;
    }

    // STEP 3: Register purchase to the user
    await this.appleIapPurchaseManager.forceRegisterToUser(
      originalTransactionId,
      userId
    );

    return purchase;
  }

  /**
   * Update Firestore with the latest subscription status information from
   * the App Store Server.
   *
   * See https://developer.apple.com/documentation/appstoreservernotifications/notificationtype
   * and https://developer.apple.com/documentation/appstoreservernotifications/subtype
   */
  async processNotification(
    bundleId: string,
    originalTransactionId: string,
    notification: DecodedNotificationPayload
  ): Promise<AppStoreSubscriptionPurchase | null> {
    // Type-guard to ensure the notification is for a subscription
    if (
      NOTIFICATION_TYPES_FOR_NON_SUBSCRIPTION_PURCHASES.includes(
        notification.notificationType
      )
    ) {
      return null;
    }

    // We can safely ignore Subscribed - InitialBuy notifications, because
    // with a new subscription, our iOS app will send the same original
    // transaction ID to the server for verification.
    if (
      notification.notificationType === NotificationType.Subscribed &&
      notification?.subtype === NotificationSubtype.InitialBuy
    ) {
      return null;
    }

    // For other types of notifications, we query the App Store Server API
    // to update our purchase record cache in Firestore
    return this.appleIapPurchaseManager.getFromAppStoreAPI(
      bundleId,
      originalTransactionId,
      notification.notificationType,
      notification?.subtype
    );
  }

  async getSubscriptionPurchase(originalTransactionId: string) {
    return this.appleIapPurchaseManager.getStaleCached(originalTransactionId);
  }
}
