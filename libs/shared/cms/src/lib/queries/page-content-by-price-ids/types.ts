/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface PageContentByPriceIdsCommonContentResult {
  emailIcon: string;
  supportUrl: string;
}

export interface PageContentByPriceIdsStripeLegacyPlanResult {
  stripeLegacyPlan: string;
}

export interface PageContentByPriceIdsOfferingResult {
  stripeLegacyPlans: PageContentByPriceIdsStripeLegacyPlanResult[];
  commonContent: PageContentByPriceIdsCommonContentResult & {
    localizations: PageContentByPriceIdsCommonContentResult[];
  };
  apiIdentifier: string;
}

export interface PageContentByPriceIdsPurchaseDetailsResult {
  productName: string;
  webIcon: string;
}

export interface PageContentByPriceIdsStripePlanChoiceResult {
  stripePlanChoice: string;
}

export interface PageContentByPriceIdsPurchaseResult {
  offering: PageContentByPriceIdsOfferingResult;
  purchaseDetails: PageContentByPriceIdsPurchaseDetailsResult & {
    localizations: PageContentByPriceIdsPurchaseDetailsResult[];
  };
  stripePlanChoices: PageContentByPriceIdsStripePlanChoiceResult[];
}

export interface PageContentByPriceIdsResult {
  purchases: PageContentByPriceIdsPurchaseResult[];
}
