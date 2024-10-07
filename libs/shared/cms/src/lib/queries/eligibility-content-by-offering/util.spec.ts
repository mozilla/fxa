/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  EligibilityContentByOfferingQueryFactory,
  EligibilityContentByOfferingResult,
  EligibilityContentByOfferingResultUtil,
  EligibilityContentOfferingResultFactory,
} from '.';

describe('EligibilityByOfferingResultUtil', () => {
  it('should create a util from response', () => {
    const result = EligibilityContentByOfferingQueryFactory();
    const util = new EligibilityContentByOfferingResultUtil(
      result as EligibilityContentByOfferingResult
    );
    expect(util).toBeDefined();
    expect(util.getOffering()).toBeDefined();
    expect(util.offerings).toHaveLength(1);
  });

  it('returns empty if no offering is returned', () => {
    const result = EligibilityContentByOfferingQueryFactory({
      offerings: [],
    });
    const util = new EligibilityContentByOfferingResultUtil(
      result as EligibilityContentByOfferingResult
    );
    expect(() => util.getOffering()).toThrowError(
      'getOffering - No offering exists'
    );
  });

  it('throws error if more than offering is returned', () => {
    const offerings = [
      EligibilityContentOfferingResultFactory(),
      EligibilityContentOfferingResultFactory(),
    ];
    const result = EligibilityContentByOfferingQueryFactory({
      offerings,
    });
    const util = new EligibilityContentByOfferingResultUtil(
      result as EligibilityContentByOfferingResult
    );
    expect(() => util.getOffering()).toThrowError(
      'getOffering - More than one offering'
    );
  });
});
