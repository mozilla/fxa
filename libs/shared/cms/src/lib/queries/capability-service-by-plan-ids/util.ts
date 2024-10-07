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

  constructor(rawResult: CapabilityServiceByPlanIdsResult) {
    for (const purchase of rawResult.purchases) {
      for (const stripePlanChoice of purchase.stripePlanChoices ?? []) {
        this.purchaseByPlanId[stripePlanChoice.stripePlanChoice] = purchase;
      }

      for (const stripeLegacyPlan of purchase.offering.stripeLegacyPlans ??
        []) {
        this.purchaseByPlanId[stripeLegacyPlan.stripeLegacyPlan] = purchase;
      }
    }
  }

  capabilityOfferingForPlanId(
    planId: string
  ): CapabilityOfferingResult | undefined {
    return this.purchaseByPlanId[planId]?.offering;
  }
}
