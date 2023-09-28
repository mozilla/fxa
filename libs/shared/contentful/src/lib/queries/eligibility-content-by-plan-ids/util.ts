/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  EligibilityContentByPlanIdsResult,
  EligibilityOfferingResult,
  EligibilitySubgroupResult,
} from './types';

export class EligibilityContentByPlanIdsResultUtil {
  constructor(private rawResult: EligibilityContentByPlanIdsResult) {}

  getOfferingForPlanId(planId: string): EligibilityOfferingResult | undefined {
    return this.rawResult.purchaseCollection.items.find((purchase) =>
      purchase.stripePlanChoices.includes(planId)
    )?.offering;
  }

  getSubgroupsForPlanId(planId: string): EligibilitySubgroupResult[] {
    return (
      this.rawResult.purchaseCollection.items.find((purchase) =>
        purchase.stripePlanChoices.includes(planId)
      )?.offering.linkedFrom.subGroupCollection.items || []
    );
  }

  get purchaseCollection() {
    return this.rawResult.purchaseCollection;
  }
}
