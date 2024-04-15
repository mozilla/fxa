/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import assert from 'assert';

import { StripeManager, StripePlan } from '@fxa/payments/stripe';
import {
  ContentfulManager,
  EligibilityContentOfferingResult,
} from '@fxa/shared/contentful';
import { CartEligibilityStatus, CartState } from '@fxa/shared/db/mysql/account';

import {
  IntervalComparison,
  OfferingComparison,
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
  async getProductIdOverlap(
    offeringStripeProductIds: string[],
    targetOffering: EligibilityContentOfferingResult
  ): Promise<OfferingOverlapResult[]> {
    if (!offeringStripeProductIds.length) return [];

    const result: OfferingOverlapResult[] = [];

    for (const offeringProductId of offeringStripeProductIds) {
      const comparison = offeringComparison(offeringProductId, targetOffering);
      if (comparison)
        result.push({ comparison, offeringProductId, type: 'offering' });
    }
    return result;
  }

  async compareOverlap(
    overlaps: OfferingOverlapResult[],
    targetPlanIds: string[],
    interval: string,
    subscribedPlans: StripePlan[]
  ) {
    if (!overlaps.length) {
      return {
        eligibilityStatus: CartEligibilityStatus.CREATE,
        state: CartState.START,
      };
    }

    // Multiple existing overlapping plans, we can't merge them
    if (overlaps.length > 1) {
      return {
        eligibilityStatus: CartEligibilityStatus.INVALID,
        state: CartState.FAIL,
      };
    }

    const overlap = overlaps[0];
    assert(
      overlap.type === 'offering',
      'Unexpected overlap type, only products are compared.'
    );

    const targetPlan = await this.stripeManager.getPlanByInterval(
      targetPlanIds,
      interval
    );
    const subscribedPlanWithSameProductIdAsTarget = subscribedPlans.find(
      (plan) => plan.product === overlap.offeringProductId
    );

    if (overlap.comparison === OfferingComparison.DOWNGRADE)
      return {
        eligibilityStatus: CartEligibilityStatus.DOWNGRADE,
        state: CartState.FAIL,
      };

    if (
      !subscribedPlanWithSameProductIdAsTarget ||
      subscribedPlanWithSameProductIdAsTarget.id === targetPlan.id
    )
      return {
        eligibilityStatus: CartEligibilityStatus.INVALID,
        state: CartState.FAIL,
      };

    // Any interval change that is lower than the existing plans interval is
    // a downgrade. Otherwise its considered an upgrade.
    if (
      intervalComparison(
        {
          unit: subscribedPlanWithSameProductIdAsTarget.interval,
          count: subscribedPlanWithSameProductIdAsTarget.interval_count,
        },
        { unit: targetPlan.interval, count: targetPlan.interval_count }
      ) === IntervalComparison.SHORTER
    )
      return {
        eligibilityStatus: CartEligibilityStatus.DOWNGRADE,
        state: CartState.FAIL,
      };

    if (
      overlap.comparison === OfferingComparison.UPGRADE ||
      intervalComparison(
        {
          unit: subscribedPlanWithSameProductIdAsTarget.interval,
          count: subscribedPlanWithSameProductIdAsTarget.interval_count,
        },
        { unit: targetPlan.interval, count: targetPlan.interval_count }
      ) === IntervalComparison.LONGER
    )
      return {
        eligibilityStatus: CartEligibilityStatus.UPGRADE,
        state: CartState.START,
      };

    return {
      eligibilityStatus: CartEligibilityStatus.INVALID,
      state: CartState.FAIL,
    };
  }
}
