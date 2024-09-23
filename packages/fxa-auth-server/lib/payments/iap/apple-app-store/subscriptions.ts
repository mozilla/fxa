/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { AppendedAppStoreSubscriptionPurchase } from 'fxa-shared/payments/iap/apple-app-store/types';
import { MozillaSubscriptionTypes } from 'fxa-shared/subscriptions/types';
import Container from 'typedi';

import error from '../../../../lib/error';
import { AppConfig } from '../../../types';
import { StripeHelper } from '../../stripe';
import { SubscriptionsService } from '../types';
import { AppleIAP } from './apple-iap';

export class AppStoreSubscriptions
  implements SubscriptionsService<AppendedAppStoreSubscriptionPurchase>
{
  private appleIap?: AppleIAP;
  private stripeHelper?: StripeHelper;

  constructor() {
    const config = Container.get(AppConfig);
    if (!config.subscriptions.enabled) {
      throw error.internalValidationError(
        'AppStoreSubscriptions',
        {},
        new Error(
          'Trying to instantiate AppStoreSubscriptions while subscriptions are disabled.  Check your dependency graph.'
        )
      );
    }

    if (!Container.has(StripeHelper)) {
      throw error.internalValidationError(
        'AppStoreSubscriptions',
        {},
        new Error(
          "Trying to instantiate AppStoreSubscriptions when there's no Stripe Helper.  Check your dependency graph."
        )
      );
    }

    this.stripeHelper = Container.get(StripeHelper);

    if (Container.has(AppleIAP)) {
      this.appleIap = Container.get(AppleIAP);
    }
  }

  /**
   * Gets all active App Store subscriptions for the given user id
   */
  async getSubscriptions(
    uid: string
  ): Promise<AppendedAppStoreSubscriptionPurchase[]> {
    if (!this.appleIap || !this.stripeHelper) {
      return [];
    }
    const allPurchases =
      await this.appleIap.purchaseManager.queryCurrentSubscriptionPurchases(
        uid
      );
    const purchases = allPurchases.filter((purchase) =>
      purchase.isEntitlementActive()
    );
    return this.stripeHelper.addPriceInfoToIapPurchases(
      purchases,
      MozillaSubscriptionTypes.IAP_APPLE
    );
  }
}
