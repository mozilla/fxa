/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CapabilityServiceByPlanIdsQueryFactory } from './factories';
import { CapabilityServiceByPlanIdsResult } from './types';
import { CapabilityServiceByPlanIdsResultUtil } from './util';

describe('CapabilityServiceByPlanIdsResultUtil', () => {
  it('should create a util from response', () => {
    const result = CapabilityServiceByPlanIdsQueryFactory();
    const planId = result.purchaseCollection?.items[0]?.stripePlanChoices?.[0];
    const util = new CapabilityServiceByPlanIdsResultUtil(
      result as CapabilityServiceByPlanIdsResult
    );
    expect(util).toBeDefined();
    expect(
      util.capabilityOfferingForPlanId(planId ?? '')?.capabilitiesCollection
    ).toBeDefined();
    expect(util.purchaseCollection.items.length).toBe(1);
  });
});
