/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StrapiEntity } from '../../types';

export interface EligibilityContentSubgroupOfferingResult {
  apiIdentifier: string;
  stripeProductId: string;
  defaultPurchase: {
    data: StrapiEntity<{
      stripePlanChoices: {
        stripePlanChoice: string;
      }[];
    }>;
  };
}

export interface EligibilityContentSubgroupResult {
  groupName: string;
  offerings: {
    data: StrapiEntity<EligibilityContentSubgroupOfferingResult>[];
  };
}

export interface EligibilityContentOfferingResult {
  apiIdentifier: string;
  stripeProductId: string;
  defaultPurchase: {
    data: StrapiEntity<{
      stripePlanChoices: {
        stripePlanChoice: string;
      }[];
    }>;
  };
  subGroups: {
    data: StrapiEntity<EligibilityContentSubgroupResult>[];
  };
}
export interface EligibilityContentByOfferingResult {
  offerings: {
    data: StrapiEntity<EligibilityContentOfferingResult>[];
  };
}
