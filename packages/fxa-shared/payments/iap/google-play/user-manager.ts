/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CollectionReference } from '@google-cloud/firestore';
import { ILogger } from 'fxa-shared/log';
import {
  GOOGLE_PLAY_FORM_OF_PAYMENT,
  SubscriptionPurchase,
} from './subscription-purchase';
import { SkuType } from './types/purchases';

export class UserManager {
  constructor(
    public purchasesDbRef: CollectionReference,
    protected log: ILogger
  ) {}

  async querySubscriptions(
    userId: string,
    sku?: string,
    packageName?: string
  ): Promise<Array<SubscriptionPurchase>> {
    // Create query to fetch possibly active subscriptions from Firestore
    let query = this.buildSubscriptionQuery(userId, sku, packageName);

    // Do fetch possibly active subscription from Firestore
    const result = await query.get();

    const purchaseList = new Array<SubscriptionPurchase>();
    for (const purchaseRecordSnapshot of result.docs) {
      purchaseList.push(
        SubscriptionPurchase.fromFirestoreObject(purchaseRecordSnapshot.data())
      );
    }
    return purchaseList;
  }

  protected buildSubscriptionQuery(
    userId: string,
    sku: string | undefined,
    packageName: string | undefined
  ) {
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
    return query;
  }
}
