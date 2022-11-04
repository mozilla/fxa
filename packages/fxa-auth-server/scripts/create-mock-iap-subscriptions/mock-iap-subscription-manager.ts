/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { CollectionReference, Firestore } from '@google-cloud/firestore';
import { AppConfig, AuthFirestore } from '../../lib/types';
import Container from 'typedi';

export class MockIapSubscriptionManager {
  firestore: Firestore;
  collectionPrefix: string;

  constructor() {
    this.firestore = Container.get(AuthFirestore);
    const { authFirestore } = Container.get(AppConfig);
    this.collectionPrefix = `${authFirestore.prefix}iap-`;
  }

  private async insert(purchasesDbRef: CollectionReference, records: any[]) {
    for (const record of records) {
      await purchasesDbRef.add(record);
    }
  }

  private getDbRef(collectionName: string) {
    return this.firestore.collection(this.collectionPrefix + collectionName);
  }

  public createAppStore(records: any[]) {
    return this.insert(this.getDbRef('app-store-purchases'), records);
  }

  public createPlayStore(records: any[]) {
    return this.insert(this.getDbRef('play-purchases'), records);
  }
}
