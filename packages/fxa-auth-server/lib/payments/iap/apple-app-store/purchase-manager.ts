/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { CollectionReference } from '@google-cloud/firestore';
import {
  DecodedNotificationPayload,
  decodeNotificationPayload,
  decodeTransaction,
  NotificationSubtype,
  NotificationType,
} from 'app-store-server-api';
import { PurchaseManager as PurchaseManagerBase } from 'fxa-shared/payments/iap/apple-app-store/purchase-manager';
import { PurchaseUpdateError } from 'fxa-shared/payments/iap/apple-app-store/types/errors';
import Container from 'typedi';

import { AuthLogger } from '../../../types';
import { AppStoreHelper } from './app-store-helper';
import { AppStoreSubscriptionPurchase } from './subscription-purchase';

export const NOTIFICATION_TYPES_FOR_NON_SUBSCRIPTION_PURCHASES = [
  NotificationType.ConsumptionRequest,
];

/**
 * This class wraps Firestore API calls for Apple IAP purchases. It
 * will handle related CRUD operations.
 * This is using the V2 App Store Server API implementation:
 * https://developer.apple.com/documentation/appstoreserverapi
 */
export class PurchaseManager extends PurchaseManagerBase {
  /*
   * This class is intended to be initialized by the library.
   * Library consumer should not initialize this class themselves.
   */
  constructor(
    purchasesDbRef: CollectionReference,
    appStoreHelper: AppStoreHelper
  ) {
    super(purchasesDbRef, appStoreHelper, Container.get(AuthLogger));
  }

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
        purchase = await this.querySubscriptionPurchase(
          bundleId,
          originalTransactionId
        );
      } catch (err) {
        // Error when attempt to query purchase. Return not found error to caller.
        const libraryError = new Error(err.message);
        libraryError.name = PurchaseUpdateError.INVALID_ORIGINAL_TRANSACTION_ID;
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
      this.log.info('Purchase already registered', { purchase });
      // Purchase record already registered to different user. Return 'conflict' to caller
      const libraryError = new Error(
        'Purchase has been registered to another user'
      );
      libraryError.name = PurchaseUpdateError.CONFLICT;
      this.log.error('registerToUserAccount.PurchaseUpdateError.Conflict', {
        err: libraryError,
        originalTransactionId,
      });
      throw libraryError;
    }

    // STEP 3: Register purchase to the user
    await this.forceRegisterToUserAccount(originalTransactionId, userId);

    return purchase;
  }

  /*
   * Force register a purchase to an user.
   * This method is not intended to be called from outside of the library.
   */
  private async forceRegisterToUserAccount(
    originalTransactionId: string,
    userId: string
  ): Promise<void> {
    try {
      await this.purchasesDbRef
        .doc(originalTransactionId)
        .update({ userId: userId });
    } catch (err) {
      const libraryError = new Error(err.message);
      libraryError.name = PurchaseUpdateError.OTHER_ERROR;
      this.log.error(
        'forceRegisterToUserAccount.PurchaseUpdateError.OtherError',
        {
          err: libraryError,
          originalTransactionId,
        }
      );
      throw libraryError;
    }
  }

  async decodeNotificationPayload(payload: string): Promise<{
    bundleId: string;
    decodedPayload: DecodedNotificationPayload;
    originalTransactionId: string;
  }> {
    const decodedPayload = await decodeNotificationPayload(payload);

    if (!decodedPayload.data) {
      throw new Error('Decoded payload contains no data');
    }

    const { bundleId, originalTransactionId } = await decodeTransaction(
      decodedPayload.data.signedTransactionInfo
    );
    return {
      bundleId,
      decodedPayload,
      originalTransactionId,
    };
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
    return this.querySubscriptionPurchase(
      bundleId,
      originalTransactionId,
      notification.notificationType,
      notification?.subtype
    );
  }

  /**
   * Delete all purchases for a user.
   * This is intended to be used when a user deletes their account.
   */
  async deletePurchases(userId: string): Promise<void> {
    const purchases = await this.purchasesDbRef
      .where('userId', '==', userId)
      .get();
    const batch = this.purchasesDbRef.firestore.batch();
    for (const purchase of purchases.docs) batch.delete(purchase.ref);
    await batch.commit();
  }
}
