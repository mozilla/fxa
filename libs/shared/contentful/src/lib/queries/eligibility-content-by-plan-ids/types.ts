/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface EligibilitySubgroupOfferingResult {
  stripeProductId: string;
  stripeLegacyPlans: string[] | null;
  countries: string[];
}

export interface EligibilitySubgroupResult {
  groupName: string;
  offeringCollection: {
    items: EligibilitySubgroupOfferingResult[];
  };
}

export interface EligibilityOfferingResult {
  stripeProductId: string;
  stripeLegacyPlans: string[] | null;
  countries: string[];
  linkedFrom: {
    subGroupCollection: {
      items: EligibilitySubgroupResult[];
    };
  };
}

export interface EligibilityPurchaseResult {
  stripePlanChoices: string[];
  offering: EligibilityOfferingResult;
}

export interface EligibilityContentByPlanIdsResult {
  purchaseCollection: {
    total: number;
    items: EligibilityPurchaseResult[];
  };
}
