/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { CollectionReference } from '@google-cloud/firestore';
import { TransactionType } from 'app-store-server-api';
import { decodeRenewalInfo, decodeTransaction } from 'app-store-server-api';
import { Logger } from 'mozlog';
import { AppStoreHelper } from './app-store-helper';
import {
  APPLE_APP_STORE_FORM_OF_PAYMENT,
  mergePurchaseWithFirestorePurchaseRecord,
  SubscriptionPurchase,
} from './subscription-purchase';
import { PurchaseQueryError, PurchaseUpdateError } from './types';

export class PurchaseManager {
  constructor(
    protected purchasesDbRef: CollectionReference,
    protected appStoreHelper: AppStoreHelper,
    protected log: Logger
  ) {}

  /*
   * Query a subscription purchase by its bundle ID and original transaction ID.
   * The method queries the V2 App Store Server API to get the latest status of the purchase,
   * then merge it with purchase ownership info stored in the library's managed Firestore database,
   * then returns the merged information as a SubscriptionPurchase to its caller.
   * A brand new subscription will not yet have a defined userId;
   * that's handled by registerToUserAccount.
   */
  public async querySubscriptionPurchase(
    bundleId: string,
    originalTransactionId: string
  ) {
    // STEP 1. Query App Store Server API to get the subscription status
    let apiResponse;
    let subscriptionStatus;
    let transactionInfo;
    let renewalInfo;
    try {
      apiResponse = await this.appStoreHelper.getSubscriptionStatuses(
        bundleId,
        originalTransactionId
      );
      // Find the latest transaction for the subscription
      const item = apiResponse.data[0].lastTransactions.find(
        (item) => item.originalTransactionId === originalTransactionId
      );
      if (!item) {
        throw new Error('No transactions found');
      }
      subscriptionStatus = item.status;
      // FIXME: improve performance; see https://mozilla-hub.atlassian.net/browse/FXA-4949
      transactionInfo = await decodeTransaction(item.signedTransactionInfo);
      renewalInfo = await decodeRenewalInfo(item.signedRenewalInfo);
    } catch (err) {
      throw this.convertAppStoreAPIErrorToLibraryError(err);
    }

    try {
      // STEP 2. Look up purchase records from Firestore that matches this original transaction ID
      const purchaseRecordDoc = await this.purchasesDbRef
        .doc(originalTransactionId)
        .get();

      // Generate SubscriptionPurchase object from API response
      const now = Date.now();
      const subscriptionPurchase = SubscriptionPurchase.fromApiResponse(
        apiResponse,
        subscriptionStatus,
        transactionInfo,
        renewalInfo,
        originalTransactionId,
        now
      );

      // Convert subscriptionPurchase object to a format that to be stored in Firestore
      const firestoreObject = subscriptionPurchase.toFirestoreObject();

      if (purchaseRecordDoc.exists) {
        // STEP 3a. We have this purchase cached in Firestore. Update our cache with the newly received response from the App Store Server API
        await purchaseRecordDoc.ref.update(firestoreObject);

        // STEP 4a. Merge other fields of our purchase record in Firestore (such as userId) with our SubscriptionPurchase object and return to caller.
        mergePurchaseWithFirestorePurchaseRecord(
          subscriptionPurchase,
          purchaseRecordDoc.data()
        );
        return subscriptionPurchase;
      } else {
        // STEP 3b. This is a brand new subscription purchase. Just save the purchase record to Firestore
        await purchaseRecordDoc.ref.set(firestoreObject);

        // STEP 4. This is a brand new subscription purchase. Just save the purchase record to Firestore and return an SubscriptionPurchase object with userId undefined.
        return subscriptionPurchase;
      }
    } catch (err) {
      // Some unexpected error has occurred while interacting with Firestore.
      const libraryError = new Error(err.message);
      libraryError.name = PurchaseQueryError.OTHER_ERROR;
      throw libraryError;
    }
  }

  /**
   * Get purchase record from Firestore.
   */
  public async getSubscriptionPurchase(originalTransactionId: string) {
    const purchaseRecordDoc = await this.purchasesDbRef
      .doc(originalTransactionId)
      .get();
    if (purchaseRecordDoc.exists) {
      return SubscriptionPurchase.fromFirestoreObject(purchaseRecordDoc.data());
    }
    return;
  }

  /*
   * Query subscriptions registered to a particular user that are active.
   * Note: Other subscriptions which don't meet the above criteria still exists in Firestore purchase records, but are not accessible from outside of the library.
   */
  async queryCurrentSubscriptionPurchases(
    userId: string,
    bundleId?: string,
    productId?: string
  ): Promise<Array<SubscriptionPurchase>> {
    const purchaseList = new Array<SubscriptionPurchase>();

    try {
      // Create query to fetch possibly active subscriptions from Firestore
      let query = this.purchasesDbRef
        .where('formOfPayment', '==', APPLE_APP_STORE_FORM_OF_PAYMENT)
        .where('type', '==', TransactionType.AutoRenewableSubscription)
        .where('userId', '==', userId);

      if (productId) {
        query = query.where('productId', '==', productId);
      }

      if (bundleId) {
        query = query.where('bundleId', '==', bundleId);
      }

      // Do fetch possibly active subscription from Firestore
      const queryResult = await query.get();

      // Loop through these subscriptions and filter those that are indeed active
      for (const purchaseRecordSnapshot of queryResult.docs) {
        let purchase: SubscriptionPurchase =
          SubscriptionPurchase.fromFirestoreObject(
            purchaseRecordSnapshot.data()
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
          this.log.info('queryCurrentSubscriptionPurchases.cache.update', {
            originalTransactionId: purchase.originalTransactionId,
          });
          purchase = await this.querySubscriptionPurchase(
            purchase.bundleId,
            purchase.originalTransactionId
          );
        }

        // Add the updated purchase to list to returned to clients
        if (purchase.isEntitlementActive()) {
          purchaseList.push(purchase);
        }
      }

      return purchaseList;
    } catch (err) {
      this.log.error('queryCurrentSubscriptions.firestoreFetch', { err });
      const libraryError = new Error(err.message);
      libraryError.name = PurchaseQueryError.OTHER_ERROR;
      throw libraryError;
    }
  }

  // See Response Codes section at https://developer.apple.com/documentation/appstoreserverapi/get_all_subscription_statuses and
  // https://developer.apple.com/documentation/appstoreserverapi/error_codes
  convertAppStoreAPIErrorToLibraryError(appStoreError: any): Error {
    const libraryError = new Error(appStoreError.message);
    if (appStoreError.code === 404) {
      // The account, app or original transaction ID was not found.
      libraryError.name = PurchaseQueryError.NOT_FOUND;
    } else {
      // Unexpected error occurred.
      libraryError.name = PurchaseQueryError.OTHER_ERROR;
      this.log.error('convertAppStoreAPIErrorToLibraryError', {
        message: 'Unexpected error when querying the App Store Server API.',
      });
    }
    return libraryError;
  }
}
