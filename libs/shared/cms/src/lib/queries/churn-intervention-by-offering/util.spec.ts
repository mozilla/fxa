/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  ChurnInterventionByOfferingRawResultFactory,
  ChurnInterventionByOfferingResultUtil,
} from '.';

describe('ChurnInterventionByOfferingResultUtil', () => {
  it('should create a util from response', () => {
    const result = ChurnInterventionByOfferingRawResultFactory();
    const util = new ChurnInterventionByOfferingResultUtil(result);
    expect(util).toBeDefined();
    expect(util.churnInterventionByOffering.offerings).toHaveLength(1);
  });

  describe('getTransformedChurnInterventionByOffering', () => {
    let util: ChurnInterventionByOfferingResultUtil;

    beforeEach(() => {
      const result = ChurnInterventionByOfferingRawResultFactory();
      util = new ChurnInterventionByOfferingResultUtil(result);
    });

    it('should transform churn intervention by offering', () => {
      const transformed = util.getTransformedChurnInterventionByOffering();
      expect(transformed).toBeDefined();
      expect(transformed?.webIcon).toBeDefined();
      expect(transformed?.supportUrl).toBeDefined();
      expect(transformed?.churnInterventionId).toBeDefined();
    });
  });

  it('should throw error if more than one offering is returned', () => {
    const result = ChurnInterventionByOfferingRawResultFactory({
      offerings: [
        ChurnInterventionByOfferingRawResultFactory().offerings[0],
        ChurnInterventionByOfferingRawResultFactory().offerings[0],
      ],
    });
    const util = new ChurnInterventionByOfferingResultUtil(result);
    expect(() => util.getTransformedChurnInterventionByOffering()).toThrow(
      'Unexpected number of offerings found for product and inverval. Expected 0 or 1, found 2.'
    );
  });

  it('should throw error if more than one churn intervention is returned', () => {
    const result = ChurnInterventionByOfferingRawResultFactory({
      offerings: [
        {
          ...ChurnInterventionByOfferingRawResultFactory().offerings[0],
          churnInterventions: [
            ChurnInterventionByOfferingRawResultFactory().offerings[0]
              .churnInterventions[0],
            ChurnInterventionByOfferingRawResultFactory().offerings[0]
              .churnInterventions[0],
          ],
        },
      ],
    });
    const util = new ChurnInterventionByOfferingResultUtil(result);
    expect(() => util.getTransformedChurnInterventionByOffering()).toThrow(
      'Unexpected number of churn interventions found for offering. Expected 1, found 2.'
    );
  });
});
