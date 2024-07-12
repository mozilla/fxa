/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  EligibilityContentByPlanIdsResult,
  EligibilityOfferingResult,
  EligibilityPurchaseResult,
} from './types';

export class EligibilityContentByPlanIdsResultUtil {
  private purchaseByPlanId: Record<string, EligibilityPurchaseResult> = {};

  constructor(private rawResults: EligibilityContentByPlanIdsResult[]) {
    for (const rawResult of rawResults) {
      for (const purchase of rawResult.purchases.data) {
        purchase.attributes.stripePlanChoices?.forEach(
          ({ stripePlanChoice }) => {
            this.purchaseByPlanId[stripePlanChoice] = purchase.attributes;
          }
        );

        purchase.attributes.offering.data.attributes.stripeLegacyPlans?.forEach(
          ({ stripeLegacyPlan }) => {
            this.purchaseByPlanId[stripeLegacyPlan] = purchase.attributes;
          }
        );
      }
    }
  }

  offeringForPlanId(planId: string): EligibilityOfferingResult | undefined {
    return this.purchaseByPlanId[planId]?.offering.data.attributes;
  }

  get purchases(): EligibilityContentByPlanIdsResult['purchases'] {
    return {
      meta: {
        pagination: {
          total: this.rawResults
            .map((rawResult) => rawResult.purchases.meta.pagination.total)
            .reduce((acc, curr) => acc + curr, 0),
        },
      },
      data: [
        ...new Map(
          this.rawResults
            .map((rawResult) => rawResult.purchases.data)
            .flat()
            .map((res) => [JSON.stringify(res), res])
        ).values(),
      ],
    };
  }
}
