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
import Container from 'typedi';

import { AuthLogger } from '../../../types';
import { PurchaseManager } from './purchase-manager';
import {
  GOOGLE_PLAY_FORM_OF_PAYMENT,
  PlayStoreSubscriptionPurchase,
} from './subscription-purchase';
import { PurchaseQueryError, SkuType } from './types';
import { UserManager as UserManagerBase } from 'fxa-shared/payments/iap/google-play/user-manager';

/*
 * A class that allows looking up purchases registered to a particular user
 */
export class UserManager extends UserManagerBase {
  /*
   * This class is intended to be initialized by the library.
   * Library consumer should not initialize this class themselves.
   */
  constructor(
    purchasesDbRef: CollectionReference,
    purchaseManager: PurchaseManager
  ) {
    super(purchasesDbRef, purchaseManager, Container.get(AuthLogger));
  }

  /*
   * Query subscriptions registered to a particular user, that are either active or in account hold.
   * Note: Other subscriptions which don't meet the above criteria still exists in Firestore purchase records, but not accessible from outside of the library.
   */
  async queryCurrentSubscriptions(
    userId: string,
    sku?: string,
    packageName?: string
  ): Promise<Array<PlayStoreSubscriptionPurchase>> {
    const purchaseList = new Array<PlayStoreSubscriptionPurchase>();

    try {
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
    } catch (err) {
      this.log.error('queryCurrentSubscriptions.firestoreFetch', { err });
      const libraryError = new Error(err.message);
      libraryError.name = PurchaseQueryError.OTHER_ERROR;
      throw libraryError;
    }
  }
}
