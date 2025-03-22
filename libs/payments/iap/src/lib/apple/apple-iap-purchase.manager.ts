/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger } from '@nestjs/common';
import type { CollectionReference, Firestore } from '@google-cloud/firestore';
import { FirestoreService } from '@fxa/shared/db/firestore';
import {
  createPurchase,
  deletePurchasesByUserId,
  getActivePurchasesForUserId,
  getPurchase,
  updatePurchase,
} from './apple-iap-purchase.repository';
import { AppleIapClientConfig } from './apple-iap.client.config';
import {
  AppStoreSubscriptionPurchase,
  mergePurchaseWithFirestorePurchaseRecord,
} from './subscription-purchase';
import {
  decodeRenewalInfo,
  decodeTransaction,
  type NotificationSubtype,
  type NotificationType,
} from 'app-store-server-api';
import { AppleIapClient } from './apple-iap.client';
import {
  AppleIapNotFoundError,
  AppleIapNoTransactionsFoundError,
  AppleIapUnknownError,
} from './apple-iap.error';

@Injectable()
export class AppleIapPurchaseManager {
  collectionRef: CollectionReference;

  constructor(
    config: AppleIapClientConfig,
    @Inject(FirestoreService) firestore: Firestore,
    private appleIapClient: AppleIapClient,
    private log: Logger
  ) {
    this.collectionRef = firestore.collection(config.collectionName);
  }

  async getForUser(
    userId: string,
    bundleId?: string,
    productId?: string
  ): Promise<AppStoreSubscriptionPurchase[]> {
    const firestorePurchaseRecords = await getActivePurchasesForUserId(
      this.collectionRef,
      userId,
      {
        bundleId,
        productId,
      }
    );

    const purchaseList: AppStoreSubscriptionPurchase[] = [];
    for (const firestorePurchaseRecord of firestorePurchaseRecords) {
      let purchase = AppStoreSubscriptionPurchase.fromFirestoreObject(
        firestorePurchaseRecord
      );

      if (!purchase.isEntitlementActive()) {
        // Unlike inactive Google Play subscriptions, which get replaced and
        // deregistered, App Store subscriptions can be revived at any time
        // (see https://developer.apple.com/forums/thread/704167).
        // This means we could be hitting Apple here for any past, inactive
        // subscriptions the user has, which could generate a lot of requests
        // to Apple via querySubscriptionPurchase.
        // However, since anything they buy in the same subscription group will
        // get the same original transaction ID, the number of requests is
        // limited to the number of different iOS products (N = 1 currently),
        // and we already minimize calls to this method by caching the results
        // of the capability service in the profile server, so this extra request
        // per subscription is not currently a performance concern.
        this.log.debug('queryCurrentSubscriptionPurchases.cache.update', {
          originalTransactionId: purchase.originalTransactionId,
        });
        try {
          purchase = await this.getFromAppStoreAPI(
            purchase.bundleId,
            purchase.originalTransactionId
          );
        } catch (error) {
          if (
            error instanceof AppleIapNotFoundError ||
            error instanceof AppleIapNoTransactionsFoundError
          ) {
            // An expired Apple subscription could not be found. No action is necessary.
            this.log.warn(
              'queryCurrentSubscriptionPurchases.TransactionIdNotFound',
              {
                bundle: purchase.bundleId,
                originalTransactionId: purchase.originalTransactionId,
                userId,
              }
            );
          } else {
            throw error;
          }
        }
      }

      // Add the updated purchase to list to returned to clients
      if (purchase.isEntitlementActive()) {
        purchaseList.push(purchase);
      }
    }

    return purchaseList;
  }

  /*
   * Query a subscription purchase by its bundle ID and original transaction ID.
   * The method queries the V2 App Store Server API to get the latest status of the purchase,
   * then merge it with purchase ownership info stored in the library's managed Firestore database,
   * then returns the merged information as a SubscriptionPurchase to its caller.
   * A brand new subscription will not yet have a defined userId;
   * that's handled by registerToUserAccount.
   *
   * triggerNotificationType is only necessary if the purchase query action is triggered
   * by an App Store Server notification.
   */
  private async getFromAppStoreAPI(
    bundleId: string,
    originalTransactionId: string,
    triggerNotificationType?: NotificationType,
    triggerNotificationSubtype?: NotificationSubtype
  ) {
    // STEP 1. Query App Store Server API to get the subscription status
    const apiResponse = await this.appleIapClient.getSubscriptionStatuses(
      bundleId,
      originalTransactionId
    );
    // Find the latest transaction for the subscription
    const item = apiResponse.data[0].lastTransactions.find(
      (item) => item.originalTransactionId === originalTransactionId
    );
    if (!item) {
      throw new AppleIapNoTransactionsFoundError('No transactions found');
    }
    const subscriptionStatus = item.status;
    const transactionInfo = await decodeTransaction(item.signedTransactionInfo);
    const renewalInfo = await decodeRenewalInfo(item.signedRenewalInfo);

    this.log.debug(
      'appleIap.querySubscriptionPurchase.getSubscriptionStatuses',
      {
        bundleId,
        originalTransactionId,
        transactionInfo,
        renewalInfo,
        ...(triggerNotificationType && {
          notificationType: triggerNotificationType,
        }),
        ...(triggerNotificationSubtype && {
          notificationSubtype: triggerNotificationSubtype,
        }),
      }
    );

    try {
      // STEP 2. Look up purchase records from Firestore that matches this original transaction ID
      const firestorePurchaseRecord = await getPurchase(
        this.collectionRef,
        originalTransactionId
      );

      // Generate SubscriptionPurchase object from API response
      const now = Date.now();
      const subscriptionPurchase = AppStoreSubscriptionPurchase.fromApiResponse(
        apiResponse,
        subscriptionStatus,
        transactionInfo,
        renewalInfo,
        originalTransactionId,
        now
      );

      // Store notificationType and notificationSubtype to database if this was
      // triggered by a notification
      if (triggerNotificationType !== undefined) {
        subscriptionPurchase.latestNotificationType = triggerNotificationType;
        if (triggerNotificationSubtype !== undefined) {
          subscriptionPurchase.latestNotificationSubtype =
            triggerNotificationSubtype;
        }
      }

      // Convert subscriptionPurchase object to a format that to be stored in Firestore
      const firestoreObject = subscriptionPurchase.toFirestoreObject();

      if (firestorePurchaseRecord) {
        // STEP 3a. We have this purchase cached in Firestore. Update our cache with the
        // newly received response from the App Store Server API, while preserving the
        // userId if present.
        const userId = firestorePurchaseRecord.userId;
        await updatePurchase(this.collectionRef, originalTransactionId, {
          ...(!!userId && { userId }),
          ...firestoreObject,
        });

        // STEP 4a. Merge other fields of our purchase record in Firestore (such as userId) with our SubscriptionPurchase object and return to caller.
        mergePurchaseWithFirestorePurchaseRecord(
          subscriptionPurchase,
          firestorePurchaseRecord
        );
        return subscriptionPurchase;
      } else {
        // STEP 3b. This is a brand new subscription purchase. Just save the purchase record to Firestore
        await createPurchase(this.collectionRef, {
          id: originalTransactionId,
          ...firestoreObject,
        });

        // STEP 4. This is a brand new subscription purchase. Just save the purchase record to Firestore and return an SubscriptionPurchase object with userId undefined.
        return subscriptionPurchase;
      }
    } catch (err) {
      const libraryError = new AppleIapUnknownError('Unknown error', {
        cause: err,
      });
      this.log.error(
        'querySubscriptionPurchase.PurchaseQueryError.OtherError',
        {
          err: libraryError,
          originalTransactionId,
        }
      );
      throw libraryError;
    }
  }

  async forceRegisterToUser(
    originalTransactionId: string,
    userId: string
  ): Promise<void> {
    await updatePurchase(this.collectionRef, originalTransactionId, {
      userId,
    });
  }

  async getStaleCached(
    originalTransactionId: string
  ): Promise<AppStoreSubscriptionPurchase | undefined> {
    const result = await getPurchase(this.collectionRef, originalTransactionId);

    if (result) {
      return AppStoreSubscriptionPurchase.fromFirestoreObject(result);
    }
    return;
  }

  async deleteForUser(userId: string): Promise<void> {
    await deletePurchasesByUserId(this.collectionRef, userId);
  }
}
