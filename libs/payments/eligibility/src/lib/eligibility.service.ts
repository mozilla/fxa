/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import {
  getSubscribedPlans,
  getSubscribedProductIds,
  StripeManager,
} from '@fxa/payments/stripe';
import { ContentfulManager } from '@fxa/shared/contentful';
import { CartEligibilityStatus, CartState } from '@fxa/shared/db/mysql/account';
import { EligibilityManager } from './eligibility.manager';

@Injectable()
export class EligibilityService {
  constructor(
    private contentfulManager: ContentfulManager,
    private eligibilityManager: EligibilityManager,
    private stripeManager: StripeManager
  ) {}

  /**
   * Checks if user is eligible to subscribe to plan
   */
  async checkEligibility(
    interval: string,
    offeringConfigId: string,
    stripeCustomerId?: string | null
  ) {
    if (!stripeCustomerId) {
      return {
        eligibilityStatus: CartEligibilityStatus.CREATE,
        state: CartState.START,
      };
    }

    const targetOfferingResult =
      await this.contentfulManager.getEligibilityContentByOffering(
        offeringConfigId
      );

    const targetOffering = targetOfferingResult.getOffering();
    if (!targetOffering)
      return {
        eligibilityStatus: CartEligibilityStatus.INVALID,
        state: CartState.FAIL,
      };

    const targetPlanIds = targetOffering.defaultPurchase.stripePlanChoices;

    const subscriptions = await this.stripeManager.getSubscriptions(
      stripeCustomerId
    );

    const subscribedPlans = await getSubscribedPlans(subscriptions);

    const productIds = await getSubscribedProductIds(subscribedPlans);

    const overlaps = await this.eligibilityManager.getProductIdOverlap(
      productIds,
      targetOffering
    );

    const eligibility = await this.eligibilityManager.compareOverlap(
      overlaps,
      targetPlanIds,
      interval,
      subscribedPlans
    );

    return eligibility;
  }
}
