/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  PageContentByPriceIdsResult,
  PageContentByPriceIdsPurchaseResult,
} from './types';

export class PageContentByPriceIdsResultUtil {
  private result: Record<string, PageContentByPriceIdsPurchaseResult> = {};

  constructor(private rawResult: PageContentByPriceIdsResult) {
    for (const purchase of rawResult.purchases) {
      for (const price of purchase.stripePlanChoices || []) {
        this.result[price.stripePlanChoice] = purchase;
      }

      for (const legacy of purchase.offering?.stripeLegacyPlans || []) {
        this.result[legacy.stripeLegacyPlan] = purchase;
      }
    }
  }

  productNameForPriceId(priceId: string): string | undefined {
    return this.result[priceId].purchaseDetails.productName;
  }

  purchaseForPriceId(priceId: string) {
    return this.result[priceId];
  }

  get purchases(): PageContentByPriceIdsPurchaseResult[] {
    return this.rawResult.purchases;
  }
}
