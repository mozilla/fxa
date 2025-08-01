/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  ProductNameByPriceIdsResult,
  ProductNamePurchaseResult,
} from './types';

export class ProductNameByPriceIdsResultUtil {
  private result: Record<string, string> = {};

  constructor(private rawResult: ProductNameByPriceIdsResult) {
    for (const purchase of rawResult.purchases) {
      const productName = purchase.purchaseDetails.productName;

      for (const price of purchase.stripePlanChoices || []) {
        this.result[price.stripePlanChoice] = productName;
      }

      for (const legacy of purchase.offering?.stripeLegacyPlans || []) {
        this.result[legacy.stripeLegacyPlan] = productName;
      }
    }
  }

  productNameForPriceId(priceId: string): string | undefined {
    return this.result[priceId];
  }

  get purchases(): ProductNamePurchaseResult[] {
    return this.rawResult.purchases;
  }
}
