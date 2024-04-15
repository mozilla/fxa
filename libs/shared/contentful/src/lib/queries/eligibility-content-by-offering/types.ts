/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface EligibilityContentSubgroupOfferingResult {
  apiIdentifier: string;
  stripeProductId: string;
  stripeLegacyPlans: string[] | null;
  countries: string[];
}

export interface EligibilityContentSubgroupResult {
  groupName: string;
  offeringCollection: {
    items: EligibilityContentSubgroupOfferingResult[];
  };
}

export interface EligibilityContentOfferingResult {
  apiIdentifier: string;
  stripeProductId: string;
  stripeLegacyPlans: string[] | null;
  countries: string[];
  linkedFrom: {
    subGroupCollection: {
      items: EligibilityContentSubgroupResult[];
    };
  };
}
export interface EligibilityContentByOfferingResult {
  offeringCollection: {
    items: EligibilityContentOfferingResult[];
  };
}
