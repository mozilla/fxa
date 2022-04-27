/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { CollectionReference } from '@google-cloud/firestore';
import { TransactionType } from 'app-store-server-api';
import { Logger } from 'mozlog';
import { APPLE_APP_STORE_FORM_OF_PAYMENT } from './subscription-purchase';

export class PurchaseManager {
  constructor(
    protected purchasesDbRef: CollectionReference,
    protected log: Logger
  ) {}

  public async getSubscriptions(
    userId: string,
    productId: string,
    bundleId: string
  ) {
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
    return queryResult;
  }
}
