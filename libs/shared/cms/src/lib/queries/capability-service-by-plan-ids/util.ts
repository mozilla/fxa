/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CapabilityServiceByPlanIdsResult,
  CapabilityOfferingResult,
  CapabilityPurchaseResult,
} from './types';

export class CapabilityServiceByPlanIdsResultUtil {
  private purchaseByPlanId: Record<string, CapabilityPurchaseResult> = {};

  constructor(rawResults: CapabilityServiceByPlanIdsResult[]) {
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

  capabilityOfferingForPlanId(
    planId: string
  ): CapabilityOfferingResult | undefined {
    return this.purchaseByPlanId[planId]?.offering.data.attributes;
  }
}
