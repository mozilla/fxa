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

  constructor(private rawResult: CapabilityServiceByPlanIdsResult) {
    for (const purchase of rawResult.purchaseCollection.items) {
      for (const planId of purchase.stripePlanChoices) {
        this.purchaseByPlanId[planId] = purchase;
      }
    }
  }

  capabilityOfferingForPlanId(
    planId: string
  ): CapabilityOfferingResult | undefined {
    return this.purchaseByPlanId[planId]?.offering;
  }

  get purchaseCollection() {
    return this.rawResult.purchaseCollection;
  }
}
