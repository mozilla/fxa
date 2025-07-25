/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface ProductNameStripeLegacyPlanResult {
  stripeLegacyPlan: string;
}

export interface ProductNameOfferingResult {
  stripeLegacyPlans: ProductNameStripeLegacyPlanResult[];
}

export interface ProductNamePurchaseDetailsResult {
  productName: string;
}

export interface ProductNameStripePlanChoiceResult {
  stripePlanChoice: string;
}

export interface ProductNamePurchaseResult {
  offering: ProductNameOfferingResult;
  purchaseDetails: ProductNamePurchaseDetailsResult;
  stripePlanChoices: ProductNameStripePlanChoiceResult[];
}

export interface ProductNameByPriceIdsResult {
  purchases: ProductNamePurchaseResult[];
}
