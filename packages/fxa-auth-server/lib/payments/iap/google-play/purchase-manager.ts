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
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { CollectionReference } from '@google-cloud/firestore';
import { androidpublisher_v3 } from 'googleapis';
import Container from 'typedi';
import { AuthLogger } from '../../../types';
import { PurchaseManager as PurchaseManagerBase } from 'fxa-shared/payments/iap/google-play/purchase-manager';
import {
  DeveloperNotification,
  NotificationType,
  PurchaseUpdateError,
  SkuType,
} from './types';
import { SubscriptionPurchase } from './subscription-purchase';

/*
 * A class that provides user-purchase linking features
 */
export class PurchaseManager extends PurchaseManagerBase {
  /*
   * This class is intended to be initialized by the library.
   * Library consumer should not initialize this class themselves.
   */
  constructor(
    purchasesDbRef: CollectionReference,
    playDeveloperApiClient: androidpublisher_v3.Androidpublisher
  ) {
    super(purchasesDbRef, playDeveloperApiClient, Container.get(AuthLogger));
  }

  /*
   * Force register a purchase to an user.
   * This method is not intended to be called from outside of the library.
   */
  private async forceRegisterToUserAccount(
    purchaseToken: string,
    userId: string
  ): Promise<void> {
    try {
      await this.purchasesDbRef.doc(purchaseToken).update({ userId: userId });
    } catch (err) {
      const libraryError = new Error(err.message);
      libraryError.name = PurchaseUpdateError.OTHER_ERROR;
      throw libraryError;
    }
  }

  /**
   * Get a purchase record from Firestore.
   */
  public async getPurchase(purchaseToken: string) {
    const purchaseRecordDoc = await this.purchasesDbRef
      .doc(purchaseToken)
      .get();
    if (purchaseRecordDoc.exists) {
      return SubscriptionPurchase.fromFirestoreObject(purchaseRecordDoc.data());
    }
    return;
  }

  /*
   * Register a purchase (both one-time product and recurring subscription) to a user.
   * It's intended to be exposed to Android app to verify purchases made in the app.
   *
   * Note: `skuType` is not currently used as there's no immediate use-case for one-time
   * purchases. The original sample implementation has additional logic supporting it
   * that can be re-incorporated here if needed.
   */
  async registerToUserAccount(
    packageName: string,
    sku: string,
    purchaseToken: string,
    skuType: SkuType,
    userId: string
  ): Promise<SubscriptionPurchase> {
    // The original Google Play sample code did not use Google API efficiency
    // guidelines, the updated version here checks our local Firestore record
    // first to determine if we've seen the token before, and if not, it will
    // query Play Developer API to verify the purchase.
    // https://developer.android.com/google/play/developer-api#subscriptions

    // STEP 1. Check if the purchase record is already in Firestore
    let purchase = await this.getPurchase(purchaseToken);
    if (!purchase) {
      // STEP 1b. Query Play Developer API to verify the purchase
      try {
        purchase = await this.querySubscriptionPurchase(
          packageName,
          sku,
          purchaseToken
        );
      } catch (err) {
        // Error when attempt to query purchase. Return invalid token to caller.
        const libraryError = new Error(err.message);
        libraryError.name = PurchaseUpdateError.INVALID_TOKEN;
        throw libraryError;
      }
    }

    // STEP 2. Check if the purchase is registerable.
    if (!purchase.isRegisterable()) {
      const libraryError = new Error('Purchase is not registerable');
      libraryError.name = PurchaseUpdateError.INVALID_TOKEN;
      throw libraryError;
    }

    // STEP 3. Check if the purchase has been registered to an user. If it is, then return conflict error to our caller.
    if (purchase.userId === userId) {
      // Purchase record already registered to the target user. We'll do nothing.
      return purchase;
    } else if (purchase.userId) {
      this.log.info('purchase already registered', { purchase });
      // Purchase record already registered to different user. Return 'conflict' to caller
      const libraryError = new Error(
        'Purchase has been registered to another user'
      );
      libraryError.name = PurchaseUpdateError.CONFLICT;
      throw libraryError;
    }

    // STEP 3: Register purchase to the user
    await this.forceRegisterToUserAccount(purchaseToken, userId);

    return purchase;
  }

  async processDeveloperNotification(
    packageName: string,
    notification: DeveloperNotification
  ): Promise<SubscriptionPurchase | null> {
    // Type-guard for a real-time developer notification.
    const subscriptionNotification = notification.subscriptionNotification;
    if (!subscriptionNotification) {
      return null;
    }
    if (
      subscriptionNotification.notificationType !==
      NotificationType.SUBSCRIPTION_PURCHASED
    ) {
      // We can safely ignore SUBSCRIPTION_PURCHASED because with new subscription, our Android app will send the same token to server for verification
      // For other type of notification, we query Play Developer API to update our purchase record cache in Firestore
      return this.querySubscriptionPurchase(
        packageName,
        subscriptionNotification.subscriptionId,
        subscriptionNotification.purchaseToken,
        subscriptionNotification.notificationType
      );
    }

    return null;
  }
}
