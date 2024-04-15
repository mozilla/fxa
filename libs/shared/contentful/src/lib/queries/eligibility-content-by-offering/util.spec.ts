/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  EligibilityContentByOfferingQueryFactory,
  EligibilityContentByOfferingResult,
  EligibilityOfferingResultFactory,
  EligibilityContentByOfferingResultUtil,
} from '.';

describe('EligibilityByOfferingResultUtil', () => {
  it('should create a util from response', () => {
    const result = EligibilityContentByOfferingQueryFactory();
    const util = new EligibilityContentByOfferingResultUtil(
      result as EligibilityContentByOfferingResult
    );
    expect(util).toBeDefined();
    expect(util.getOffering()).toBeDefined();
    expect(util.offeringCollection.items.length).toBe(1);
  });

  it('throws error if more than offering is returned', () => {
    const items = [
      EligibilityOfferingResultFactory(),
      EligibilityOfferingResultFactory(),
    ];
    const result = EligibilityContentByOfferingQueryFactory({
      offeringCollection: { items },
    });
    const util = new EligibilityContentByOfferingResultUtil(
      result as EligibilityContentByOfferingResult
    );
    expect(util).toBeDefined();
    expect(() => util.getOffering()).toThrowError(
      'getOffering - More than one offering'
    );
  });
});
