/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface CapabilityServicesResult {
  oauthClientId: string;
}

export interface CapabilityCapabilitiesResult {
  slug: string;
  servicesCollection: {
    items: CapabilityServicesResult[];
  };
}

export interface CapabilityOfferingResult {
  stripeLegacyPlans: string[] | null;
  capabilitiesCollection: {
    items: CapabilityCapabilitiesResult[];
  };
}

export interface CapabilityPurchaseResult {
  stripePlanChoices: string[];
  offering: CapabilityOfferingResult;
}

export interface CapabilityServiceByPlanIdsResult {
  purchaseCollection: {
    total: number;
    items: CapabilityPurchaseResult[];
  };
}
