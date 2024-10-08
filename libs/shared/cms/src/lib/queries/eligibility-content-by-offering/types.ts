/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface EligibilityContentSubgroupOfferingResult {
  apiIdentifier: string;
  stripeProductId: string;
  defaultPurchase: {
    stripePlanChoices: {
      stripePlanChoice: string;
    }[];
  };
}

export interface EligibilityContentSubgroupResult {
  groupName: string;
  offerings: EligibilityContentSubgroupOfferingResult[];
}

export interface EligibilityContentOfferingResult {
  apiIdentifier: string;
  stripeProductId: string;
  defaultPurchase: {
    stripePlanChoices: {
      stripePlanChoice: string;
    }[];
  };
  subGroups: EligibilityContentSubgroupResult[];
}

export interface EligibilityContentByOfferingResult {
  offerings: EligibilityContentOfferingResult[];
}
