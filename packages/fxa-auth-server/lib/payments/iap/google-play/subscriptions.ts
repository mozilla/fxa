/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { MozillaSubscriptionTypes } from 'fxa-shared/subscriptions/types';
import Container from 'typedi';

import error from '../../../../lib/error';
import { AppConfig } from '../../../types';
import { StripeHelper } from '../../stripe';
import { SubscriptionsService } from '../types';
import { PlayBilling } from './play-billing';
import { AppendedPlayStoreSubscriptionPurchase } from './types';

export class PlaySubscriptions
  implements SubscriptionsService<AppendedPlayStoreSubscriptionPurchase>
{
  private playBilling?: PlayBilling;
  private stripeHelper?: StripeHelper;

  constructor() {
    const config = Container.get(AppConfig);
    if (!config.subscriptions.enabled) {
      throw error.internalValidationError(
        'PlaySubscriptions',
        {},
        new Error(
          'Trying to instantiate PlaySubscriptions while subscriptions are disabled.  Check your dependency graph.'
        )
      );
    }

    if (!Container.has(StripeHelper)) {
      throw error.internalValidationError(
        'PlaySubscriptions',
        {},
        new Error(
          "Trying to instantiate PlaySubscriptions when there's no Stripe Helper.  Check your dependency graph."
        )
      );
    }

    this.stripeHelper = Container.get(StripeHelper);

    if (Container.has(PlayBilling)) {
      this.playBilling = Container.get(PlayBilling);
    }
  }

  /**
   * Gets all active Google Play subscriptions for the given user id
   */
  async getSubscriptions(
    uid: string
  ): Promise<AppendedPlayStoreSubscriptionPurchase[]> {
    if (!this.playBilling || !this.stripeHelper) {
      return [];
    }
    const allPurchases =
      await this.playBilling.userManager.queryCurrentSubscriptions(uid);
    const purchases = allPurchases.filter((purchase) =>
      purchase.isEntitlementActive()
    );
    return this.stripeHelper.addPriceInfoToIapPurchases(
      purchases,
      MozillaSubscriptionTypes.IAP_GOOGLE
    );
  }
}
