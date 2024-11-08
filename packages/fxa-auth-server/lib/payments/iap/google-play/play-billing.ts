/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Firestore } from '@google-cloud/firestore';
import { Auth, google } from 'googleapis';
import { Container } from 'typedi';

import { AppConfig, AuthFirestore, AuthLogger } from '../../../types';
import { PurchaseManager } from './purchase-manager';
import { UserManager } from './user-manager';

export class PlayBilling {
  private firestore: Firestore;
  private log: AuthLogger;
  private prefix: string;
  public purchaseManager: PurchaseManager;
  public userManager: UserManager;

  constructor() {
    const config = Container.get(AppConfig);
    this.log = Container.get(AuthLogger);

    // Initialize Google Play Developer API client
    const playAccountConfig = config.subscriptions.playApiServiceAccount;
    const authConfig: Auth.JWTOptions = {
      email: playAccountConfig.credentials.client_email,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
      ...(playAccountConfig.keyFilename
        ? { keyFile: playAccountConfig.keyFilename }
        : { key: playAccountConfig.credentials.private_key }),
    };
    const playDeveloperApiClient = google.androidpublisher({
      version: 'v3',
      auth: new Auth.JWT(authConfig),
    });
    this.prefix = `${config.authFirestore.prefix}iap-`;
    this.firestore = Container.get(AuthFirestore);
    const purchasesDbRef = this.purchaseDbRef();
    this.purchaseManager = new PurchaseManager(
      purchasesDbRef,
      playDeveloperApiClient
    );
    this.userManager = new UserManager(purchasesDbRef, this.purchaseManager);
  }

  purchaseDbRef() {
    return this.firestore.collection(`${this.prefix}play-purchases`);
  }
}
