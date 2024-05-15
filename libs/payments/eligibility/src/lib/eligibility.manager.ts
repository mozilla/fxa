/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import {
  StripeManager,
  StripePlan,
  SubplatInterval,
} from '@fxa/payments/stripe';
import {
  ContentfulManager,
  EligibilityContentOfferingResult,
} from '@fxa/shared/contentful';

import {
  EligibilityStatus,
  IntervalComparison,
  OfferingComparison,
  OfferingOverlapProductResult,
  OfferingOverlapResult,
} from './eligibility.types';
import { intervalComparison, offeringComparison } from './utils';

@Injectable()
export class EligibilityManager {
  constructor(
    private contentfulManager: ContentfulManager,
    private stripeManager: StripeManager
  ) {}

  /**
   * Determine what existing planIds or Offerings a user has overlap with
   * a desired target plan and what the comparison is to the target plan.
   *
   * @returns Array of overlapping planIds/offeringProductIds and their comparison
   *          to the target plan.
   */
  async getOfferingOverlap(
    planIds: string[],
    offeringStripeProductIds: string[],
    targetPlanId: string
  ): Promise<OfferingOverlapResult[]> {
    if (!planIds.length && !offeringStripeProductIds.length) return [];

    const detailsResult =
      await this.contentfulManager.getPurchaseDetailsForEligibility([
        ...planIds,
        targetPlanId,
      ]);

    const result: OfferingOverlapResult[] = [];

    const targetOffering = detailsResult.offeringForPlanId(targetPlanId);
    if (!targetOffering) return [];

    for (const offeringProductId of offeringStripeProductIds) {
      const comparison = offeringComparison(offeringProductId, targetOffering);
      if (comparison)
        result.push({ comparison, offeringProductId, type: 'offering' });
    }

    for (const planId of planIds) {
      const fromOffering = detailsResult.offeringForPlanId(planId);
      if (!fromOffering) continue;
      const comparison = offeringComparison(
        fromOffering.stripeProductId,
        targetOffering
      );
      if (comparison) result.push({ comparison, planId, type: 'plan' });
    }
    return result;
  }

  /**
   * Determine what existing offering a user has overlap with
   * a desired target plan and what the comparison is to the target plan.
   *
   * @returns Array of overlapping offeringProductIds and their comparison
   *          to the target plan.
   */
  getProductIdOverlap(
    offeringStripeProductIds: string[],
    targetOffering: EligibilityContentOfferingResult
  ): OfferingOverlapProductResult[] {
    if (!offeringStripeProductIds.length || !targetOffering) return [];

    const result: OfferingOverlapProductResult[] = [];

    for (const offeringProductId of offeringStripeProductIds) {
      const comparison = offeringComparison(offeringProductId, targetOffering);
      if (comparison)
        result.push({ comparison, offeringProductId, type: 'offering' });
    }
    return result;
  }

  async compareOverlap(
    overlaps: OfferingOverlapProductResult[],
    targetOffering: EligibilityContentOfferingResult,
    interval: SubplatInterval,
    subscribedPlans: StripePlan[]
  ) {
    if (!overlaps.length) {
      return EligibilityStatus.CREATE;
    }

    // Multiple existing overlapping plans, we can't merge them
    if (overlaps.length > 1) {
      return EligibilityStatus.INVALID;
    }

    const overlap = overlaps[0];
    if (overlap.comparison === OfferingComparison.DOWNGRADE)
      return EligibilityStatus.DOWNGRADE;

    const targetPlanIds = targetOffering.defaultPurchase.stripePlanChoices;
    const targetPlan = await this.stripeManager.getPlanByInterval(
      targetPlanIds,
      interval
    );

    if (targetPlan) {
      const subscribedPlanWithSameProductIdAsTarget = subscribedPlans.find(
        (plan) => plan.product === overlap.offeringProductId
      );

      if (
        !subscribedPlanWithSameProductIdAsTarget ||
        subscribedPlanWithSameProductIdAsTarget.id === targetPlan.id
      )
        return EligibilityStatus.INVALID;

      const intervalComparisonResult = intervalComparison(
        {
          unit: subscribedPlanWithSameProductIdAsTarget.interval,
          count: subscribedPlanWithSameProductIdAsTarget.interval_count,
        },
        { unit: targetPlan.interval, count: targetPlan.interval_count }
      );
      // Any interval change that is lower than the existing plans interval is
      // a downgrade. Otherwise its considered an upgrade.
      if (intervalComparisonResult === IntervalComparison.SHORTER)
        return EligibilityStatus.DOWNGRADE;

      if (
        overlap.comparison === OfferingComparison.UPGRADE ||
        intervalComparisonResult === IntervalComparison.LONGER
      )
        return EligibilityStatus.UPGRADE;
    }

    return EligibilityStatus.INVALID;
  }
}
