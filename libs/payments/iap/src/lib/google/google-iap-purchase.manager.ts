import { Inject, Injectable, Logger } from '@nestjs/common';
import { GoogleIapClientConfig } from './google-iap.client.config';
import { FirestoreService } from '@fxa/shared/db/firestore';
import type { CollectionReference, Firestore } from '@google-cloud/firestore';
import {
  mergePurchaseWithFirestorePurchaseRecord,
  PlayStoreSubscriptionPurchase,
} from './subscription-purchase';
import {
  createPurchase,
  deletePurchasesByUserId,
  getActivePurchasesForUserId,
  getPurchase,
  updatePurchase,
} from './google-iap-purchase.repository';
import type { NotificationType } from './types';
import { GoogleIapClient } from './google-iap.client';
import { GoogleIapUnknownError } from './google-iap.error';
import { REPLACED_PURCHASE_USERID_PLACEHOLDER } from './constants';

@Injectable()
export class GoogleIapPurchaseManager {
  constructor(
    private config: GoogleIapClientConfig,
    @Inject(FirestoreService) private firestore: Firestore,
    private googleIapClient: GoogleIapClient,
    private log: Logger
  ) {}

  get collectionRef(): CollectionReference {
    return this.firestore.collection(this.config.collectionName);
  }

  async getForUser(
    userId: string,
    sku?: string,
    packageName?: string
  ): Promise<Array<PlayStoreSubscriptionPurchase>> {
    const purchaseList = new Array<PlayStoreSubscriptionPurchase>();

    // Create query to fetch possibly active subscriptions from Firestore
    const firestoreResults = await getActivePurchasesForUserId(
      this.collectionRef,
      userId,
      {
        sku,
        packageName,
      }
    );

    // Loop through these subscriptions and filter those that are indeed active
    for (const purchaseRecordSnapshot of firestoreResults) {
      let purchase = PlayStoreSubscriptionPurchase.fromFirestoreObject(
        purchaseRecordSnapshot
      );

      if (
        !purchase.isEntitlementActive() &&
        !purchase.isAccountHold() &&
        !purchase.isPaused()
      ) {
        // If a subscription purchase record in Firestore indicates says that it has expired,
        // and we haven't confirmed that it's in Account Hold,
        // and we know that its status could have been changed since we last fetch its details,
        // then we should query Play Developer API to get its latest status
        this.log.debug('queryCurrentSubscriptions.cache.update', {
          purchaseToken: purchase.purchaseToken,
        });
        purchase = await this.getFromPlayStoreApi(
          purchase.packageName,
          purchase.sku,
          purchase.purchaseToken
        );
      }

      if (purchase.isAccountHold() || purchase.isPaused()) {
        this.log.log('getForUser.accountHoldOrPaused', {
          purchaseToken: purchase.purchaseToken,
          userId: purchase.userId,
        });
      }

      // Add the updated purchase to list to returned to clients
      if (purchase.isEntitlementActive()) {
        purchaseList.push(purchase);
      }
    }

    return purchaseList;
  }

  /*
   * Query a subscription purchase by its package name, product Id (sku) and purchase token.
   * The method queries Google Play Developer API to get the latest status of the purchase,
   * then merge it with purchase ownership info stored in the library's managed Firestore database,
   * then returns the merge information as a SubscriptionPurchase to its caller.
   *  - triggerNotificationType is only necessary if the purchase query action is triggered by a Realtime Developer notification
   */
  public async getFromPlayStoreApi(
    packageName: string,
    sku: string,
    purchaseToken: string,
    triggerNotificationType?: NotificationType
  ): Promise<PlayStoreSubscriptionPurchase> {
    // STEP 1. Query Play Developer API to verify the purchase token
    const apiResponse = await this.googleIapClient.getSubscriptions(
      packageName,
      sku,
      purchaseToken
    );

    try {
      // STEP 2. Look up purchase records from Firestore which matches this purchase token
      const firestorePurchaseRecord = await getPurchase(
        this.collectionRef,
        purchaseToken
      );

      // Generate SubscriptionPurchase object from Firestore response
      const now = Date.now();
      const subscriptionPurchase =
        PlayStoreSubscriptionPurchase.fromApiResponse(
          apiResponse,
          packageName,
          purchaseToken,
          sku,
          now
        );

      // Store notificationType to database if queryPurchase was triggered by a realtime developer notification
      if (triggerNotificationType !== undefined) {
        subscriptionPurchase.latestNotificationType = triggerNotificationType;
      }

      // Convert subscriptionPurchase object to a format that to be stored in Firestore
      const firestoreObject = subscriptionPurchase.toFirestoreObject();

      if (firestorePurchaseRecord) {
        // STEP 3a. We have this purchase cached in Firestore. Update our cache with the newly received response from Google Play Developer API
        await updatePurchase(
          this.collectionRef,
          purchaseToken,
          firestoreObject
        );

        // STEP 4a. Merge other fields of our purchase record in Firestore (such as userId) with our SubscriptionPurchase object and return to caller.
        mergePurchaseWithFirestorePurchaseRecord(
          subscriptionPurchase,
          firestorePurchaseRecord
        );
        return subscriptionPurchase;
      } else {
        // STEP 3b. This is a brand-new subscription purchase. Just save the purchase record to Firestore
        await createPurchase(this.collectionRef, firestoreObject);

        if (subscriptionPurchase.linkedPurchaseToken) {
          // STEP 4b. This is a subscription purchase that replaced other subscriptions in the past. Let's disable the purchases that it has replaced.
          await this.disableReplacedSubscription(
            packageName,
            sku,
            subscriptionPurchase.linkedPurchaseToken
          );
        }

        // STEP 5. This is a brand-new subscription purchase. Just save the purchase record to Firestore and return an SubscriptionPurchase object with userId = null.
        return subscriptionPurchase;
      }
    } catch (err) {
      // Some unexpected error has occurred while interacting with Firestore.
      throw new GoogleIapUnknownError('Unknown error', {
        cause: err,
      });
    }
  }

  /*
   * There are situations that a subscription is replaced by another subscription.
   * For example, an user signs up for a subscription (tokenA), cancel its and re-signups (tokenB)
   * We must disable the subscription linked to tokenA because it has been replaced by tokenB.
   * If failed to do so, there's chance that a malicious user can have a single purchase registered to multiple user accounts.
   *
   * This method is used to disable a replaced subscription. It's not intended to be used from outside of the library.
   */
  private async disableReplacedSubscription(
    packageName: string,
    sku: string,
    purchaseToken: string
  ): Promise<void> {
    this.log.debug('Disabling purchase token', { purchaseToken });

    // STEP 1: Lookup the purchase record in Firestore
    const firestorePurchaseRecord = await getPurchase(
      this.collectionRef,
      purchaseToken
    );

    if (firestorePurchaseRecord) {
      // Purchase record found in Firestore. Check if it has been disabled.
      if (firestorePurchaseRecord.replacedByAnotherPurchase) {
        // The old purchase has been replaced. We don't need to take further action
        return;
      } else {
        // STEP 2a: Old purchase found in cache, so we disable it
        await updatePurchase(this.collectionRef, purchaseToken, {
          replacedByAnotherPurchase: true,
          userId: REPLACED_PURCHASE_USERID_PLACEHOLDER,
        });
        return;
      }
    } else {
      // Purchase record not found in Firestore. We'll try to fetch purchase detail from Play Developer API to backfill the missing cache

      const apiResponse = await this.googleIapClient
        .getSubscriptions(packageName, sku, purchaseToken)
        .catch((err) => {
          // We only log an warning to as there is chance that backfilling is impossible.
          // For example: after a subscription upgrade, the new token has linkedPurchaseToken to be the token before upgrade.
          // We can't tell the sku of the purchase before upgrade from the old token itself, so we can't query Play Developer API
          // to backfill our cache.
          this.log.warn('backfill_fetch_error', {
            message:
              'Error fetching purchase data from Play Developer API to backfilled missing purchase record in Firestore. ',
            errorMessage: err.message,
          });
        });

      if (apiResponse) {
        // STEP 2b. Parse the response from Google Play Developer API and store the purchase detail
        const now = Date.now();
        const subscriptionPurchase =
          PlayStoreSubscriptionPurchase.fromApiResponse(
            apiResponse,
            packageName,
            purchaseToken,
            sku,
            now
          );
        subscriptionPurchase.replacedByAnotherPurchase = true; // Mark the purchase as already being replaced by other purchase.
        subscriptionPurchase.userId = REPLACED_PURCHASE_USERID_PLACEHOLDER;
        const firestoreObject = subscriptionPurchase.toFirestoreObject();
        await updatePurchase(
          this.collectionRef,
          purchaseToken,
          firestoreObject
        );

        // STEP 3. If this purchase has also replaced another purchase, repeating from STEP 1 with the older token
        if (subscriptionPurchase.linkedPurchaseToken) {
          await this.disableReplacedSubscription(
            packageName,
            sku,
            subscriptionPurchase.linkedPurchaseToken
          );
        }
      }
    }
  }

  async forceRegisterToUser(
    purchaseToken: string,
    userId: string
  ): Promise<void> {
    await updatePurchase(this.collectionRef, purchaseToken, {
      userId,
    });
  }

  async getStaleCached(
    purchaseToken: string
  ): Promise<PlayStoreSubscriptionPurchase | undefined> {
    const result = await getPurchase(this.collectionRef, purchaseToken);

    if (result) {
      return PlayStoreSubscriptionPurchase.fromFirestoreObject(result);
    }
    return;
  }

  async deleteForUser(userId: string): Promise<void> {
    await deletePurchasesByUserId(this.collectionRef, userId);
  }
}
