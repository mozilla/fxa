/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { Firestore } from '@google-cloud/firestore';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PurchaseManager } from 'fxa-shared/payments/iap/google-play/purchase-manager';
import { UserManager } from 'fxa-shared/payments/iap/google-play/user-manager';
import { Auth, google } from 'googleapis';
import { FirestoreService } from '../backend/firestore.service';

/**
 * Extends PurchaseManager to be service like
 */
@Injectable()
export class PlayStorePurchaseManagerService extends PurchaseManager {
  constructor(
    configService: ConfigService,
    @Inject(FirestoreService) firestore: Firestore,
    @Inject(LOGGER_PROVIDER) logger: LoggerService
  ) {
    const prefix = `${configService.get('authFirestore.prefix')}iap-`;
    const purchasesDbRef = firestore.collection(`${prefix}play-purchases`);

    // Setup play store api client
    const playAccountConfig = configService.get(
      'subscriptions.playApiServiceAccount'
    );
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

    super(purchasesDbRef, playDeveloperApiClient, logger as any);
  }
}

/**
 * Extends UserManager to be service like
 */
@Injectable()
export class PlayStoreUserManagerService extends UserManager {
  constructor(
    configService: ConfigService,
    @Inject(LOGGER_PROVIDER) logger: LoggerService,
    purchaseManager: PlayStorePurchaseManagerService,
    @Inject(FirestoreService) firestore: Firestore
  ) {
    const prefix = `${configService.get('authFirestore.prefix')}iap-`;
    const purchasesDbRef = firestore.collection(`${prefix}play-purchases`);

    super(purchasesDbRef, purchaseManager, logger as any);
  }
}

/**
 * Provides access to Google play store data
 */
@Injectable()
export class PlayStoreService {
  /**
   * Creates new instance
   * @param purchaseManager - a purchase manager
   * @param userManager - a user manager
   */
  constructor(
    protected readonly purchaseManager: PlayStorePurchaseManagerService,
    protected readonly userManager: PlayStoreUserManagerService
  ) {
    // Create user & purchase manager
    this.purchaseManager = purchaseManager;
    this.userManager = userManager;
  }

  /**
   * Retrieves a list of known subscription purchases for the customer.
   * @param uid - target customer account id
   * @returns list of subscription purchases
   */
  async getSubscriptions(uid: string) {
    return await this.userManager.queryCurrentSubscriptions(uid);
  }
}
