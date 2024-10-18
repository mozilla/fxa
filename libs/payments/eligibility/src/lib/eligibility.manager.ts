/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import { PriceManager, SubplatInterval } from '@fxa/payments/customer';
import { StripePrice } from '@fxa/payments/stripe';
import {
  EligibilityContentOfferingResult,
  ProductConfigurationManager,
} from '@fxa/shared/cms';

import {
  EligibilityStatus,
  IntervalComparison,
  OfferingComparison,
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
    targetPriceId: string
  ): Promise<OfferingOverlapResult[]> {
    if (!priceIds.length) return [];

    const detailsResult =
      await this.productConfigurationManager.getPurchaseDetailsForEligibility(
        Array.from(new Set([...priceIds, targetPriceId]))
      );

    const result: OfferingOverlapResult[] = [];

    const targetOffering = detailsResult.offeringForPlanId(targetPriceId);
    if (!targetOffering) return [];

    for (const priceId of priceIds) {
      const fromOffering = detailsResult.offeringForPlanId(priceId);
      if (!fromOffering) continue;

      const comparison = offeringComparison(
        fromOffering.apiIdentifier,
        targetOffering
      );
      if (comparison) result.push({ comparison, priceId });
    }
    return result;
  }

  async compareOverlap(
    overlaps: OfferingOverlapResult[],
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

    const targetPriceIds = targetOffering.defaultPurchase.stripePlanChoices.map(
      (el) => el.stripePlanChoice
    );
    const targetPrice = await this.priceManager.retrieveByInterval(
      targetPriceIds,
      interval
    );

    if (targetPrice) {
      const overlappingPrice = subscribedPrices.find(
        (price) => price.id === overlap.priceId
      );

      if (
        !overlappingPrice ||
        !overlappingPrice.recurring ||
        !targetPrice.recurring ||
        overlappingPrice.id === targetPrice.id
      )
        return EligibilityStatus.INVALID;

      const intervalComparisonResult = intervalComparison(
        {
          unit: overlappingPrice.recurring.interval,
          count: overlappingPrice.recurring.interval_count,
        },
        {
          unit: targetPrice.recurring.interval,
          count: targetPrice.recurring.interval_count,
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
