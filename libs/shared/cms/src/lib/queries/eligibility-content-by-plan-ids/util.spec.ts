/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  EligibilityContentByPlanIdsQueryFactory,
  EligibilityContentByPlanIdsResult,
  EligibilityContentByPlanIdsResultUtil,
} from '.';

describe('EligibilityContentByPlanIdsResultUtil', () => {
  it('should create a util from response', () => {
    const result = EligibilityContentByPlanIdsQueryFactory();
    const purchase = result.purchaseCollection?.items[0];
    const planId = purchase?.stripePlanChoices?.[0];
    const legacyPlanId = purchase?.offering?.stripeLegacyPlans?.[0];
    const util = new EligibilityContentByPlanIdsResultUtil([
      result as EligibilityContentByPlanIdsResult,
    ]);
    expect(util).toBeDefined();
    expect(util.offeringForPlanId(planId ?? '')?.stripeProductId).toBeDefined();
    expect(
      util.offeringForPlanId(legacyPlanId ?? '')?.stripeProductId
    ).toBeDefined();
    expect(util.purchaseCollection.items.length).toBe(1);
  });
});
