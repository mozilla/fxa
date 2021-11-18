/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  AbbrevPlayPurchase,
  GooglePlaySubscription,
  MozillaSubscriptionTypes,
} from 'fxa-shared/subscriptions/types';
import Container from 'typedi';

import { internalValidationError } from '../../../lib/error';
import { AppConfig } from '../../types';
import { StripeHelper } from '../stripe';
import { PlayBilling } from './play-billing';
import { SubscriptionPurchase } from './subscription-purchase';

// TODO move this when we add support for Apple IAP subscriptions
export interface SubscriptionsService<T> {
  getSubscriptions: (uid: string) => Promise<T[]>;
}

/**
 * Extract an AbbrevPlayPurchase from a SubscriptionPurchase
 */
export function abbrevPlayPurchaseFromSubscriptionPurchase(
  purchase: SubscriptionPurchase
): AbbrevPlayPurchase {
  return {
    auto_renewing: purchase.autoRenewing,
    expiry_time_millis: purchase.expiryTimeMillis,
    package_name: purchase.packageName,
    sku: purchase.sku,
    ...(purchase.cancelReason && { cancel_reason: purchase.cancelReason }),
  };
}

export class PlaySubscriptions
  implements SubscriptionsService<GooglePlaySubscription>
{
  private playBilling?: PlayBilling;
  private stripeHelper?: StripeHelper;

  constructor() {
    const config = Container.get(AppConfig);
    if (!config.subscriptions.enabled) {
      throw internalValidationError(
        'PlaySubscriptions',
        {},
        new Error(
          'Trying to new up PlaySubscriptions while subscriptions are disabled.  Check your dependency graph.'
        )
      );
    }

    if (Container.has(PlayBilling)) {
      this.playBilling = Container.get(PlayBilling);
    }

    // Since config.subscriptions.enabled is true here, StripeHelper will already exist.
    this.stripeHelper = Container.get(StripeHelper);
  }

  async getAbbrevPlayPurchases(uid: string) {
    if (!this.playBilling) {
      return [];
    }

    const allPurchases =
      await this.playBilling.userManager.queryCurrentSubscriptions(uid);
    const purchases = allPurchases.filter((purchase) =>
      purchase.isEntitlementActive()
    );

    return purchases.map(abbrevPlayPurchaseFromSubscriptionPurchase);
  }

  /**
   * Gets all active Google Play subscriptions for the given user id
   */
  async getSubscriptions(uid: string): Promise<GooglePlaySubscription[]> {
    if (!this.stripeHelper) {
      return [];
    }
    const iapSubscribedGooglePlayAbbrevPlayPurchases =
      await this.getAbbrevPlayPurchases(uid);
    const iapAbbrevPlayPurchasesWithStripeProductData =
      await this.stripeHelper.addProductInfoToAbbrevPlayPurchases(
        iapSubscribedGooglePlayAbbrevPlayPurchases
      );
    return iapAbbrevPlayPurchasesWithStripeProductData.map((purchase) => ({
      ...purchase,
      _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
    }));
  }
}
