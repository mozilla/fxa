/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable, Logger } from '@nestjs/common';
import {
  AppendedPlayStoreSubscriptionPurchase,
  DeveloperNotification,
  NotificationType,
} from './types';
import { GoogleIapPurchaseManager } from './google-iap-purchase.manager';
import { PlayStoreSubscriptionPurchase } from './subscription-purchase';
import {
  GoogleIapConflictError,
  GoogleIapInvalidPurchaseTokenError,
} from './google-iap.error';

@Injectable()
export class GoogleIapService {
  constructor(
    private purchaseManager: GoogleIapPurchaseManager,
    private log: Logger
  ) {}

  async getActiveSubscriptions(
    uid: string
  ): Promise<AppendedPlayStoreSubscriptionPurchase[]> {
    const purchases = await this.purchaseManager.getForUser(uid);

    // Below to be completed as part of FXA-7839
    //return this.stripeHelper.addPriceInfoToIapPurchases(
    //  purchases,
    //  MozillaSubscriptionTypes.IAP_GOOGLE
    //);
    return purchases as AppendedPlayStoreSubscriptionPurchase[];
  }

  async processNotification(
    packageName: string,
    notification: DeveloperNotification
  ): Promise<PlayStoreSubscriptionPurchase | null> {
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
      return this.purchaseManager.getFromPlayStoreApi(
        packageName,
        subscriptionNotification.subscriptionId,
        subscriptionNotification.purchaseToken,
        subscriptionNotification.notificationType
      );
    }

    return null;
  }

  async registerToUserAccount(
    packageName: string,
    sku: string,
    purchaseToken: string,
    userId: string
  ): Promise<PlayStoreSubscriptionPurchase> {
    // The original Google Play sample code did not use Google API efficiency
    // guidelines, the updated version here checks our local Firestore record
    // first to determine if we've seen the token before, and if not, it will
    // query Play Developer API to verify the purchase.
    // https://developer.android.com/google/play/developer-api#subscriptions

    // STEP 1. Check if the purchase record is already in Firestore
    let purchase = await this.purchaseManager.getStaleCached(purchaseToken);
    if (!purchase) {
      // STEP 1b. Query Play Developer API to verify the purchase
      try {
        purchase = await this.purchaseManager.getFromPlayStoreApi(
          packageName,
          sku,
          purchaseToken
        );
      } catch (err) {
        // Error when attempt to query purchase. Return invalid token to caller.
        throw new GoogleIapInvalidPurchaseTokenError(err.message, {
          info: { purchaseToken, userId },
        });
      }
    }

    // STEP 2. Check if the purchase is registerable.
    if (!purchase.isRegisterable()) {
      throw new GoogleIapInvalidPurchaseTokenError(
        'Purchase is not registerable',
        { info: { purchaseToken, userId } }
      );
    }

    // STEP 3. Check if the purchase has been registered to an user. If it is, then return conflict error to our caller.
    if (purchase.userId === userId) {
      // Purchase record already registered to the target user. We'll do nothing.
      return purchase;
    } else if (purchase.userId) {
      this.log.log('purchase already registered', { purchase });
      // Purchase record already registered to different user. Return 'conflict' to caller
      throw new GoogleIapConflictError(
        'Purchase has been registered to another user',
        { info: { purchaseToken, userId } }
      );
    }

    // STEP 3: Register purchase to the user
    await this.purchaseManager.forceRegisterToUser(purchaseToken, userId);

    return purchase;
  }
}
