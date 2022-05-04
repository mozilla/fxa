/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CollectionReference } from '@google-cloud/firestore';
import { ILogger } from 'fxa-shared/log';
import { PurchaseManager } from './purchase-manager';
import {
  GOOGLE_PLAY_FORM_OF_PAYMENT,
  PlayStoreSubscriptionPurchase,
} from './subscription-purchase';
import { SkuType } from './types/purchases';

export class UserManager {
  constructor(
    protected purchasesDbRef: CollectionReference,
    protected purchaseManager: PurchaseManager,
    protected log: ILogger
  ) {}

  async queryCurrentSubscriptions(
    userId: string,
    sku?: string,
    packageName?: string
  ): Promise<Array<PlayStoreSubscriptionPurchase>> {
    const purchaseList = new Array<PlayStoreSubscriptionPurchase>();

    // Create query to fetch possibly active subscriptions from Firestore
    // Create query to fetch possibly active subscriptions from Firestore
    let query = this.purchasesDbRef
      .where('formOfPayment', '==', GOOGLE_PLAY_FORM_OF_PAYMENT)
      .where('skuType', '==', SkuType.SUBS)
      .where('userId', '==', userId)
      .where('isMutable', '==', true);

    if (sku) {
      query = query.where('sku', '==', sku);
    }

    if (packageName) {
      query = query.where('packageName', '==', packageName);
    }

    // Do fetch possibly active subscription from Firestore
    const queryResult = await query.get();

    // Loop through these subscriptions and filter those that are indeed active
    for (const purchaseRecordSnapshot of queryResult.docs) {
      let purchase: PlayStoreSubscriptionPurchase =
        PlayStoreSubscriptionPurchase.fromFirestoreObject(
          purchaseRecordSnapshot.data()
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
        this.log.info('queryCurrentSubscriptions.cache.update', {
          purchaseToken: purchase.purchaseToken,
        });
        purchase = await this.purchaseManager.querySubscriptionPurchase(
          purchase.packageName,
          purchase.sku,
          purchase.purchaseToken
        );
      }

      // Add the updated purchase to list to returned to clients
      if (
        purchase.isEntitlementActive() ||
        purchase.isAccountHold() ||
        purchase.isPaused()
      ) {
        purchaseList.push(purchase);
      }
    }

    return purchaseList;
  }
}
