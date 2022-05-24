/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Module } from '@nestjs/common';
import { MetricsFactory } from 'fxa-shared/nestjs/metrics.service';
import {
  AppStoreHelperService,
  AppStorePurchaseManagerService,
  AppStoreService,
} from './appstore.service';
import { FirestoreFactory } from './firestore.service';
import {
  PlayStorePurchaseManagerService,
  PlayStoreService,
  PlayStoreUserManagerService,
} from './playstore.service';
import {
  StripeFactory,
  StripeFirestoreService,
  StripePaymentConfigManagerService,
  StripeService,
} from './stripe.service';
import { SubscriptionsService } from './subscriptions.service';

@Module({
  providers: [
    SubscriptionsService,
    MetricsFactory,
    FirestoreFactory,
    StripeFactory,
    AppStoreService,
    AppStoreHelperService,
    AppStorePurchaseManagerService,
    PlayStoreService,
    PlayStoreUserManagerService,
    PlayStorePurchaseManagerService,
    StripeService,
    StripeFirestoreService,
    StripePaymentConfigManagerService,
  ],
  exports: [SubscriptionsService],
})
export class SubscriptionModule {}
