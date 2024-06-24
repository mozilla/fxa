/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import {
  PriceManager,
  StripePrice,
  SubplatInterval,
} from '@fxa/payments/stripe';
import {
  EligibilityContentOfferingResult,
  ProductConfigurationManager,
} from '@fxa/shared/cms';

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
    private productConfigurationManager: ProductConfigurationManager,
    private priceManager: PriceManager
  ) {}

  /**
   * Determine what existing priceIds or Offerings a user has overlap with
   * a desired target price and what the comparison is to the target price.
   *
   * @returns Array of overlapping priceIds/offeringProductIds and their comparison
   *          to the target price.
   */
  async getOfferingOverlap(
    priceIds: string[],
    offeringStripeProductIds: string[],
    targetPriceId: string
  ): Promise<OfferingOverlapResult[]> {
    if (!priceIds.length && !offeringStripeProductIds.length) return [];

    const detailsResult =
      await this.productConfigurationManager.getPurchaseDetailsForEligibility([
        ...priceIds,
        targetPriceId,
      ]);

    const result: OfferingOverlapResult[] = [];

    const targetOffering = detailsResult.offeringForPlanId(targetPriceId);
    if (!targetOffering) return [];

    for (const offeringProductId of offeringStripeProductIds) {
      const comparison = offeringComparison(offeringProductId, targetOffering);
      if (comparison)
        result.push({ comparison, offeringProductId, type: 'offering' });
    }

    for (const priceId of priceIds) {
      const fromOffering = detailsResult.offeringForPlanId(priceId);
      if (!fromOffering) continue;
      const comparison = offeringComparison(
        fromOffering.stripeProductId,
        targetOffering
      );
      if (comparison) result.push({ comparison, priceId, type: 'price' });
    }
    return result;
  }

  /**
   * Determine what existing offering a user has overlap with
   * a desired target price and what the comparison is to the target price.
   *
   * @returns Array of overlapping offeringProductIds and their comparison
   *          to the target price.
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
    subscribedPrices: StripePrice[]
  ) {
    if (!overlaps.length) {
      return EligibilityStatus.CREATE;
    }

    // Multiple existing overlapping prices, we can't merge them
    if (overlaps.length > 1) {
      return EligibilityStatus.INVALID;
    }

    const overlap = overlaps[0];
    if (overlap.comparison === OfferingComparison.DOWNGRADE)
      return EligibilityStatus.DOWNGRADE;

    const targetPriceIds = targetOffering.defaultPurchase.stripePlanChoices;
    const targetPrice = await this.priceManager.retrieveByInterval(
      targetPriceIds,
      interval
    );

    if (targetPrice) {
      const subscribedPriceWithSameProductIdAsTarget = subscribedPrices.find(
        (price) => price.product === overlap.offeringProductId
      );

      if (
        !subscribedPriceWithSameProductIdAsTarget ||
        !subscribedPriceWithSameProductIdAsTarget.recurring ||
        !targetPrice.recurring ||
        subscribedPriceWithSameProductIdAsTarget.id === targetPrice.id
      )
        return EligibilityStatus.INVALID;

      const intervalComparisonResult = intervalComparison(
        {
          unit: subscribedPriceWithSameProductIdAsTarget.recurring?.interval,
          count:
            subscribedPriceWithSameProductIdAsTarget.recurring?.interval_count,
        },
        {
          unit: targetPrice.recurring?.interval,
          count: targetPrice.recurring?.interval_count,
        }
      );
      // Any interval change that is lower than the existing price's interval is
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
