/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StrapiEntity } from '../../types';

export interface EligibilitySubgroupOfferingResult {
  stripeProductId: string;
  stripeLegacyPlans: {
    stripeLegacyPlan: string;
  }[];
  countries: string[];
}

export interface EligibilitySubgroupResult {
  groupName: string;
  offerings: {
    data: StrapiEntity<EligibilitySubgroupOfferingResult>[];
  };
}

export interface EligibilityOfferingResult {
  stripeProductId: string;
  stripeLegacyPlans: {
    stripeLegacyPlan: string;
  }[];
  countries: string[];
  subGroups: {
    data: StrapiEntity<EligibilitySubgroupResult>[];
  };
}

export interface EligibilityPurchaseResult {
  stripePlanChoices: {
    stripePlanChoice: string;
  }[];
  offering: {
    data: StrapiEntity<EligibilityOfferingResult>;
  };
}

export interface EligibilityContentByPlanIdsResult {
  purchases: {
    meta: {
      pagination: {
        total: number;
      };
    };
    data: StrapiEntity<EligibilityPurchaseResult>[];
  };
}
