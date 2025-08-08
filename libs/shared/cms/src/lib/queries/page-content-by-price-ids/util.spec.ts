/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PageContentByPriceIdsQueryFactory } from './factories';
import { PageContentByPriceIdsResult } from './types';
import { PageContentByPriceIdsResultUtil } from './util';

describe('PageContentByPriceIdsResultUtil', () => {
  it('should create util from response', () => {
    const result = PageContentByPriceIdsQueryFactory();
    const purchase = result.purchases[0];
    const planId = purchase?.stripePlanChoices?.[0];
    const legacyPlanId = purchase?.offering?.stripeLegacyPlans?.[0];
    const util = new PageContentByPriceIdsResultUtil(
      result as PageContentByPriceIdsResult
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
