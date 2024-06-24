/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CapabilityServiceByPlanIdsQueryFactory } from './factories';
import { CapabilityServiceByPlanIdsResult } from './types';
import { CapabilityServiceByPlanIdsResultUtil } from './util';

describe('CapabilityServiceByPlanIdsResultUtil', () => {
  it('should create a util from response', () => {
    const result = CapabilityServiceByPlanIdsQueryFactory();
    const purchase = result.purchaseCollection?.items[0];
    const planId = purchase?.stripePlanChoices?.[0];
    const legacyPlanId = purchase?.offering?.stripeLegacyPlans?.[0];
    const result2 = CapabilityServiceByPlanIdsQueryFactory();
    const util = new CapabilityServiceByPlanIdsResultUtil([
      result as CapabilityServiceByPlanIdsResult,
      result2 as CapabilityServiceByPlanIdsResult,
    ]);

    expect(util).toBeDefined();
    expect(
      util.capabilityOfferingForPlanId(planId ?? '')?.capabilitiesCollection
    ).toBeDefined();
    expect(
      util.capabilityOfferingForPlanId(legacyPlanId ?? '')?.stripeLegacyPlans
    ).toBeDefined();
  });
});
