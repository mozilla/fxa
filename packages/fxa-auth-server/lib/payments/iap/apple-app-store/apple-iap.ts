/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Firestore } from '@google-cloud/firestore';
import { Container } from 'typedi';

import { AppConfig, AuthFirestore, AuthLogger } from '../../../types';
import { AppStoreHelper } from './app-store-helper';
import { PurchaseManager } from './purchase-manager';

export class AppleIAP {
  private firestore: Firestore;
  private log: AuthLogger;
  private prefix: string;

  public purchaseManager: PurchaseManager;

  constructor() {
    this.log = Container.get(AuthLogger);
    const appStoreHelper = new AppStoreHelper();

    this.firestore = Container.get(AuthFirestore);
    const { authFirestore } = Container.get(AppConfig);
    this.prefix = `${authFirestore.prefix}iap-`;
    const purchasesDbRef = this.purchasesDbRef();
    this.purchaseManager = new PurchaseManager(purchasesDbRef, appStoreHelper);
  }

  purchasesDbRef() {
    return this.firestore.collection(`${this.prefix}app-store-purchases`);
  }
}
