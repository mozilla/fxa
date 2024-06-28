/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  PurchaseDetailsResultFactory,
  PurchaseWithDetailsOfferingContentByPlanIdsResultFactory,
} from './factories';
import { PurchaseWithDetailsOfferingContentByPlanIdsResult } from './types';
import { PurchaseWithDetailsOfferingContentUtil } from './util';

describe('PurchaseWithDetailsOfferingContentUtil', () => {
  it('should create a util from response', () => {
    const result = PurchaseWithDetailsOfferingContentByPlanIdsResultFactory();
    const result2 = PurchaseWithDetailsOfferingContentByPlanIdsResultFactory();
    const purchase = result.purchaseCollection?.items[0];
    const planId = purchase.stripePlanChoices?.[0];
    const legacyPlanId = purchase.offering.stripeLegacyPlans?.[0];
    const util = new PurchaseWithDetailsOfferingContentUtil([
      result as PurchaseWithDetailsOfferingContentByPlanIdsResult,
      result2 as PurchaseWithDetailsOfferingContentByPlanIdsResult,
    ]);
    expect(util).toBeDefined();
    expect(
      util.transformedPurchaseWithCommonContentForPlanId(planId ?? '')?.offering
        .stripeProductId
    ).toBeDefined();
    expect(
      util.transformedPurchaseWithCommonContentForPlanId(legacyPlanId ?? '')
        ?.offering.stripeProductId
    ).toBeDefined();
    expect(util.purchaseCollection.items.length).toBe(2);
  });

  describe('transformPurchaseDetails', () => {
    let util: PurchaseWithDetailsOfferingContentUtil;
    beforeAll(() => {
      const result = PurchaseWithDetailsOfferingContentByPlanIdsResultFactory();
      util = new PurchaseWithDetailsOfferingContentUtil([
        result as PurchaseWithDetailsOfferingContentByPlanIdsResult,
      ]);
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
