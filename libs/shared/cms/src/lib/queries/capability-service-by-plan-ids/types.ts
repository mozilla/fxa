/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StrapiEntity } from '../../types';

export interface CapabilityServicesResult {
  oauthClientId: string;
}

export interface CapabilityCapabilitiesResult {
  slug: string;
  services: {
    data: StrapiEntity<CapabilityServicesResult>[];
  };
}

export interface CapabilityOfferingResult {
  stripeLegacyPlans: {
    stripeLegacyPlan: string;
  }[];
  capabilities: {
    data: StrapiEntity<CapabilityCapabilitiesResult>[];
  };
}

export interface CapabilityPurchaseResult {
  stripePlanChoices: {
    stripePlanChoice: string;
  }[];
  offering: {
    data: StrapiEntity<CapabilityOfferingResult>;
  };
}

export interface CapabilityServiceByPlanIdsResult {
  purchases: {
    meta: {
      pagination: {
        total: number;
      };
    };
    data: StrapiEntity<CapabilityPurchaseResult>[];
  };
}
