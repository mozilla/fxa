/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { SubscriptionManager, SubplatInterval } from '@fxa/payments/customer';
import { ProductConfigurationManager } from '@fxa/shared/cms';
import { EligibilityManager } from './eligibility.manager';
import { EligibilityStatus } from './eligibility.types';

@Injectable()
export class EligibilityService {
  constructor(
    private productConfigurationManager: ProductConfigurationManager,
    private eligibilityManager: EligibilityManager,
    private subscriptionManager: SubscriptionManager
  ) {}

  /**
   * Checks if user is eligible to subscribe to price
   */
  async checkEligibility(
    interval: SubplatInterval,
    offeringConfigId: string,
    stripeCustomerId?: string | null | undefined
  ) {
    if (!stripeCustomerId) {
      return EligibilityStatus.CREATE;
    }

    const targetOfferingResult =
      await this.productConfigurationManager.getEligibilityContentByOffering(
        offeringConfigId
      );

    const targetOffering = targetOfferingResult.getOffering();

    const subscriptions = await this.subscriptionManager.listForCustomer(
      stripeCustomerId
    );

    const subscribedPrices = subscriptions
      .flatMap((subscription) => subscription.items.data)
      .map((item) => item.price);

    const productIds = subscribedPrices.map((price) => price.product);

    const overlaps = this.eligibilityManager.getProductIdOverlap(
      productIds,
      targetOffering
    );

    const eligibility = await this.eligibilityManager.compareOverlap(
      overlaps,
      targetOffering,
      interval,
      subscribedPrices
    );

    return eligibility;
  }
}
