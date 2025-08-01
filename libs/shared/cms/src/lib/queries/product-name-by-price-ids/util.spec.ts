/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ProductNameByPriceIdsQueryFactory } from './factories';
import { ProductNameByPriceIdsResult } from './types';
import { ProductNameByPriceIdsResultUtil } from './util';

describe('ProductNameByPriceIdsResultUtil', () => {
  it('should create util from response', () => {
    const result = ProductNameByPriceIdsQueryFactory();
    const purchase = result.purchases[0];
    const planId = purchase?.stripePlanChoices?.[0];
    const legacyPlanId = purchase?.offering?.stripeLegacyPlans?.[0];
    const util = new ProductNameByPriceIdsResultUtil(
      result as ProductNameByPriceIdsResult
    );
    expect(util).toBeDefined();
    expect(
      util.productNameForPriceId(planId?.stripePlanChoice ?? '')
    ).toBeDefined();
    expect(
      util.productNameForPriceId(legacyPlanId?.stripeLegacyPlan ?? '')
    ).toBeDefined();
    expect(util.purchases.length).toBe(1);
  });
});
