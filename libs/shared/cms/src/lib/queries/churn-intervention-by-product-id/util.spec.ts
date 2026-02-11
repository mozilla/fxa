/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  ChurnInterventionByProductIdChurnInterventionsResultFactory,
  ChurnInterventionByProductIdOfferingsResultFactory,
  ChurnInterventionByProductIdRawResultFactory,
  ChurnInterventionByProductIdResultUtil,
} from '.';
import * as Sentry from '@sentry/node';

jest.mock('@sentry/node', () => ({
  captureMessage: jest.fn(),
}));

describe('ChurnInterventionByProductIdResultUtil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should create a util from response', () => {
    const result = ChurnInterventionByProductIdRawResultFactory();
    const util = new ChurnInterventionByProductIdResultUtil(result);
    expect(util).toBeDefined();
    expect(util.churnInterventionByProductId.offerings).toHaveLength(1);
  });

  describe('getTransformedChurnInterventionByProductId', () => {
    let util: ChurnInterventionByProductIdResultUtil;

    beforeEach(() => {
      const result = ChurnInterventionByProductIdRawResultFactory();
      util = new ChurnInterventionByProductIdResultUtil(result);
    });

    it('should transform churn intervention by offering', () => {
      const transformed = util.getTransformedChurnInterventionByProductId()[0];
      expect(transformed).toBeDefined();
      expect(transformed?.productName).toBeDefined();
      expect(transformed?.webIcon).toBeDefined();
      expect(transformed?.supportUrl).toBeDefined();
      expect(transformed?.churnInterventionId).toBeDefined();
    });

    it('should capture sentry message if more than one offering is returned', () => {
      const result = ChurnInterventionByProductIdRawResultFactory({
        offerings: [
          ChurnInterventionByProductIdRawResultFactory().offerings[0],
          ChurnInterventionByProductIdRawResultFactory().offerings[0],
        ],
      });
      const util = new ChurnInterventionByProductIdResultUtil(result);
      util.getTransformedChurnInterventionByProductId();

      expect(Sentry.captureMessage).toHaveBeenCalledTimes(1);
    });

    it('should split termDetails and modalMessage into arrays', () => {
      const rawTermsDetails =
        'Term detail line 1.\nTerm detail line 2.\nTerm detail line 3.';
      const rawModalMessage = 'Modal message line 1.\nModal message line 2.';
      const result = ChurnInterventionByProductIdRawResultFactory({
        offerings: [
          ChurnInterventionByProductIdOfferingsResultFactory({
            churnInterventions: [
              {
                ...ChurnInterventionByProductIdChurnInterventionsResultFactory({
                  termsDetails: rawTermsDetails,
                  modalMessage: rawModalMessage,
                }),
                localizations: [],
              },
            ],
          }),
        ],
      });
      const util = new ChurnInterventionByProductIdResultUtil(result);
      const rawResult = util.churnInterventionByProductId;
      const transformed = util.getTransformedChurnInterventionByProductId()[0];

      expect(rawResult.offerings[0].churnInterventions[0].termsDetails).toBe(
        rawTermsDetails
      );
      expect(rawResult.offerings[0].churnInterventions[0].modalMessage).toBe(
        rawModalMessage
      );
      expect(transformed.termsDetails).toEqual([
        'Term detail line 1.',
        'Term detail line 2.',
        'Term detail line 3.',
      ]);
      expect(transformed.modalMessage).toEqual([
        'Modal message line 1.',
        'Modal message line 2.',
      ]);
    });
  });
});
