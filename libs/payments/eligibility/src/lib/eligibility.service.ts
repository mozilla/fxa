/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { SubscriptionManager, SubplatInterval } from '@fxa/payments/customer';
import { ProductConfigurationManager } from '@fxa/shared/cms';
import { EligibilityManager } from './eligibility.manager';
import {
  EligibilityStatus,
  SubscriptionEligibilityResult,
} from './eligibility.types';

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
  ): Promise<SubscriptionEligibilityResult> {
    if (!stripeCustomerId) {
      return {
        subscriptionEligibilityResult: EligibilityStatus.CREATE,
      };
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

    const priceIds = subscribedPrices.map((price) => price.id);

    const overlaps = await this.eligibilityManager.getOfferingOverlap({
      priceIds,
      targetOffering,
    });

    const eligibility = await this.eligibilityManager.compareOverlap(
      overlaps,
      targetOffering,
      interval,
      subscribedPrices
    );

    return eligibility;
  }
}
