/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { Firestore } from '@google-cloud/firestore';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppStoreHelper } from 'fxa-shared/payments/iap/apple-app-store/app-store-helper';
import { PurchaseManager } from 'fxa-shared/payments/iap/apple-app-store/purchase-manager';
import { FirestoreService } from '../backend/firestore.service';
import { AppConfig } from '../config';

/**
 * Extends AppStoreHelper to be service like
 */
@Injectable()
export class AppStoreHelperService extends AppStoreHelper {
  constructor(
    configService: ConfigService,
    @Inject(LOGGER_PROVIDER) logger: MozLoggerService
  ) {
    const config = { subscriptions: configService.get('subscriptions') };
    super(config, logger);
  }
}

/**
 * Extends PurchaseManager to be service like
 */
@Injectable()
export class AppStorePurchaseManagerService extends PurchaseManager {
  constructor(
    appStoreHelper: AppStoreHelperService,
    configService: ConfigService<AppConfig>,
    @Inject(LOGGER_PROVIDER) logger: MozLoggerService,
    @Inject(FirestoreService) firestore: Firestore
  ) {
    const config = {
      authFirestore: configService.get('authFirestore'),
    };
    const prefix = `${config.authFirestore.prefix}iap-`;
    const purchasesDbRef = firestore.collection(`${prefix}app-store-purchases`);
    super(purchasesDbRef, appStoreHelper, logger);
  }
}

/**
 * Provides access to AppStore data
 */
@Injectable()
export class AppStoreService {
  /**
   * Create new instance
   * @param configService - application's config
   * @param logger - application's logger
   * @param firestore - firestore reference backing data queried from app store api
   */
  constructor(
    protected readonly purchaseManager: AppStorePurchaseManagerService
  ) {}

  /**
   * Retrieves a list of known subscription purchases for the customer.
   * @param uid - target customer account id
   * @returns list of subscription purchases
   */
  async getSubscriptions(uid: string) {
    return await this.purchaseManager.queryCurrentSubscriptionPurchases(uid);
  }
}
