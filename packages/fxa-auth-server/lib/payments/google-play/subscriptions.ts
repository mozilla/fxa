/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Container from 'typedi';
import { internalValidationError } from '../../../lib/error';
import { PlayBilling } from './play-billing';
import { AbbrevPlayPurchase } from 'fxa-shared/subscriptions/types';
import { SubscriptionPurchase } from './subscription-purchase';
import { ConfigType } from '../../../config';

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
  implements SubscriptionsService<AbbrevPlayPurchase>
{
  private playBilling?: PlayBilling;

  constructor(config: ConfigType) {
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
  }

  async getSubscriptions(uid: string) {
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
}
