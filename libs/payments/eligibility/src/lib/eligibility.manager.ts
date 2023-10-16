/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  ContentfulManager,
  EligibilityOfferingResult,
} from '@fxa/shared/contentful';
import { Injectable } from '@nestjs/common';

import { OfferingComparison, OfferingOverlapResult } from './eligibility.types';

@Injectable()
export class EligibilityManager {
  constructor(private contentfulManager: ContentfulManager) {}

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
      if (comparison) result.push({ comparison, offeringProductId });
    }

    for (const planId of planIds) {
      const fromOffering = detailsResult.offeringForPlanId(planId);
      if (!fromOffering) continue;
      const comparison = offeringComparison(
        fromOffering.stripeProductId,
        targetOffering
      );
      if (comparison) result.push({ comparison, planId });
    }
    return result;
  }
}

/**
 * Returns whether the target offering overlaps, and how.
 *
 * @returns OfferingComparison if there's overlap, null otherwise.
 */
function offeringComparison(
  fromOfferingProductId: string,
  targetOffering: EligibilityOfferingResult
) {
  if (targetOffering.stripeProductId === fromOfferingProductId)
    return OfferingComparison.SAME;
  const commonSubgroups =
    targetOffering.linkedFrom.subGroupCollection.items.filter(
      (subgroup) =>
        !!subgroup.offeringCollection.items.find(
          (oc) => oc.stripeProductId === fromOfferingProductId
        )
    );
  if (!commonSubgroups.length) return null;
  const subgroupProductIds = commonSubgroups[0].offeringCollection.items.map(
    (o) => o.stripeProductId
  );
  const existingIndex = subgroupProductIds.indexOf(fromOfferingProductId);
  const targetIndex = subgroupProductIds.indexOf(
    targetOffering.stripeProductId
  );
  switch (targetIndex - existingIndex) {
    case 0:
      return OfferingComparison.SAME;
    case 1:
      return OfferingComparison.UPGRADE;
    default:
      return OfferingComparison.DOWNGRADE;
  }
}
