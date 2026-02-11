/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  PageContentForOfferingQueryFactory,
  PageContentPurchaseDetailsResultFactory,
} from './factories';
import { PageContentForOfferingResult } from './types';
import { PageContentForOfferingResultUtil } from './util';

describe('PageContentForOfferingUtil', () => {
  it('should create a util from response', () => {
    const result = PageContentForOfferingQueryFactory();
    const util = new PageContentForOfferingResultUtil(
      result as PageContentForOfferingResult
    );
    expect(util).toBeDefined();
    expect(util.offerings).toHaveLength(1);
  });

  describe('transformPageContentPurchaseDetails', () => {
    let util: PageContentForOfferingResultUtil;

    beforeEach(() => {
      const result = PageContentForOfferingQueryFactory();
      util = new PageContentForOfferingResultUtil(
        result as PageContentForOfferingResult
      );
    });

    it('should transform details', () => {
      const testDetails = 'point 1\npoint 2\npoint 3';
      const expected = ['point 1', 'point 2', 'point 3'];
      const rawPurchaseDetails = PageContentPurchaseDetailsResultFactory({
        details: testDetails,
      });
      expect(util.purchaseDetailsTransform(rawPurchaseDetails).details).toEqual(
        expected
      );
    });

    it('should transform details and remove empty lines', () => {
      const testDetails = 'point 1\n\npoint 2\npoint 3\n';
      const expected = ['point 1', 'point 2', 'point 3'];
      const rawPurchaseDetails = PageContentPurchaseDetailsResultFactory({
        details: testDetails,
      });
      expect(util.purchaseDetailsTransform(rawPurchaseDetails).details).toEqual(
        expected
      );
    });
  });
});
