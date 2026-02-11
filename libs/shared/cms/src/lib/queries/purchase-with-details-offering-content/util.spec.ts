/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  PurchaseDetailsResultFactory,
  PurchaseWithDetailsOfferingContentByPlanIdsResultFactory,
} from './factories';
import { PurchaseWithDetailsOfferingContentUtil } from './util';

describe('PurchaseWithDetailsOfferingContentUtil', () => {
  it('should create a util from response', () => {
    const result = PurchaseWithDetailsOfferingContentByPlanIdsResultFactory();
    const purchase = result.purchases[0];
    const planId = purchase.stripePlanChoices?.[0];
    const legacyPlanId = purchase.offering.stripeLegacyPlans?.[0];
    const util = new PurchaseWithDetailsOfferingContentUtil(result);
    expect(util).toBeDefined();
    expect(
      util.transformedPurchaseWithCommonContentForPlanId(
        planId.stripePlanChoice ?? ''
      )?.offering.stripeProductId
    ).toBeDefined();
    expect(
      util.transformedPurchaseWithCommonContentForPlanId(
        legacyPlanId.stripeLegacyPlan ?? ''
      )?.offering.stripeProductId
    ).toBeDefined();
    expect(util.purchases.length).toBe(1);
  });

  describe('transformPurchaseDetails', () => {
    let util: PurchaseWithDetailsOfferingContentUtil;
    beforeAll(() => {
      const result = PurchaseWithDetailsOfferingContentByPlanIdsResultFactory();
      util = new PurchaseWithDetailsOfferingContentUtil(result);
    });

    it('should transform details', () => {
      const testDetails = 'point 1\npoint 2\npoint 3';
      const expected = ['point 1', 'point 2', 'point 3'];
      const rawPurchaseDetails = PurchaseDetailsResultFactory({
        details: testDetails,
      });
      expect(util.purchaseDetailsTransform(rawPurchaseDetails).details).toEqual(
        expected
      );
    });

    it('should transform details and remove empty lines', () => {
      const testDetails = 'point 1\n\npoint 2\npoint 3\n';
      const expected = ['point 1', 'point 2', 'point 3'];
      const rawPurchaseDetails = PurchaseDetailsResultFactory({
        details: testDetails,
      });
      expect(util.purchaseDetailsTransform(rawPurchaseDetails).details).toEqual(
        expected
      );
    });
  });
});
