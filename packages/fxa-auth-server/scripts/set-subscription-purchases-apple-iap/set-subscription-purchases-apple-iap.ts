/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Firestore } from '@google-cloud/firestore';
import { PurchaseManager } from 'fxa-shared/payments/iap/apple-app-store/purchase-manager';
import { AppStoreSubscriptionPurchase } from 'fxa-shared/payments/iap/apple-app-store/subscription-purchase';
import PQueue from 'p-queue';
import Container from 'typedi';

import { ConfigType } from '../../config';
import { APPLE_APP_STORE_FORM_OF_PAYMENT } from '../../lib/payments/iap/apple-app-store/subscription-purchase';
import { AppConfig, AuthFirestore, AuthLogger } from '../../lib/types';
import { AppStoreHelper } from '../../lib/payments/iap/apple-app-store/app-store-helper';

// General note: For the Apple IAP collection, the Firestore document ID
// is the original transaction ID (which is the App Store's analog to the
// Stripe subscription ID).

/**
 * Firestore subscriptions contain additional expanded information
 * on top of the base AppStoreSubscriptionPurchase type.
 */
export interface FirestoreSubscription extends AppStoreSubscriptionPurchase {
  formOfPayment: typeof APPLE_APP_STORE_FORM_OF_PAYMENT;
}

export class SubscriptionPurchaseUpdater {
  private config: ConfigType;
  private firestore: Firestore;
  private purchaseManager: PurchaseManager;
  private rateLimitQueue: PQueue;
  private subscriptionCollection: string;

  /**
   * An updater to fetch the latest App Store subscription information from Apple and
   * update Firestore.
   * @param batchSize Number of subscriptions to fetch from Firestore at a time
   * @param purchaseManager An instance of the Apple IAP PurchaseManager
   * @param log An instance of AuthLogger
   * @param dryRun True to log the updates we would make to Firestore without actually
   * writing to Firestore.
   * @param rateLimit A limit for number of App Store Server API requests within the
   * period of 1 second
   */
  constructor(
    private batchSize: number,
    private appStoreHelper: AppStoreHelper,
    private log: AuthLogger,
    public dryRun: boolean,
    rateLimit: number
  ) {
    const config = Container.get<ConfigType>(AppConfig);
    this.config = config;

    const firestore = Container.get<Firestore>(AuthFirestore);
    this.firestore = firestore;

    this.rateLimitQueue = new PQueue({
      intervalCap: rateLimit,
      interval: 1000, // The App Store Server API measures it's rate limit per second
    });

    const collectionPrefix = `${this.config.authFirestore.prefix}iap-`;
    this.subscriptionCollection = `${collectionPrefix}app-store-purchases`;
    const purchasesDbRef = this.firestore.collection(
      this.subscriptionCollection
    );
    this.purchaseManager = new PurchaseManager(
      purchasesDbRef,
      appStoreHelper,
      log
    );
  }

  /**
   * Update all Apple IAP subscriptions from the App Store Server API's
   * Gett All Subscription Statuses endpoint to Firestore in batches
   */
  async update() {
    let startAfter: string | null = null;
    let hasMore = true;

    while (hasMore) {
      const subscriptions = await this.fetchSubsBatch(startAfter);

      startAfter = subscriptions.at(-1)?.originalTransactionId as string;
      if (!startAfter) hasMore = false;

      await Promise.all(
        subscriptions.map((sub) => this.updateSubscription(sub))
      );
    }
  }

  /**
   * Fetches subscriptions from Firestore paginated by batchSize
   * @param startAfter originalTransactionId of the last element of the previous
   * batch for pagination.
   * @returns A list of subscriptions from Firestore
   */
  async fetchSubsBatch(startAfter: string | null) {
    const subscriptionSnap = await this.firestore
      .collectionGroup(this.subscriptionCollection)
      .orderBy('originalTransactionId')
      .startAfter(startAfter)
      .limit(this.batchSize)
      .get();

    const subscriptions = subscriptionSnap.docs.map(
      (doc) => doc.data() as FirestoreSubscription
    );

    return subscriptions;
  }

  /**
   * Attempts to update an Apple IAP subscription in Firestore with
   * the latest subscription information from the App Store Server.
   * @param firestoreSubscription The subscription to convert
   */
  async updateSubscription(firestoreSubscription: FirestoreSubscription) {
    const { bundleId, originalTransactionId } = firestoreSubscription;

    try {
      if (!this.dryRun) {
        await this.fetchAppleSubscription(bundleId, originalTransactionId);
      }

      console.log(originalTransactionId);
    } catch (e) {
      console.error(originalTransactionId, e);
    }
  }

  /**
   * Retrieves an Apple IAP subscription record directly from Apple
   * @param bundleId The App Store bundle ID for the subscription
   * @param originalTransactionId The App Store original transaction ID for
   * the subscription
   * @returns The subscription record for the ids provided, or null if not
   * found or deleted
   */
  async fetchAppleSubscription(
    bundleId: string,
    originalTransactionId: string
  ) {
    const subscription = await this.enqueueRequest(
      async () =>
        await this.purchaseManager.querySubscriptionPurchase(
          bundleId,
          originalTransactionId
        )
    );

    if (!subscription) return null;

    return subscription;
  }

  async enqueueRequest<T>(callback: () => T): Promise<T> {
    return this.rateLimitQueue.add(callback, {
      throwOnTimeout: true,
    });
  }
}
